import styles from "@rvx/ui/theme/components/control-group.module.css";
import { ClassValue, Expression, map, StyleValue } from "rvx";

export function ControlGroup(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
	column?: Expression<boolean | undefined>;
}): unknown {
	return <div
		class={[
			styles.control_group,
			props.class,
			map(props.column, column => column ? styles.column : styles.row),
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
