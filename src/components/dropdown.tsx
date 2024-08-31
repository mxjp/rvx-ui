import { ClassValue, Expression, extract, For, get, map, render, sig, StyleValue, uniqueId, View, watch } from "@mxjp/gluon";

import { Action, handleActionEvent, keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { ScriptDirection, WritingMode } from "../common/writing-mode.js";
import { LAYER } from "./layer.js";
import { Popout, PopoutAlignment, PopoutPlacement } from "./popout.js";

export interface DropdownItem {
	label: unknown;
	action?: Action;
	expand?: Action<[anchor: View]>;
	current?: Expression<boolean>;
}

export function createDropdown(props: {
	placement?: Expression<PopoutPlacement | undefined>;
	alignment?: Expression<PopoutAlignment | undefined>;
	foreignEvents?: string[];
	writingMode?: Expression<WritingMode | undefined>;
	scriptDir?: Expression<ScriptDirection | undefined>;

	items: Expression<DropdownItem[]>;
	expansion?: boolean;

	id?: Expression<string | undefined>;
	style?: StyleValue;
	class?: ClassValue;
}): Popout {
	return new Popout({
		placement: map(props.placement, v => v ?? "block-end"),
		alignment: map(props.alignment, v => v ?? "center"),
		foreignEvents: props.foreignEvents,
		writingMode: props.writingMode,
		scriptDir: props.scriptDir,
		content: ({ popout }) => {
			const theme = extract(THEME);

			const layer = extract(LAYER);
			layer?.useHotkey("escape", () => {
				popout.hide();
			});
			if (props.expansion) {
				layer?.useHotkey("arrowleft", () => {
					popout.hide();
				});
			}

			const activeItem = sig<DropdownItem | undefined>(undefined);
			const instances = new WeakMap<DropdownItem, {
				id: string;
				view: View;
			}>();

			watch(props.items, items => {
				const current = activeItem.value;
				if (current !== undefined && !items.includes(current)) {
					activeItem.value = undefined;
				}
			});

			const content = <div class={[
				theme?.dropdown_content,
			]}>
				<For each={props.items}>
					{item => {
						const id = uniqueId();
						const view = render(<div
							id={id}
							class={[
								theme?.dropdown_item,
								() => activeItem.value === item && theme?.dropdown_item_active,
							]}
							$click={event => {
								activeItem.value = item;
								if (item.action && handleActionEvent(event, item.action)) {
									popout.hide();
								} else if (item.expand) {
									handleActionEvent(event, item.expand, view);
								}
							}}
							$$mouseover={() => {
								activeItem.value = item;
							}}
						>
							{item.label}
						</div>);
						instances.set(item, { id, view });
						return view;
					}}
				</For>
			</div>;

			// TODO: Close expansions on long hover.

			const root = <div
				id={props.id}
				style={props.style}
				class={[
					props.class,
					theme?.dropdown,
				]}
				role="listbox"
				tabindex="0"
				aria-activedescendant={() => {
					const item = activeItem.value;
					return item === undefined ? undefined : instances.get(item)?.id;
				}}
				$focus={event => {
					event.stopImmediatePropagation();
					const items = get(props.items);
					activeItem.value = items.find(v => get(v.current)) ?? items[0];
				}}
				$keydown={event => {
					const items = get(props.items);
					const current = activeItem.value;
					switch (keyFor(event)) {
						case "arrowdown": {
							activeItem.value = items[(current === undefined ? 0 : (items.indexOf(current) + 1)) % items.length];
							break;
						}
						case "arrowup": {
							const index = current === undefined ? -1 : (items.indexOf(current) - 1);
							activeItem.value = items[index < 0 ? items.length - 1 : index];
							break;
						}
						case "arrowright": {
							if (current?.expand) {
								const instance = instances.get(current);
								if (instance !== undefined) {
									handleActionEvent(event, current.expand!, instance.view);
								}
							}
							break;
						}
						case "enter": {
							if (current?.action && handleActionEvent(event, current.action)) {
								popout.hide();
							} else if (current?.expand) {
								const instance = instances.get(current);
								if (instance) {
									handleActionEvent(event, current.expand!, instance.view);
								}
							}
							break;
						}
						default: return;
					}
					event.stopImmediatePropagation();
					event.preventDefault();
				}}
			>
				<div class={theme?.dropdown_scroll_area}>
					{content}
				</div>
			</div> as HTMLElement;
			layer?.useAutoFocusFallback(root);
			return root;
		},
	});
}
