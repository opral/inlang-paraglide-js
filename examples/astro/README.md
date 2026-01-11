---
title: Astro i18n - Lightweight Internationalization for Content Sites
description: Add multi-language support to your Astro site with Paraglide JS. Type-safe translations, localized routing, and up to 70% smaller bundles than traditional i18n libraries.
image: https://cdn.jsdelivr.net/gh/opral/paraglide-js@latest/examples/astro/assets/banner.png
---

<img src="https://cdn.jsdelivr.net/gh/opral/paraglide-js@latest/examples/astro/assets/banner.png" alt="i18n library for astro" width="10000000px" />

This example demonstrates how to use Paraglide JS with Astro in SSR mode. The source code can be found [here](https://github.com/opral/paraglide-js/tree/main/examples/astro).


| Feature      | Supported |
| ------------ | --------- |
| CSR          | ✅        |
| SSR          | ✅        |
| SSG          | ❌        |
| URLPattern   | ✅        |
| Any Strategy | ✅        |

> [!NOTE]
> You can integrate Paraglide JS yourself to achieve SSG. PR with an example is welcome.

## Setup

### 1. If you have not initialized Paraglide JS yet, run:

```bash
npx @inlang/paraglide-js@latest init
```

### 2. Add the vite plugin to the `astro.config.mjs` file and set `output` to `server`:

```diff
import { defineConfig } from "astro/config";
+import { paraglideVitePlugin } from "@inlang/paraglide-js";
+import node from "@astrojs/node";

export default defineConfig({
  // ... other
+	vite: {
+		plugins: [
+			paraglideVitePlugin({
+				project: "./project.inlang",
+				outdir: "./src/paraglide",
+			}),
+		],
	},
+  output: "server",
+  adapter: node({ mode: "standalone" }),
});
```

### 3. Create or add the paraglide js server middleware to the `src/middleware.ts` file:

```diff
import { paraglideMiddleware } from "./paraglide/server.js";

export const onRequest = defineMiddleware((context, next) => {
+	return paraglideMiddleware(context.request, () => next());
});
```

You can read more about about Astro's middleware [here](https://docs.astro.build/en/guides/middleware).

## Usage

See the [basics documentation](/m/gerre34r/library-inlang-paraglideJs/basics) for more information on how to use Paraglide's messages, parameters, and locale management.

## Disabling AsyncLocalStorage in serverless environments

You can disable async local storage in serverless environments by using the `disableAsyncLocalStorage` option.

> [!WARNING]
> This is only safe in serverless environments where each request gets its own isolated runtime context. Using it in multi-request server environments could lead to data leakage between concurrent requests.


```diff
	vite: {
		plugins: [
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
+				disableAsyncLocalStorage: true,
			}),
		],
	},
```
