import { ClassValue, Expression, StyleValue } from "rvx";
import { ID_PAIR } from "../common/id-pairs.js";
import { THEME } from "../common/theme.js";

export function Label(props: {
	class?: ClassValue;
	style?: StyleValue;
	for?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	const idFor = props.for ?? ID_PAIR.current.prefix();
	return <label
		class={[
			theme?.label,
			props.class,
		]}
		style={props.style}
		for={idFor}
		id={props.id}
	>
		{props.children}
	</label>;
}
