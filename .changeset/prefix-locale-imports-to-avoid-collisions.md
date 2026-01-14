---
"@inlang/paraglide-js": patch
---

Avoid locale/message name collisions in the locale-modules output structure by prefixing locale imports.

Previously, a locale like `no` could collide with a message key `no`, causing duplicate symbol errors in the generated `messages/_index.js`.
Now, locale imports are prefixed (e.g. `__no`), keeping message exports intact and avoiding the conflict.

Issue: https://github.com/opral/paraglide-js/issues/492
