import { ClassValue, extract, sig, StyleValue, teardown } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";
import { getSize, isVerticalBlockAxis, RIGHT, UP } from "../common/writing-mode.js";

export function ScrollView(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	const vertical = sig<boolean | undefined>(undefined);
	const scrollbarComp = sig(0);

	const content = <div class={theme?.scroll_view_content}>
		{props.children}
	</div> as HTMLElement;

	const root = <div
		class={[
			props.class,
			theme?.scroll_view,
		]}
		style={[
			props.style,
			{
				"--scrollbar-comp": () => `${scrollbarComp.value}px`,
			},
		]}
	>
		<div
			class={theme?.scroll_view_area}
			style={{
				overflow: () => vertical.value ? "hidden auto" : "auto hidden",
			}}
		>
			{content}
		</div>
	</div> as HTMLElement;

	const rootObserver = new ResizeObserver(() => {
		vertical.value ??= isVerticalBlockAxis(root);
	});
	rootObserver.observe(root);
	teardown(() => rootObserver.disconnect());

	const contentObserver = new IntersectionObserver(() => {
		const rootRect = root.getBoundingClientRect();
		const contentRect = content.getBoundingClientRect();

		const isVertical = isVerticalBlockAxis(root);
		const dir = isVertical ? RIGHT : UP;

		scrollbarComp.value = Math.max(0, getSize(rootRect, dir) - getSize(contentRect, dir));
		vertical.value ??= isVertical;
	}, { root, rootMargin: "0px 0px 0px 0px", threshold: 1 });
	contentObserver.observe(content);
	teardown(() => contentObserver.disconnect());

	return root;
}
