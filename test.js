const assert = require("node:assert");
const { parseIngressRoute } = require("./resources/traefik-ingressroute/traefik-ingressroute.js");

const sample = {
  spec: {
    entryPoints: ["websecure"],
    tls: { secretName: "wildcard-cert" },
    routes: [
      {
        kind: "Rule",
        match: "PathPrefix(`/accountservice`)",
        priority: 10,
        services: [{ kind: "TraefikService", name: "accountservice", port: 80, weight: 1 }],
        middlewares: [{ name: "strip-prefix" }, { name: "auth", namespace: "default" }],
      },
    ],
  },
};

const result = parseIngressRoute(sample);
assert.deepStrictEqual(result.entryPoints, ["websecure"]);
assert.strictEqual(result.tls.secretName, "wildcard-cert");
assert.strictEqual(result.routes.length, 1);
assert.strictEqual(result.routes[0].match, "PathPrefix(`/accountservice`)");
assert.strictEqual(result.routes[0].services[0].name, "accountservice");
assert.deepStrictEqual(result.routes[0].middlewares, ["strip-prefix", "default/auth"]);

// no spec at all shouldn't throw
assert.deepStrictEqual(parseIngressRoute({}).routes, []);

console.log("ok");
