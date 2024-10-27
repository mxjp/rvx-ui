import { ClassValue, Expression, StyleValue } from "rvx";

import { THEME } from "../common/theme.js";
import { uniqueId } from "rvx/id";

export function Label(props: {
	class?: ClassValue;
	style?: StyleValue;
	for?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <label
		class={[
			theme?.label,
			props.class,
		]}
		style={props.style}
		for={props.for}
		id={props.id}
	>
		{props.children}
	</label>;
}

export function LabelFor(props: {
	class?: ClassValue;
	style?: StyleValue;
	label: unknown;
	children: (id: string) => unknown;
}): unknown {
	const id = uniqueId();
	return <>
		<Label class={props.class} style={props.style} for={id}>{props.label}</Label>
		{props.children(id)}
	</>;
}
