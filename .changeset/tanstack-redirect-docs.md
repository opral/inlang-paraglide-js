---
"@inlang/paraglide-js": patch
---

Add documentation for avoiding redirect loops with frameworks that handle URL localization themselves (e.g., TanStack Router).

- Added JSDoc example in `paraglideMiddleware()` explaining when to use the original request vs the modified request
- Added troubleshooting section in SSR docs explaining the redirect loop issue and solution
- Updated TanStack Start example README with an important callout about using the original request
