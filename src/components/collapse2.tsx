import styles from "@rvx/ui/theme/components/collapse2.module.css";
import { $, capture, ClassValue, Component, Event, Expression, Falsy, get, map, render, StyleValue, teardown, TeardownHook, View, watch, watchUpdates } from "rvx";
import { DOMRectSize, getBlockStart, getInlineStart, getSize, WritingMode } from "../common/writing-mode.js";

export type CollapseDirection = "block" | "inline";

export function Collapse2<T>(props: {
	visible: Expression<T | Falsy>;
	fadein?: Expression<boolean>;
	alert?: Event<[]>;
	direction?: Expression<CollapseDirection | undefined>;
	children: Component<T>;
	class?: ClassValue;
	style?: StyleValue;
}) {
	let current: T | undefined;
	let view: View | undefined;
	let dispose: TeardownHook | undefined;
	teardown(() => dispose?.());

	const alert = $(false);
	const visible = $<boolean>(undefined!);
	const transition = $(false);
	const content = <div class={styles.content} /> as HTMLDivElement;
	const size = $<[DOMRectSize, WritingMode] | undefined>(undefined);

	const observer = new ResizeObserver(entries => {
		const style = getComputedStyle(root);
		size.value = [
			entries[entries.length - 1].contentRect,
			style.writingMode as WritingMode ?? "horizontal-tb",
		];
	});
	observer.observe(content);
	teardown(() => observer.disconnect());

	watch(props.visible, next => {
		if (!next) {
			current = undefined;
			dispose?.();
			dispose = undefined;
			visible.value = false;
		} else if (!dispose || current !== next) {
			dispose?.();
			view?.detach();
			dispose = capture(() => {
				view = render(props.children(next));
				view.appendTo(content);
			});
			current = next;
			if (get(props.fadein) && !visible.value) {
				visible.value = false;
				let handle = requestAnimationFrame(() => {
					handle = requestAnimationFrame(() => {
						visible.value = true;
					});
				});
				teardown(() => cancelAnimationFrame(handle));
			} else {
				visible.value = true;
			}
		}
	});

	let wasVisible = watchUpdates(visible, visible => {
		if (size.value !== undefined && wasVisible !== visible) {
			wasVisible = visible;
			transition.value = true;
		}
	});

	const clearTransition = (event: globalThis.Event) => {
		if (event.target === root) {
			transition.value = false;
		}
	};

	props.alert?.(() => {
		if (get(props.visible) ?? false) {
			alert.value = false;
			// Force a reflow:
			void root.offsetWidth;
			alert.value = true;
		}
	});

	const root = <div
		class={[
			props.class,
			styles.collapse,
			map(props.direction, v => styles[v ?? "block"]),
			() => alert.value ? styles.alert : undefined,
			() => visible.value ? styles.visible : undefined,
			() => (size.value && transition.value) ? styles.sized : undefined,
		]}
		style={[
			props.style,
			{
				"--collapse-size": () => {
					if (size.value) {
						const [rect, writingMode] = size.value;
						const dir = (get(props.direction) ?? "block") === "block" ? getBlockStart(writingMode) : getInlineStart(writingMode, "ltr");
						return `${getSize(rect, dir)}px`;
					}
				},
			}
		]}
		on:transitionend={clearTransition}
		on:transitioncancel={clearTransition}
	>
		<div class={styles.view}>
			{content}
		</div>
	</div> as HTMLDivElement;

	return root;
}
