import { m } from "./paraglide/messages.js";
import i18next from "i18next";
import HttpApi from "i18next-http-backend";

await i18next.use(HttpApi).init({
	lng: "en",
	backend: {
		loadPath: "../locales/{{lng}}.json",
	},
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <p>Paraglide: ${m.greeting({ name: "Max Mustermann" })}</p>
    <p>i18next: ${i18next.t("greeting", { name: "Max Mustermann" })}</p>
    <!-- Issue #514: non-identifier placeholders like "half!" -->
    <p>Paraglide (handicap): ${m["handicap-half-corner-winner"]({ "half!": "1st" })}</p>
    <p>i18next (handicap): ${i18next.t("handicap-half-corner-winner", { "half!": "1st" })}</p>
  </div>
`;
