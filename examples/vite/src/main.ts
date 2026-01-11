import { m } from "./paraglide/messages.js";
import { getLocale, setLocale, locales } from "./paraglide/runtime.js";

// This should be removed by the compiler
// (can be verified by inspecting the output in dist)
m.unused();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>${m.greeting({ name: "John Doe" })}</h1>
    <p>Current locale: <strong>${getLocale()}</strong></p>
    <div>
      ${locales
        .map(
          (locale) =>
            `<button data-locale="${locale}" ${locale === getLocale() ? "disabled" : ""}>${locale.toUpperCase()}</button>`
        )
        .join(" ")}
    </div>
  </div>
`;

// Add click handlers for locale switching
document.querySelectorAll<HTMLButtonElement>("button[data-locale]").forEach((button) => {
  button.addEventListener("click", () => {
    const locale = button.dataset.locale as "en" | "de";
    setLocale(locale);
  });
});
