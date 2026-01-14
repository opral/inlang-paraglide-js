---
"@inlang/paraglide-js": patch
---

Avoid cyclic fallback maps when a language-only locale exists alongside a regional base locale.

Previously, a setup like `locales: ["it", "it-IT"]` with `baseLocale: "it-IT"` could create a fallback cycle (`it → it-IT → it`) and throw a runtime error. The compiler now breaks that cycle by not falling back from the language-only locale to its regional base.

Issue: https://github.com/opral/paraglide-js/issues/544
