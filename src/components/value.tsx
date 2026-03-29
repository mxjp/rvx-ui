import styles from "@rvx/ui/theme/components/value.module.css";

export function Value(props: {
	children?: unknown;
}): unknown {
	return <span class={styles.value}>
		{props.children}
	</span>;
}
