---
title: Multi-Tenancy
description: Serve different localization configurations per tenant, domain, or customer.
---

# Multi-Tenancy

Each tenant can have different default locales and URL structures:

```
https://customer1.com/about      → de (German default)
https://customer2.de/en/about    → en (English via path)
https://customer3.com/fr/about   → fr (French via path)
```

> [!TIP]
> This guide builds on URL pattern concepts. See [i18n Routing](./i18n-routing) for the fundamentals.

Multi-tenancy in i18n refers to serving different localization configurations. This is particularly useful when:

- You have multiple customer domains that need different default languages
- You're running a SaaS platform where each customer has their own subdomain
- Different sections of your app need different localization strategies

For example, you might want:

- `customer1.fr` to default to French with English as an option
- `customer2.com` to default to English with French as an option
- All other domains to use path-based localization (`/en/`, `/fr/`)

Multi-tenancy allows you to handle all these cases with a single configuration.

## Use Cases

- **Regional Businesses**: Different domains for different markets (e.g., `.fr` for France, `.de` for Germany)

- **White-Label Solutions**: Each client gets their own domain with specific language preferences

- **Enterprise Applications**: Different departments or subsidiaries need different language defaults

## Configuration

Use `urlPatterns` to define different routing rules per tenant domain:

```js
compile({
	project: "./project.inlang",
	outdir: "./src/paraglide",
	strategy: ["url", "baseLocale"],
	urlPatterns: [
		// Localhost for development (use path prefixes)
		{
			pattern: "http://localhost::port?/:path(.*)?",
			localized: [
				["fr", "http://localhost::port?/fr/:path(.*)?"],
				["en", "http://localhost::port?/:path(.*)?"],
			],
		},
		// customer1.fr => French default, English via /en/
		{
			pattern: "https://customer1.fr/:path(.*)?",
			localized: [
				["fr", "https://customer1.fr/:path(.*)?"],
				["en", "https://customer1.fr/en/:path(.*)?"],
			],
		},
		// customer2.com => English default, French via /fr/
		{
			pattern: "https://customer2.com/:path(.*)?",
			localized: [
				["en", "https://customer2.com/:path(.*)?"],
				["fr", "https://customer2.com/fr/:path(.*)?"],
			],
		},
	],
});
```

> [!NOTE]
> Adding `baseLocale` to the strategy array ensures a locale is always resolved, even if no pattern matches.

### Customer 1

- Localizing French to French:

  ```js
  localizeHref("https://customer1.fr/about", { locale: "fr" })
  // Output: "https://customer1.fr/about"
  ```

- Localizing from French to English:

  ```js
  localizeHref("https://customer1.fr/about", { locale: "en" })
  // Output: "https://customer1.fr/en/about"
  ```

- De-localizing English:
  ```js
  deLocalizeHref("https://customer1.fr/en/about");
  // Output: "https://customer1.fr/about"
  ```

### Customer 2

- Localizing English to English:

  ```js
  localizeHref("https://customer2.com/about", { locale: "en" })
  // Output: "https://customer2.com/about"
  ```

- Localizing from English to French:

  ```js
  localizeHref("https://customer2.com/about", { locale: "fr" })
  // Output: "https://customer2.com/fr/about"
  ```

- De-localizing French:
  ```js
  deLocalizeHref("https://customer2.com/fr/about");
  // Output: "https://customer2.com/about"
  ```

## Disabling Specific Locales for Tenants

You might need to restrict certain locales for specific tenants:

- Customer A only supports English and German
- Customer B only supports French and Spanish
- Customer C supports all locales

Redirect unsupported locales to a 404 page:

```js
compile({
	project: "./project.inlang",
	outdir: "./src/paraglide",
	strategy: ["url", "baseLocale"],
	urlPatterns: [
		// Customer1 - only supports en and de
		{
			pattern: "https://customer1.com/:path(.*)?",
			localized: [
				["en", "https://customer1.com/:path(.*)?"],
				["de", "https://customer1.com/de/:path(.*)?"],
				["fr", "https://customer1.com/404"],  // Unsupported → 404
				["es", "https://customer1.com/404"],
			],
		},
		// Customer2 - only supports fr and es
		{
			pattern: "https://customer2.com/:path(.*)?",
			localized: [
				["fr", "https://customer2.com/:path(.*)?"],
				["es", "https://customer2.com/es/:path(.*)?"],
				["en", "https://customer2.com/404"],  // Unsupported → 404
				["de", "https://customer2.com/404"],
			],
		},
		// Customer3 - supports all locales
		{
			pattern: "https://customer3.com/:path(.*)?",
			localized: [
				["en", "https://customer3.com/:path(.*)?"],
				["de", "https://customer3.com/de/:path(.*)?"],
				["fr", "https://customer3.com/fr/:path(.*)?"],
				["es", "https://customer3.com/es/:path(.*)?"],
			],
		},
	],
});
```

When a user tries to access a URL with an unsupported locale for a specific tenant, they will be redirected to the 404 page:

```js
// Customer1 doesn't support French
localizeHref("https://customer1.com/about", { locale: "fr" })
// Output: "https://customer1.com/404"

// Customer2 doesn't support German
localizeHref("https://customer2.com/about", { locale: "de" })
// Output: "https://customer2.com/404"

// Customer3 supports all locales
localizeHref("https://customer3.com/about", { locale: "fr" })
// Output: "https://customer3.com/fr/about"
```

This approach allows you to:

1. Define tenant-specific locale support
2. Gracefully handle unsupported locale requests
3. Maintain a consistent user experience across your multi-tenant application



## Tenant-Specific Locale Switchers

Only display locales that the current tenant supports. This prevents users from clicking links that lead to 404 pages.

Filter available locales based on the current tenant before rendering your switcher. In production, this mapping typically comes from a config file or API rather than hardcoded values.

#### React

```jsx
import { localizeHref, getLocale } from "./paraglide/runtime.js";

const TENANT_LOCALES = {
  "customer1.com": ["en", "de"],
  "customer2.com": ["fr", "es"],
  "customer3.com": ["en", "de", "fr", "es"],
};

function LanguageSwitcher() {
  const hostname = window.location.hostname;
  const currentLocale = getLocale();
  const supportedLocales = TENANT_LOCALES[hostname] ?? ["en"];

  return (
    <div className="language-switcher">
      {supportedLocales.map(locale => (
        <a
          key={locale}
          href={localizeHref(window.location.href, { locale })}
          aria-current={locale === currentLocale ? "page" : undefined}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
```

