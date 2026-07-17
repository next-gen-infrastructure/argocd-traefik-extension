#!/usr/bin/env bash
# Packages resources/ into the tar.gz + checksum file layout expected by
# quay.io/argoprojlabs/argocd-extension-installer (EXTENSION_URL / EXTENSION_CHECKSUM_URL).
set -euo pipefail
cd "$(dirname "$0")"

node test.js

tar -czf extension.tar.gz resources

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum extension.tar.gz > extension_checksums.txt
else
  shasum -a 256 extension.tar.gz > extension_checksums.txt
fi

echo "built extension.tar.gz + extension_checksums.txt"
