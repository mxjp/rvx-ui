import styles from "@rvx/ui/theme/components/flex-space.module.css";
import { Expression, get } from "rvx";

export function FlexSpace(props: {
	grow?: Expression<number | undefined>;
}): unknown {
	return <div
		class={styles.flex_space}
		style={{
			"flex-grow": () => get(props.grow) ?? 1,
		}}
	/>;
}
