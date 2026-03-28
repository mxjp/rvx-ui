import { ClassValue, Expression, StyleValue } from "rvx";
import styles from "@rvx/ui/theme/components/heading.module.css";

export type HeadingLevel = "1" | "2" | "3" | "4" | "5" | "6";

export function Heading(props: {
	level: HeadingLevel;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const Tag = `h${props.level}`;
	return <Tag
		class={[styles.heading, props.class]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</Tag>;
}

/**
 * Get the next nested heading level.
 */
export function getNestedHeadingLevel(level: HeadingLevel): HeadingLevel {
	const l = Number(level) + 1;
	return l > 6 ? "6" : String(l) as HeadingLevel;
}
