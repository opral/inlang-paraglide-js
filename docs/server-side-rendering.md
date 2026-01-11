---
imports:
  - https://cdn.jsdelivr.net/npm/@opral/markdown-wc-doc-elements/dist/doc-video.js
---

# Server Side Rendering (SSR) / Static Site Generation (SSG)

Paraglide JS provides first-class support for server-side rendering (SSR) and static site generation (SSG) through the `paraglideMiddleware()`.

> [!TIP]
> For middleware setup, framework examples, and troubleshooting, see the [Middleware Guide](./middleware-guide).

## Server Side Rendering (SSR)

Setting up the `paraglideMiddleware()` automatically enables server-side rendering (SSR) for your application:

```ts
import { paraglideMiddleware } from './paraglide/server.js';

app.get("*", async (request) => {
  return paraglideMiddleware(request, async ({ request, locale }) => {
    return new Response(html(request));
  });
});
```

The middleware handles locale detection, URL delocalization, and request isolation automatically. See the [Middleware Guide](./middleware-guide) for details.

<doc-video src="https://youtu.be/RO_pMjSHgpI"></doc-video>

## Static Site Generation (SSG)

Your framework of choice (e.g. Next.js, SvelteKit, etc.) needs to know the localized URLs of your pages to generate them during build time.

```diff
https://example.com/about
+https://example.com/de/about
+https://example.com/fr/about
```

Several possibilities exist to communicate these URLs to your framework:

### Site crawling (invisible anchor tags)

Some static site generators crawl your site during build time by following anchor tags to discover all pages. You can leverage this behavior to ensure all localized URLs of your pages are generated:

1. Add invisible anchor tags in the root layout of your application for each locale
2. Ensure the `paraglideMiddleware()` is called

_You can adapt the example beneath to any other framework_

```tsx
import { locales, localizeHref } from "./paraglide/runtime.js";

// in the root layout
function Layout({ children }) {
  return (
    <>
      <div>{children}</div>
      {/* add invisible anchor tags for the currently visible page in each locale */}
      <div style="display: none">
        {locales.map((locale) => (
          <a href={localizeHref(`/about`, { locale })}></a>
        ))}
      </div>
    </>
  )
}
```

The rendered HTML of the page will include the invisible anchor tags, ensuring they are generated during build time. The framework will crawl the HTML and follow the anchor tags to discover all pages.

```diff
<div>
  <p>My Cool Website
</div>
+<div style="display: none">
+  <a href="/de/about"></a>
+  <a href="/fr/about"></a>
+</div>
```

### Programmatic Discovery

If invisible anchor tags are not an option, some frameworks provide APIs to discover the localized URLs during build time. Figure out which API your framework provides and adapt the example above accordingly.

- **Next.js** has [generateStaticParams()](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) API to discover all localized URLs.
- **Astro** has [getStaticPaths()](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)

## See Also

- [Middleware Guide](./middleware-guide) - Framework examples, troubleshooting, AsyncLocalStorage
- [Strategy Configuration](./strategy) - Configure locale detection strategies
- [i18n Routing](./i18n-routing) - URL patterns, translated pathnames, domain-based routing
