import styles from "@rvx/ui/theme/components/page.module.css";
import { ClassValue, Expression, map, StyleValue } from "rvx";
import { Column } from "./column.js";

export function Page(props: {
	inlineSize?: Expression<string | null>;
	centerBlock?: Expression<boolean>;
	role?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	return <div
		role={props.role}
		id={props.id}
		class={[
			props.class,
			styles.page,
			map(props.centerBlock, v => v ? styles.center_block : undefined),
		]}
		style={[
			props.style,
			{
				"--page-inline-size": props.inlineSize,
			},
		]}
	>
		<div class={styles.scrollbar_comp} />
		<div class={styles.content_col}>
			<Column class={styles.content}>
				{props.children}
			</Column>
		</div>
	</div>;
}
