import { ClassValue, Expression, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";

export function Text(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.text,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
