import { Text } from "./text.js";
import styles from "@rvx/ui/theme/components/error.module.css";

export function ErrorMessage(props: {
	children: unknown;
}): unknown {
	return <Text class={styles.message}>
		{props.children}
	</Text>;
}
