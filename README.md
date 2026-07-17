# argocd-traefik-extension

An [ArgoCD UI extension](https://argo-cd.readthedocs.io/en/stable/developer-guide/ui-extensions/)
that adds a **Routes** tab to [Traefik](https://traefik.io) `IngressRoute` resources, rendering
entry points, TLS, match rules, target services, and middlewares straight from the resource's own
spec — no external API calls, no backend.

## Install

Enable extensions and register this one via the
[argo-cd Helm chart](https://github.com/argoproj/argo-helm) (uses
[argocd-extension-installer](https://github.com/argoproj-labs/argocd-extension-installer) under
the hood):

```yaml
server:
  extensions:
    enabled: true
    extensionList:
      - name: traefik-ingressroute
        env:
          - name: EXTENSION_URL
            value: https://github.com/next-gen-infrastructure/argocd-traefik-extension/releases/download/v0.1.1/extension.tar.gz
          - name: EXTENSION_CHECKSUM_URL
            value: https://github.com/next-gen-infrastructure/argocd-traefik-extension/releases/download/v0.1.1/extension_checksums.txt
```

Swap `v0.1.1` for the release you want — see [Releases](../../releases) for available versions.

## Develop

```bash
node test.js   # unit test for the spec-parsing logic
./build.sh     # runs the test, then packages resources/ into extension.tar.gz + extension_checksums.txt
```

`resources/traefik-ingressroute/extension.js` is the whole extension: plain JS, no
build step, using the `window.React` / `window.extensionsAPI` globals ArgoCD's UI already
provides.

## Release

Push a tag matching `v*` (e.g. `git tag v0.2.0 && git push origin v0.2.0`). The
[release workflow](.github/workflows/release.yml) builds the package and attaches
`extension.tar.gz` + `extension_checksums.txt` to a GitHub Release automatically.

## Scope

Only reads the `IngressRoute`'s own spec — referenced `Middleware` objects are shown by name, not
resolved/expanded. Open an issue or PR if you need that.

## License

[Apache-2.0](LICENSE)
