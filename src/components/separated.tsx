import styles from "@rvx/ui/theme/components/separated.module.css";
import { ClassValue, Expression, map, StyleValue } from "rvx";

export function Separated(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
	row?: Expression<boolean | undefined>;
}) {
	return <div
		class={[
			props.class,
			map(props.row, row => row ? styles.row : styles.column),
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
