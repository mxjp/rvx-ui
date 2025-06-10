import { $, Component, Expression, For, get, map, Show, Signal, uniqueIdFor, watch } from "rvx";
import { string } from "rvx/convert";
import { THEME } from "../common/theme.js";

export interface Tab {
	label: unknown;
	content: Component;
}

export function Tabs(props: {
	tabs: Expression<Iterable<Tab>>;
	selected?: Signal<Tab>;
	padded?: Expression<boolean | undefined>;
}) {
	const theme = THEME.current;
	const selected = props.selected ?? $(undefined);

	watch(selected, current => {
		if (current === undefined) {
			for (const tab of get(props.tabs)) {
				selected.value = tab;
				break;
			}
		}
	});

	return <>
		<div
			role="tablist"
			class={[
				theme?.tab_list,
				map(props.padded, padded => padded ? theme?.tab_list_padded : undefined),
			]}
		>
			<For each={props.tabs}>
				{tab => <button
					role="tab"
					class={[
						theme?.tab_handle,
						() => selected.value === tab ? theme?.tab_handle_current : undefined,
					]}
					aria-selected={string(() => selected.value === tab)}
					aria-controls={uniqueIdFor(tab)}
					on:click={event => {
						event.stopImmediatePropagation();
						event.preventDefault();
						selected.value = tab;
					}}
				>
					{tab.label}
				</button>}
			</For>
		</div>
		<Show when={selected}>
			{tab => <div
				role="tabpanel"
				id={uniqueIdFor(tab)}
				class={[
					theme?.tab_panel,
					map(props.padded, padded => padded ? theme?.tab_panel_padded : undefined),
				]}
			>
				{tab.content()}
			</div>}
		</Show>
	</>;
}
