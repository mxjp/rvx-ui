import { ClassValue, createElement, Expression, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";

export type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";

export function Heading(props: {
	level: HeadingLevel;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return createElement(`h${props.level}`, {
		class: [
			theme?.heading,
			props.class,
		],
		style: props.style,
		id: props.id,
	}, props.children);
}

/**
 * Get the next nested heading level.
 */
export function getNestedHeadingLevel(level: HeadingLevel): HeadingLevel {
	const l = Number(level) + 1;
	return l > 6 ? "6" : String(l) as HeadingLevel;
}
