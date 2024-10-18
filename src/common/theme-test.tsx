import { extract } from "rvx";

import { THEME, Theme } from "./theme.js";

/**
 * Get a class name from the current theme.
 *
 * @throws An error if the current theme doesn't support the specified key.
 */
export function themeClass(key: keyof Theme): string {
	const theme = extract(THEME);
	if (!theme) {
		throw new Error("theme is not available in the current context");
	}
	const value = theme[key];
	if (value === undefined) {
		throw new Error(`${key} is not supported by the current theme`);
	}
	return value;
}
