import { ClassValue, extract, sig, StyleValue } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";
import { observeWritingModeAxis } from "../common/writing-mode.js";

export function ScrollView(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	const vertical = sig<boolean | undefined>(undefined);

	const root = <div
		class={[
			props.class,
			theme?.scroll_view,
		]}
		style={props.style}
	>
		<div
			class={theme?.scroll_view_area}
			style={{
				overflow: () => vertical.value ? "hidden auto" : "auto hidden",
			}}
		>
			<div class={theme?.scroll_view_content}>
				{props.children}
			</div>
		</div>
	</div> as HTMLElement;

	observeWritingModeAxis(root, value => {
		vertical.value = value;
	});

	return root;
}
