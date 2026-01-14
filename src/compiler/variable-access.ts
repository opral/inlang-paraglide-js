import { escapeForDoubleQuoteString } from "../services/codegen/escape.js";

const identifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function isValidIdentifier(name: string): boolean {
	return identifierPattern.test(name);
}

export function quotePropertyKey(name: string): string {
	return `"${escapeForDoubleQuoteString(name)}"`;
}

export function compileInputAccess(name: string): string {
	if (isValidIdentifier(name)) {
		return `i?.${name}`;
	}
	return `i?.[${quotePropertyKey(name)}]`;
}
