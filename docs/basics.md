---
title: Basics
description: How to use Paraglide JS - importing messages, using parameters, and managing locales.
---

# Basics

## Using messages

Import messages from the generated `messages.js` file:

```js
import { m } from "./paraglide/messages.js";

m.hello_world(); // "Hello World!"
```

## Parameters

Pass parameters as an object:

```js
// messages/en.json: { "greeting": "Hello {name}!" }

m.greeting({ name: "Samuel" }); // "Hello Samuel!"
```

## Getting and setting the locale

```js
import { getLocale, setLocale } from "./paraglide/runtime.js";

getLocale(); // "en"
setLocale("de"); // Changes locale and reloads page
```

To change without reload (you'll need to handle UI updates yourself):

```js
setLocale("de", { reload: false });
```

## Forcing a locale

Override the locale for a specific message:

```js
m.greeting({ name: "Samuel" }, { locale: "de" }); // "Hallo Samuel!"
```

> [!TIP]
> Useful for server-side rendering where you might need to render content in multiple languages.

## Routing

Use `localizeHref()` for URL localization:

```tsx
import { localizeHref } from "./paraglide/runtime.js";

<a href={localizeHref("/blog")}>Blog</a>
```

> [!NOTE]
> If you route to a different locale, ensure a reload happens afterwards. See [switching locales via links](./errors#switching-locales-via-links-doesnt-work).

---

## Adding messages

Messages are stored in `messages/{locale}.json`:

```json
// messages/en.json
{
  "greeting": "Hello {name}!"
}
```

```json
// messages/de.json
{
  "greeting": "Hallo {name}!"
}
```

> [!NOTE]
> These examples use the default inlang message format. Paraglide works with any format plugin—see the [plugin directory](https://inlang.com/c/plugins).

## Adding locales

Add locales in `project.inlang/settings.json`:

```json
{
  "baseLocale": "en",
  "locales": ["en", "de", "fr"]
}
```

---

## Additional features

### Message keys

Paraglide supports nested keys through bracket notation but recommends flat keys:

```json
{
  "user_profile_title": "User Profile",
  "user": { "profile": { "title": "User Profile" } }
}
```

```js
m.user_profile_title();       // Recommended
m["user.profile.title"]();    // Also works
```

See [message keys](./message-keys) for best practices.

### Dynamic messages

Specify messages beforehand to preserve tree-shaking:

```ts
const messages = {
  greeting: m.greeting,
  goodbye: m.goodbye,
};

messages["greeting"](); // "Hello World!"
```

### Type-safe localized strings

Message functions return `LocalizedString`, a branded type that helps TypeScript distinguish translated from untranslated strings:

```ts
import type { LocalizedString } from "./paraglide/runtime.js";

function PageTitle(props: { title: LocalizedString }) {
  return <h1>{props.title}</h1>;
}

<PageTitle title={m.welcome_title()} />  // ✅
<PageTitle title="Welcome" />            // ❌ Type error
```

## Next steps

- [Strategy](./strategy) - Configure locale detection
- [Middleware](./middleware-guide) - Server-side integration
- [Server-side rendering](./server-side-rendering) - SSR/SSG setup
