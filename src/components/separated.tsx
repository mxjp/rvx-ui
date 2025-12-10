import { ClassValue, Expression, map, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";

export function Separated(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
	row?: Expression<boolean | undefined>;
}) {
	const theme = THEME.current;
	return <div
		class={[
			props.class,
			map(props.row, row => row ? theme?.separated_row : theme?.separated_column),
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
