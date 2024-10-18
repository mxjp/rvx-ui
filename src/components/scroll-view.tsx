import { ClassValue, extract, sig, StyleValue, teardown } from "rvx";

import { debounceEvent } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { axisEquals, DOWN, getBlockStart, getSize, RIGHT, UP, WritingMode } from "../common/writing-mode.js";

export function ScrollView(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	const vertical = sig<boolean | undefined>(undefined);
	const scrollbarComp = sig(0);
	const startIndicator = sig(false);
	const endIndicator = sig(false);

	const content = <div class={theme?.scroll_view_content}>
		{props.children}
	</div> as HTMLElement;

	const updateIndicators = (blockStart = getBlockStart(getComputedStyle(area).writingMode as WritingMode || "horizontal-tb")) => {
		const areaSize = getSize(area.getBoundingClientRect(), blockStart);
		let start: number;
		let end: number;
		if (blockStart === UP || blockStart === DOWN) {
			start = area.scrollTop;
			end = area.scrollHeight - start - areaSize;
		} else {
			start = area.scrollLeft;
			end = area.scrollWidth - start - areaSize;
		}
		if (blockStart === DOWN || blockStart === RIGHT) {
			const x = start;
			start = end;
			end = x;
		}
		startIndicator.value = start > .5;
		endIndicator.value = end > .5;
	};

	const area = <div
		class={theme?.scroll_view_area}
		style={{
			overflow: () => vertical.value ? "hidden auto" : "auto hidden",
		}}
		on:scroll={[debounceEvent(100, () => updateIndicators()), { passive: true }]}
	>
		{content}
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
		{area}
		<div class={[
			theme?.scroll_view_indicator_start,
			() => startIndicator.value && theme?.scroll_view_indicator_visible,
		]} />
		<div class={[
			theme?.scroll_view_indicator_end,
			() => endIndicator.value && theme?.scroll_view_indicator_visible,
		]} />
	</div> as HTMLElement;

	const rootObserver = new ResizeObserver(() => {
		const blockStart = getBlockStart(getComputedStyle(root).writingMode as WritingMode || "horizontal-tb");
		vertical.value ??= axisEquals(blockStart, UP);
		updateIndicators(blockStart);
	});
	rootObserver.observe(root);
	teardown(() => rootObserver.disconnect());

	const contentObserver = new IntersectionObserver(() => {
		const rootRect = root.getBoundingClientRect();
		const contentRect = content.getBoundingClientRect();
		const blockStart = getBlockStart(getComputedStyle(root).writingMode as WritingMode || "horizontal-tb");
		const isVertical = axisEquals(blockStart, UP);
		const dir = isVertical ? RIGHT : UP;
		scrollbarComp.value = Math.max(0, getSize(rootRect, dir) - getSize(contentRect, dir));
		vertical.value ??= isVertical;
		updateIndicators(blockStart);
	}, { root, rootMargin: "0px 0px 0px 0px", threshold: 1 });
	contentObserver.observe(content);
	teardown(() => contentObserver.disconnect());

	return root;
}
