import styles from "@rvx/ui/theme/components/label.module.css";
import { ClassValue, Expression, StyleValue } from "rvx";
import { ID_PAIR } from "../common/id-pairs.js";

export function Label(props: {
	class?: ClassValue;
	style?: StyleValue;
	for?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const idFor = props.for ?? ID_PAIR.current.prefix();
	return <label
		class={[
			styles.label,
			props.class,
		]}
		style={props.style}
		for={idFor}
		id={props.id}
	>
		{props.children}
	</label>;
}
