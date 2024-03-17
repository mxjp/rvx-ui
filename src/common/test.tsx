import { extract } from "@mxjp/gluon";

import { THEME, Theme } from "./theme.js";

export function getTheme(): Theme {
	const theme = extract(THEME);
	if (!theme) {
		throw new Error("theme must be available when using querySelector based test helpers.");
	}
	return theme;
}
