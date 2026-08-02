import { $, ClassValue, Component, Event, Expression, For, get, Signal, StyleValue, watch } from "rvx";
import { useMicrotask, useTimeout } from "rvx/async";
import { AriaLive, AriaRelevant } from "../common/types.js";
import { Collapse, CollapseEqualsFn } from "./collapse.js";

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
	each: Expression<Iterable<CollapseItem<T>>>;
	children: Component<T>;
	eq?: CollapseEqualsFn<T>;
}) {
	interface Entry {
		/** item */
		i: CollapseItem<T>;
		/** visible */
		v: Signal<boolean>;
	}

	const eqFn = props.eq ?? Object.is;
	const entries = $<Entry[]>([]);
	const fadein = $(false);
	useMicrotask(() => fadein.value = true);

	watch(() => Array.from(get(props.each)), (items) => {
		const inert = entries.inert;
		let itemIndex = 0;
		let entryIndex = 0;

		function hasRemaining(value: T): boolean {
			for (let i = itemIndex + 1; i < items.length; i++) {
				if (eqFn(items[i].value, value)) {
					return true;
				}
			}
			return false;
		}

		function spliceRemaining(value: T): Entry | undefined {
			for (let i = entryIndex + 1; i < inert.length; i++) {
				if (eqFn(inert[i].i.value, value)) {
					return inert.splice(i, 1)[0];
				}
			}
		}

		items: while (itemIndex < items.length) {
			const item = items[itemIndex];
			let entry = inert[entryIndex] as Entry | undefined;
			if (entry && eqFn(entry.i.value, item.value)) {
				entry.v.value = true;
			} else if (entry && !hasRemaining(entry.i.value)) {
				entry.v.value = false;
				entryIndex++;
				continue items;
			} else if (entry = spliceRemaining(item.value)) {
				inert.splice(entryIndex, 0, entry);
				entry.v.value = true;
			} else {
				inert.splice(entryIndex, 0, { i: item, v: $(true) });
			}
			itemIndex++;
			entryIndex++;
		}

		while (entryIndex < inert.length) {
			inert[entryIndex].v.value = false;
			entryIndex++;
		}

		useTimeout(() => {
			const filtered = entries.value.filter(e => e.v.value);
			if (filtered.length < entries.value.length) {
				entries.value = filtered;
			}
		}, 1000);

		entries.notify();
	});

	return <For each={entries}>
		{entry => <Collapse
			visible={entry.v}
			fadein={fadein}
			alert={entry.i.alert}
			class={entry.i.class}
			style={entry.i.style}
			id={entry.i.id}
			aria-live={entry.i["aria-live"]}
			aria-relevant={entry.i["aria-relevant"]}
			aria-atomic={entry.i["aria-atomic"]}
		>
			{() => props.children(entry.i.value)}
		</Collapse>}
	</For>;
}
