import styles from "@rvx/ui/theme/components/secondary.module.css";

export function Secondary(props: {
	children?: unknown;
}): unknown {
	return <span class={styles.secondary}>
		{props.children}
	</span>;
}
