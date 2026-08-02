import styles from "@rvx/ui/theme/components/collapse.module.css";
import { $, capture, ClassValue, Component, Event, Expression, Falsy, get, render, StyleValue, teardown, TeardownHook, View, watch, watchUpdates } from "rvx";
import { getBlockStart, getSize, WritingMode } from "../common/writing-mode.js";

export type CollapseEqualsFn<T> = (a: T, b: T) => boolean;

export function Collapse<T>(props: {
	visible: Expression<T | Falsy>;
	eq?: CollapseEqualsFn<NoInfer<T>>;
	fadein?: Expression<boolean>;
	alert?: Event<[]>;
	children: Component<T>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
}) {
	let current: T | undefined;
	let view: View | undefined;
	let dispose: TeardownHook | undefined;
	teardown(() => dispose?.());

	const eqFn = props.eq ?? Object.is;
	const alert = $(false);
	const visible = $<boolean>(undefined!);
	const transition = $(false);
	const content = <div class={styles.content} /> as HTMLDivElement;
	const cssSize = $("");

	const observer = new ResizeObserver(entries => {
		const writingMode = getComputedStyle(root).writingMode as WritingMode || "horizontal-tb";
		const rect = entries[entries.length - 1].contentRect;
		cssSize.value = `${getSize(rect, getBlockStart(writingMode))}px`;
	});
	observer.observe(content);
	teardown(() => observer.disconnect());

	watch(props.visible, next => {
		if (!next) {
			current = undefined;
			dispose?.();
			dispose = undefined;
			visible.value = false;
		} else if (!dispose || !eqFn(current!, next)) {
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
		if (cssSize.value && wasVisible !== visible) {
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
			() => alert.value ? styles.alert : undefined,
			() => visible.value ? styles.visible : undefined,
			() => (cssSize.value && transition.value) ? styles.sized : undefined,
		]}
		style={[
			props.style,
			{ "--collapse-size": () => cssSize.value },
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
