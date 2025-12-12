import { $, ClassValue, Component, Expression, For, get, map, Show, Signal, StyleValue, uniqueIdFor, watch } from "rvx";
import { string } from "rvx/convert";
import { THEME } from "../common/theme.js";

export interface Tab {
	label: Component;
	content: Component;
}

export function Tabs(props: {
	tabs: Expression<Iterable<Tab>>;
	selected?: Signal<Tab | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	list?: Component<{ tabs: Expression<Iterable<Tab>>, selected: Signal<Tab | undefined> }>;
	panel?: Component<{ tab: Expression<Tab | undefined>, content?: Component<Component> }>;
	content?: Component<Component>;
}) {
	const selected = props.selected ?? $(undefined);
	const List = props.list ?? TabList;
	const Panel = props.panel ?? TabPanel;
	selectFallbackTab(props.tabs, selected);
	return <>
		<List tabs={props.tabs} selected={selected} />
		<Panel tab={selected} content={props.content} />
	</>;
}

export function selectFallbackTab(tabs: Expression<Iterable<Tab>>, selected: Signal<Tab | undefined>) {
	watch(selected, current => {
		if (current === undefined) {
			for (const tab of get(tabs)) {
				selected.value = tab;
				break;
			}
		}
	});
}

export function TabList(props: {
	tabs: Expression<Iterable<Tab>>;
	selected: Signal<Tab | undefined>;
	padded?: Expression<boolean | undefined>;
	class?: ClassValue;
	style?: StyleValue;
}) {
	const theme = THEME.current;
	return <div
		role="tablist"
		class={[
			theme?.tab_list,
			theme?.has_separator,
			map(props.padded, padded => padded ? theme?.tab_list_padded : undefined),
			props.class,
		]}
		style={props.style}
	>
		<For each={props.tabs}>
			{tab => <button
				role="tab"
				class={[
					theme?.tab_handle,
					() => props.selected.value === tab ? theme?.tab_handle_current : undefined,
				]}
				aria-selected={string(() => props.selected.value === tab)}
				aria-controls={uniqueIdFor(tab)}
				on:click={event => {
					event.stopImmediatePropagation();
					event.preventDefault();
					props.selected.value = tab;
				}}
			>
				{tab.label()}
			</button>}
		</For>
	</div>;
}

export function TabPanel(props: {
	tab?: Expression<Tab | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	content?: Component<Component>;
}) {
	const theme = THEME.current;
	return <Show when={props.tab}>
		{tab => <div
			role="tabpanel"
			id={uniqueIdFor(tab)}
			class={[
				theme?.tab_panel,
				props.class,
			]}
			style={props.style}
		>
			{props.content
				? props.content(tab.content)
				: tab.content()
			}
		</div>}
	</Show>;
}
