# Objects and Arrays

## Use case

You have a list of items that varies by locale. For example, a feature list where different languages might have different items:

```tsx
// You want to render something like this
{features.map((feature) => (
  <li>{feature}</li>
))}
```

In English, you might have 3 features. In German, you might have 4. You need a way to store and retrieve these as arrays.

## Solution

Store the array as a JSON string in your messages file and parse it at runtime with `JSON.parse()`:

```json
// messages/en.json
{
  "features": "[\"Fast\", \"Secure\", \"Easy to use\"]"
}
```

```json
// messages/de.json
{
  "features": "[\"Schnell\", \"Sicher\", \"Einfach\", \"Zuverlässig\"]"
}
```

```ts
import { m } from "./paraglide/messages.js";

const features: string[] = JSON.parse(m.features());
// en -> ["Fast", "Secure", "Easy to use"]
// de -> ["Schnell", "Sicher", "Einfach", "Zuverlässig"]
```

Objects are supported with the `inlang-message-format` plugin as of the brace-escaping update. Escape literal `{` and `}` as `\{` and `\}`, and escape backslashes as `\\`. Because this is JSON, you must double-escape backslashes.

```json
{
  "pricing": "\\{\"basic\": \"$9/mo\", \"pro\": \"$29/mo\"\\}"
}
```

```ts
const pricing = JSON.parse(m.pricing());
// -> { basic: "$9/mo", pro: "$29/mo" }
```

If you need a format that's easier for translators to edit, encode objects as arrays of entries instead:

```json
{
  "pricing_entries": "[[\"basic\", \"$9/mo\"], [\"pro\", \"$29/mo\"]]"
}
```

```ts
const pricing = Object.fromEntries(
  JSON.parse(m.pricing_entries()) as Array<[string, string]>
);
// -> { basic: "$9/mo", pro: "$29/mo" }
```

This keeps the translation value as plain text, but it also means the JSON must be valid (double quotes, escaped as needed) and you cannot use message-format features like interpolation inside the JSON blob.

> [!NOTE]
> If you need interpolation in array items, use separate message keys:
>
> ```json
> // messages/en.json
> {
>   "step_0": "Welcome, {name}!",
>   "step_1": "You have {count} items in your cart",
>   "step_2": "Proceed to checkout"
> }
> ```
>
> ```ts
> const steps = [
>   m.step_0({ name: "Alex" }),
>   m.step_1({ count: 3 }),
>   m.step_2(),
> ];
> ```

## Comparison with i18next

i18next has a `returnObjects` option that returns arrays directly:

```js
// i18next
t('features', { returnObjects: true })
```

Paraglide uses `JSON.parse()` instead:

```ts
// Paraglide
JSON.parse(m.features())
```

### Why Paraglide doesn't have `returnObjects`

i18next's `returnObjects` treats arrays in translation files as JavaScript code. This creates problems for translators.

Translation tools like Crowdin, Phrase, and Lokalise expect simple key-value strings:

```
┌─────────────────┬─────────────────────┐
│ Key             │ Value               │
├─────────────────┼─────────────────────┤
│ greeting        │ Hello world         │
│ farewell        │ Goodbye             │
└─────────────────┴─────────────────────┘
```

With `returnObjects`, translators see JavaScript syntax instead:

```
┌─────────────────┬─────────────────────────────────────┐
│ Key             │ Value                               │
├─────────────────┼─────────────────────────────────────┤
│ features        │ ["Fast", "Secure", "Easy to use"]   │
└─────────────────┴─────────────────────────────────────┘
```

The translator must preserve `["`, `"`, `,`, and `"]` exactly. A small mistake breaks your app:

```tsx
// Your code
const features = t('features', { returnObjects: true })
features.map((f) => <li>{f}</li>)
```

```diff
// Translator accidentally removes a quote
- ["Fast", "Secure", "Easy to use"]
+ ["Schnell", "Sicher, "Einfach"]
```

```
// Runtime crash - features is undefined due to invalid syntax
TypeError: Cannot read properties of undefined (reading 'map')
```

The same problem can occur with Paraglide's `JSON.parse()` approach—a translator could still break the JSON syntax. The difference is that Paraglide doesn't build this into the API. Using `JSON.parse()` is a deliberate escape hatch that you, the developer, choose to use. You're explicitly opting into the risk rather than having it be a default feature of the library that needs to be maintained by the library author.
