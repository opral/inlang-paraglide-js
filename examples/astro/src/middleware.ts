import { paraglideMiddleware } from "./paraglide/server";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	// Avoid consuming bodies for non-GET/HEAD requests
	// https://github.com/opral/paraglide-js/issues/564
	if (context.request.method !== "GET" && context.request.method !== "HEAD") {
		return next(context.request);
	}
	return paraglideMiddleware(context.request, ({ request }) => next(request));
});
