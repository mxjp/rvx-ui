import styles from "@rvx/ui/theme/components/text.module.css";
import { ClassValue, Expression, StyleValue } from "rvx";

export function Text(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	return <div
		class={[
			styles.text,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
