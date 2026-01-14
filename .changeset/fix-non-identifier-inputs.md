---
"@inlang/paraglide-js": patch
---

Fix message compilation for input names with non-identifier characters (like `half!`).

Before: i18next-style placeholders with symbols produced invalid JS because we emitted `i.half!` in patterns, local variables, and match conditions (syntax error).
Now: Paraglide quotes the key in JSDoc and uses bracket access in generated code (e.g. `i["half!"]`), so the same message compiles and runs correctly.

```diff
-// before (invalid JS)
-// input: { "half!": "1st" }
-return `${i.half!} Half - Corner Handicap`
+// after (valid JS)
+// input: { "half!": "1st" }
+return `${i["half!"]} Half - Corner Handicap`
```

Issue: https://github.com/opral/paraglide-js/issues/514
