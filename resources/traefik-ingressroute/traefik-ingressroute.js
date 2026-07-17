// ArgoCD resource-tab extension: renders a Traefik IngressRoute's own spec
// (entryPoints, routes, services, middlewares, tls) as a readable table.
// Loaded by the argocd-extension-installer, registered via window.extensionsAPI.
// Docs: https://argo-cd.readthedocs.io/en/stable/developer-guide/ui-extensions/
(function () {
  function asArray(v) {
    return Array.isArray(v) ? v : [];
  }

  // ponytail: reads only the IngressRoute's own spec, no k8s API calls for
  // referenced Middleware objects. Add resolution if seeing middleware names
  // stops being enough.
  function parseIngressRoute(resource) {
    var spec = (resource && resource.spec) || {};
    var tls = spec.tls
      ? {
          secretName: spec.tls.secretName || null,
          certResolver: spec.tls.certResolver || null,
        }
      : null;

    var routes = asArray(spec.routes).map(function (route) {
      return {
        match: route.match || "",
        kind: route.kind || "Rule",
        priority: route.priority || null,
        services: asArray(route.services).map(function (svc) {
          return {
            name: svc.name || "",
            kind: svc.kind || "Service",
            port: svc.port != null ? String(svc.port) : "",
            weight: svc.weight != null ? String(svc.weight) : null,
          };
        }),
        middlewares: asArray(route.middlewares).map(function (mw) {
          return mw.namespace ? mw.namespace + "/" + mw.name : mw.name;
        }),
      };
    });

    return {
      entryPoints: asArray(spec.entryPoints),
      tls: tls,
      routes: routes,
    };
  }

  var cellStyle = { padding: "4px 8px", verticalAlign: "top", borderBottom: "1px solid #eee" };
  var headStyle = { padding: "4px 8px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #ccc" };

  function Component(props) {
    var info = parseIngressRoute(props.resource);
    var h = window.React.createElement;

    var header = h(
      "div",
      { style: { marginBottom: "12px" } },
      h("b", null, "Entry points: "),
      info.entryPoints.length ? info.entryPoints.join(", ") : "(default)",
      info.tls
        ? h(
            "div",
            null,
            h("b", null, "TLS: "),
            info.tls.secretName ? "secret " + info.tls.secretName : "",
            info.tls.certResolver ? " via " + info.tls.certResolver : ""
          )
        : null
    );

    var rows = info.routes.map(function (route, i) {
      return h(
        "tr",
        { key: i },
        h("td", { style: cellStyle }, route.kind),
        h("td", { style: cellStyle }, route.match),
        h("td", { style: cellStyle }, route.priority || ""),
        h(
          "td",
          { style: cellStyle },
          route.services
            .map(function (s) {
              return s.name + (s.port ? ":" + s.port : "") + (s.weight ? " (weight " + s.weight + ")" : "") + " [" + s.kind + "]";
            })
            .join(", ")
        ),
        h("td", { style: cellStyle }, route.middlewares.join(", "))
      );
    });

    var table = h(
      "table",
      { style: { width: "100%", borderCollapse: "collapse" } },
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { style: headStyle }, "Kind"),
          h("th", { style: headStyle }, "Match"),
          h("th", { style: headStyle }, "Priority"),
          h("th", { style: headStyle }, "Services"),
          h("th", { style: headStyle }, "Middlewares")
        )
      ),
      h("tbody", null, rows)
    );

    return h("div", { style: { padding: "10px" } }, header, table);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parseIngressRoute: parseIngressRoute };
  }
  if (typeof window !== "undefined" && window.extensionsAPI) {
    window.extensionsAPI.registerResourceExtension(Component, "traefik.io", "IngressRoute", "Routes", { icon: "fa-route" });
  }
})();