import { $, ClassValue, StyleValue, teardown } from "rvx";
import { debounceEvent } from "../common/events.js";
import styles from "@rvx/ui/theme/components/scroll-view.module.css";
import { axisEquals, DOWN, getBlockStart, getSize, RIGHT, UP, WritingMode } from "../common/writing-mode.js";

const DEBOUNCE_DELAY = 100;

export function ScrollView(props: {
	class?: ClassValue;
	style?: StyleValue;
	contentClass?: ClassValue;
	contentStyle?: StyleValue;
	children?: unknown;
	scrollbarComp?: boolean;
}): unknown {
	const vertical = $<boolean | undefined>(undefined);
	const scrollbarComp = props.scrollbarComp ? $(0) : undefined;
	const startIndicator = $(false);
	const endIndicator = $(false);

	const content = <div class={styles.content}>
		{props.children}
	</div> as HTMLElement;

	const updateIndicators = (blockStart = getBlockStart(getComputedStyle(area).writingMode as WritingMode || "horizontal-tb")) => {
		let start: number;
		let end: number;
		if (blockStart === UP || blockStart === DOWN) {
			start = area.scrollTop;
			end = area.scrollHeight - start - area.clientHeight;
		} else {
			start = area.scrollLeft;
			end = area.scrollWidth - start - area.clientWidth;
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
		class={[
			props.contentClass,
			styles.area,
		]}
		style={[
			props.contentStyle,
			{
				overflow: () => vertical.value ? "hidden auto" : "auto hidden",
			}
		]}
		on:scroll={[debounceEvent(DEBOUNCE_DELAY, () => updateIndicators()), { passive: true }]}
		tabindex="0"
	>
		{content}
	</div> as HTMLElement;

	const root = <div
		class={[
			props.class,
			styles.scroll_view,
		]}
		style={[
			props.style,
			{
				"--scrollbar-comp": scrollbarComp ? (() => `${scrollbarComp.value}px`) : "initial",
			},
		]}
	>
		{area}
		<div class={[
			styles.indicator_start,
			() => startIndicator.value && styles.indicator_visible,
		]} />
		<div class={[
			styles.indicator_end,
			() => endIndicator.value && styles.indicator_visible,
		]} />
	</div> as HTMLElement;

	const rootObserver = new ResizeObserver(debounceEvent(DEBOUNCE_DELAY, () => {
		const blockStart = getBlockStart(getComputedStyle(root).writingMode as WritingMode || "horizontal-tb");
		vertical.value ??= axisEquals(blockStart, UP);
		updateIndicators(blockStart);
	}));
	rootObserver.observe(root);
	teardown(() => rootObserver.disconnect());

	const intersectUpdateIndicators = debounceEvent(DEBOUNCE_DELAY, updateIndicators);
	const contentObserver = new IntersectionObserver(() => {
		const blockStart = getBlockStart(getComputedStyle(root).writingMode as WritingMode || "horizontal-tb");
		const isVertical = axisEquals(blockStart, UP);
		if (scrollbarComp) {
			const contentRect = content.getBoundingClientRect();
			const rootRect = root.getBoundingClientRect();
			const dir = isVertical ? RIGHT : UP;
			scrollbarComp.value = Math.max(0, getSize(rootRect, dir) - getSize(contentRect, dir));
		}
		vertical.value ??= isVertical;
		intersectUpdateIndicators(blockStart);
	}, { root, rootMargin: "0px 0px 0px 0px", threshold: 1 });
	contentObserver.observe(content);
	teardown(() => contentObserver.disconnect());

	return root;
}
