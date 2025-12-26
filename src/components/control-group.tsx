import { ClassValue, Expression, map, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";

export function ControlGroup(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
	column?: Expression<boolean | undefined>;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.control_group,
			props.class,
			map(props.column, column => column ? theme?.control_group_column : theme?.control_group_row),
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
