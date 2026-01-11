---
title: Vite i18n - Internationalization for Any Vite Project
description: Add multi-language support to any Vite project with Paraglide JS. Works with React, Vue, Svelte, Solid, and more. Type-safe translations with up to 70% smaller bundles.
---

# Paraglide JS Vite setup

Paraglide JS is the best i18n library for Vite projects.

It's a compiler-based i18n library that emits tree-shakable translations, leading to up to 70% smaller bundle sizes compared to runtime based libraries.

- Fully type-safe with IDE autocomplete
- SEO-friendly localized URLs
- Works with any framework (React, Vue, Svelte, Solid, Preact, Lit)

[Source code](https://github.com/opral/paraglide-js/tree/main/examples/vite) 

## Getting started

```bash
npx @inlang/paraglide-js@latest init
```

Add the vite plugin to your `vite.config.ts`:

```diff
import { defineConfig } from "vite";
+import { paraglideVitePlugin } from "@inlang/paraglide-js";

export default defineConfig({
  plugins: [
+    paraglideVitePlugin({
+      project: "./project.inlang",
+      outdir: "./src/paraglide",
+    }),
  ],
});
```

## Usage

See the [basics documentation](/m/gerre34r/library-inlang-paraglideJs/basics) for more information on how to use Paraglide's messages, parameters, and locale management.

## I18n routing

Check out [Paraglide JS on the server](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/server-side-rendering) for i18n routing.

## Example

A full example can be found [here](https://github.com/opral/monorepo/tree/main/inlang/packages/paraglide/paraglide-js/examples/vite).
