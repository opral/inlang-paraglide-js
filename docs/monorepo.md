---
title: Monorepo Setup
description: How to set up Paraglide in a monorepo - shared translations with isolated compiler options.
---

# Monorepo Setup

Two patterns for using Paraglide in a monorepo:

|                             | Pattern 1 | Pattern 2 |
| --------------------------- | :-------: | :-------: |
| Shared translations         |     ✓     |     ✓     |
| Per-package strategy/config |     ✓     |     ✗     |
| Single compile step         |     ✗     |     ✓     |

**Use Pattern 1** unless you specifically need a single compilation step.

## Pattern 1: Each Package Compiles (Recommended)

Create one `project.inlang` with your messages, then compile in each consuming package.

```diff
monorepo/
+ project.inlang/           # Shared inlang project
+ messages/
+   en.json
+   de.json
  packages/
    web/
      src/paraglide/        # Generated here
      vite.config.ts
    mobile/
      src/paraglide/        # Generated here
      vite.config.ts
```

Each package compiles from the shared project (see [Compiling Messages](./compiling-messages) for all options):

```bash
# From packages/web
npx @inlang/paraglide-js compile --project ../../project.inlang --outdir ./src/paraglide

# From packages/mobile (different strategy)
npx @inlang/paraglide-js compile --project ../../project.inlang --outdir ./src/paraglide --strategy cookie,baseLocale
```

## Pattern 2: Shared i18n Package

Create a dedicated i18n package that compiles once. Other packages import from it.

> [!WARNING]
> All consuming packages must use the same locale detection strategy since compilation happens once. If your web app needs URL-based routing while your mobile app needs cookie-based detection, use Pattern 1 instead.

```
monorepo/
  packages/
    i18n/                   # Shared i18n package
      project.inlang/
      messages/
      src/paraglide/        # Generated once here
      package.json
    web/                    # Imports from @myorg/i18n
    mobile/                 # Imports from @myorg/i18n
```

```json
// packages/i18n/package.json
{
	"name": "@myorg/i18n",
	"devDependencies": {
		"@inlang/paraglide-js": "latest"
	},
	"scripts": {
		"build": "paraglide-js compile --project ./project.inlang --outdir ./src/paraglide --emit-ts-declarations"
	},
	"exports": {
		"./messages": "./src/paraglide/messages.js",
		"./runtime": "./src/paraglide/runtime.js"
	}
}
```

> [!NOTE]
> The `--emit-ts-declarations` flag generates `.d.ts` files so TypeScript consumers get proper type checking. This requires the `typescript` package to be installed.

```ts
// packages/web/src/app.ts
import * as m from "@myorg/i18n/messages";
import { getLocale } from "@myorg/i18n/runtime";
```

## See Also

- [Compiling Messages](./compiling-messages) - CLI, bundler plugins, and programmatic compilation
- [Strategy Configuration](./strategy) - Configure locale detection strategies
