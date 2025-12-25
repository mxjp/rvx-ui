import { THEME } from "../common/theme.js";
import { Text } from "./text.js";

export function ErrorMessage(props: {
	children: unknown;
}): unknown {
	const theme = THEME.current;
	return <Text class={theme?.error_message}>
		{props.children}
	</Text>;
}
