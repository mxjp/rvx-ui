import { THEME } from "../common/theme.js";

export function Secondary(props: {
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <span class={[theme?.secondary]} >
		{props.children}
	</span>;
}
