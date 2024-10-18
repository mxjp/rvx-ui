import { Expression, extract, get } from "rvx";

import { THEME } from "../common/theme.js";

export function FlexSpace(props: {
	grow?: Expression<number | undefined>;
}): unknown {
	const theme = extract(THEME);
	return <div
		class={theme?.flex_space}
		style={{
			"flex-grow": () => String(get(props.grow) ?? 1),
		}}
	/>;
}
