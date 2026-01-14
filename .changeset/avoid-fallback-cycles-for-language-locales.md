---
"@inlang/paraglide-js": patch
---

Avoid cyclic fallback maps when a language-only locale exists alongside a regional base locale.

Previously, a setup like `locales: ["it", "it-IT"]` with `baseLocale: "it-IT"` could create a fallback cycle (`it → it-IT → it`) and throw a runtime error. The compiler now breaks that cycle by making the `baseLocale` terminal, so `it-IT` no longer falls back to `it` while `it` still falls back to `it-IT`.

Issue: https://github.com/opral/paraglide-js/issues/544
