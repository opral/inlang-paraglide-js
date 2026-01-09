---
title: Monorepo Setup
description: How to set up Paraglide in a monorepo - shared translations with isolated compiler options.
---

# Monorepo Setup

Two patterns for using Paraglide in a monorepo:

|                           | Pattern 1 | Pattern 2 |
| ------------------------- | :-------: | :-------: |
| Shared translations       |     ✓     |     ✓     |
| Isolated compiler options |     ✓     |     ✗     |
| Single compile step       |     ✗     |     ✓     |

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

Each package compiles from the shared project (see [Compiling Messages](./compiling-messages.md) for all options):

```bash
# From packages/web
npx @inlang/paraglide-js compile --project ../../project.inlang --outdir ./src/paraglide

# From packages/mobile (different strategy)
npx @inlang/paraglide-js compile --project ../../project.inlang --outdir ./src/paraglide --strategy cookie,baseLocale
```

## Pattern 2: Shared i18n Package

Create a dedicated i18n package that compiles once. Other packages import from it.

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
	"scripts": {
		"build": "paraglide-js compile --project ./project.inlang --outdir ./src/paraglide"
	},
	"exports": {
		"./messages": "./src/paraglide/messages.js",
		"./runtime": "./src/paraglide/runtime.js"
	}
}
```

```ts
// packages/web/src/app.ts
import * as m from "@myorg/i18n/messages";
import { getLocale } from "@myorg/i18n/runtime";
```

## See Also

- [Compiling Messages](./compiling-messages.md) - CLI, bundler plugins, and programmatic compilation
- [Strategy Configuration](./strategy.md) - Configure locale detection strategies
