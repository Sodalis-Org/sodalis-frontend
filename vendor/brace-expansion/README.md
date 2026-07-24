# Vendored brace-expansion@5.0.8

Patched release for [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
with a CommonJS default-export shim (`compat.cjs`) so `minimatch@3` (pulled in by
eslint plugins) keeps working. Forced via `package.json` `overrides`.
