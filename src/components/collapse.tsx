import { $, ClassValue, Component, Event, Expression, For, get, map, Signal, StyleValue, teardown, watch } from "rvx";
import { useMicrotask, useTimeout } from "rvx/async";
import { optionalString } from "rvx/convert";
import { THEME } from "../common/theme.js";
import { AriaLive, AriaRelevant } from "../common/types.js";

export function Collapse(props: {
	visible?: Expression<boolean | undefined>;
	fadein?: Expression<boolean | undefined>;
	alert?: Event<[]>;
	children?: unknown;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	"aria-live"?: Expression<AriaLive | undefined>;
	"aria-relevant"?: Expression<AriaRelevant | undefined>;
	"aria-atomic"?: Expression<boolean | undefined>;
}): unknown {
	const theme = THEME.current;
	const alert = $(false);
	const size = $<number | undefined>(undefined);

	const content = <div class={theme?.collapse_content}>
		{props.children}
	</div> as HTMLDivElement;

	const observer = new ResizeObserver(entries => {
		const entry = entries[entries.length - 1];
		const boxSize = entry?.borderBoxSize[entry.borderBoxSize.length - 1];
		if (boxSize) {
			size.value = boxSize.blockSize;
		}
	});

	observer.observe(content);
	teardown(() => {
		observer.disconnect();
	});

	props.alert?.(() => {
		if (get(props.visible) ?? false) {
			alert.value = false;
			// Force a reflow:
			void root.offsetWidth;
			alert.value = true;
		}
	});

	let visible = props.visible;
	if (props.fadein !== undefined) {
		const visibleSig = visible = $(false);
		watch(props.visible, visible => {
			if (visible) {
				const fadein = get(props.fadein);
				if (fadein) {
					visibleSig.value = false;
					let handle = requestAnimationFrame(() => {
						handle = requestAnimationFrame(() => {
							visibleSig.value = true;
						});
					});
					teardown(() => cancelAnimationFrame(handle));
				} else {
					visibleSig.value = true;
				}
			} else {
				visibleSig.value = false;
			}
		});
	}

	const root = <div
		inert={map(props.visible, v => !v)}
		class={[
			theme?.collapse,
			() => size.value === undefined ? undefined : theme?.collapse_sized,
			() => alert.value ? theme?.collapse_alert : undefined,
			map(visible, v => v ? theme?.collapse_visible : undefined),
			props.class,
		]}
		style={[
			{
				"--collapse-size": () => size.value === undefined ? undefined : `${size.value}px`,
			},
			props.style,
		]}
		id={props.id}
		aria-live={map(props["aria-live"], v => v ?? "polite")}
		aria-relevant={props["aria-relevant"]}
		aria-atomic={optionalString(props["aria-atomic"])}
	>
		{theme?.collapse_view
			? <div class={theme.collapse_view}>
				{content}
			</div>
			: content}
	</div> as HTMLDivElement;
	return root;
}

export interface CollapseItem<T> {
	value: T;
	alert?: Event<[]>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	"aria-live"?: Expression<AriaLive | undefined>;
	"aria-relevant"?: Expression<AriaRelevant | undefined>;
	"aria-atomic"?: Expression<boolean | undefined>;
}

export function CollapseFor<T>(props: {
	each: Expression<CollapseItem<T>[]>;
	children: Component<T>;
}): unknown {

	interface Entry {
		/** item */
		i: CollapseItem<T>;
		/** visible */
		v: Signal<boolean>;
	}

	const entries = $<Entry[]>([]);
	const fadein = $(false);
	useMicrotask(() => fadein.value = true);

	watch(props.each, items => {
		entries.update(entries => {
			let itemIndex = 0;
			let entryIndex = 0;

			function hasRemainingItem(value: T): boolean {
				for (let i = itemIndex + 1; i < items.length; i++) {
					if (Object.is(items[i].value, value)) {
						return true;
					}
				}
				return false;
			}

			function spliceRemainingEntry(value: T): Entry | undefined {
				for (let i = entryIndex + 1; i < entries.length; i++) {
					if (Object.is(entries[i].i.value, value)) {
						return entries.splice(i, 1)[0];
					}
				}
			}

			items: while (itemIndex < items.length) {
				const item = items[itemIndex];
				let entry = entries[entryIndex] as Entry | undefined;
				if (entry && Object.is(entry.i.value, item.value)) {
					entry.v.value = true;
				} else if (entry && !hasRemainingItem(entry.i.value)) {
					entry.v.value = false;
					entryIndex++;
					continue items;
				} else if (entry = spliceRemainingEntry(item.value)) {
					entries.splice(entryIndex, 0, entry);
					entry.v.value = true;
				} else {
					entries.splice(entryIndex, 0, { i: item, v: $(true) });
				}
				itemIndex++;
				entryIndex++;
			}

			while (entryIndex < entries.length) {
				entries[entryIndex].v.value = false;
				entryIndex++;
			}
		});

		useTimeout(() => {
			const filtered = entries.value.filter(e => e.v.value);
			if (filtered.length < entries.value.length) {
				entries.value = filtered;
			}
		}, 1000);
	});

	return <For each={entries}>
		{instance => <Collapse
			visible={instance.v}
			fadein={fadein}
			alert={instance.i.alert}
			class={instance.i.class}
			style={instance.i.style}
			id={instance.i.id}
			aria-live={instance.i["aria-live"]}
			aria-relevant={instance.i["aria-relevant"]}
			aria-atomic={instance.i["aria-atomic"]}
		>
			{props.children(instance.i.value)}
		</Collapse>}
	</For>;
}
