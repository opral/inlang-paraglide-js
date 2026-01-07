---
"@inlang/paraglide-js": patch
---

Added a defensive try catch request cloning in `paraglideMiddleware` for runtimes with custom `Request` wrappers (TanStack Start 1.143+: https://github.com/TanStack/router/issues/6089, https://github.com/opral/paraglide-js/issues/573).
