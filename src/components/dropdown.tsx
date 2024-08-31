import { ClassValue, Expression, extract, For, get, map, memo, render, sig, StyleValue, uniqueId, View, watch } from "@mxjp/gluon";

import { Action, createDelayedHoverEvent, handleActionEvent, keyFor, startDelayedHoverOnMouseenter } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { LAYER } from "./layer.js";
import { Popout, PopoutAlignment, PopoutPlacement } from "./popout.js";

export interface DropdownItem {
	label: unknown;
	action?: Action;
	children?: Expression<DropdownItem[]>;
	current?: Expression<boolean>;
}

export function createDropdown(props: {
	placement?: Expression<PopoutPlacement | undefined>;
	alignment?: Expression<PopoutAlignment | undefined>;
	foreignEvents?: string[];

	items: Expression<DropdownItem[]>;
	expansion?: boolean;

	id?: Expression<string | undefined>;
	style?: StyleValue;
	class?: ClassValue;
}): Popout {
	return new Popout({
		placement: map(props.placement, v => v ?? "block-end"),
		alignment: map(props.alignment, v => v ?? "start"),
		foreignEvents: props.foreignEvents,
		content: ({ popout, placement }) => {
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
				children: Popout | undefined;
				view: View;
			}>();

			const items = memo(props.items);
			watch(items, items => {
				const current = activeItem.value;
				if (current !== undefined && !items.includes(current)) {
					activeItem.value = undefined;
				}
			});

			const content = <div class={[
				theme?.dropdown_content,
			]}>
				<For each={items}>
					{item => {
						const id = uniqueId();

						let children: Popout | undefined;
						// TODO: id assignment.
						if (item.children) {
							children = createDropdown({
								placement: () => {
									const parentPlacement = get(placement)?.placement;
									if (parentPlacement === "block-end" || parentPlacement === "block-start") {
										return "inline-end";
									}
									return parentPlacement ?? "inline-end";
								},
								alignment: props.alignment,
								items: item.children,
								expansion: true,
								foreignEvents: props.foreignEvents,
								class: props.class,
								style: props.style,
							});
						}

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
								} else if (children) {
									children.show(view, event);
									event.stopImmediatePropagation();
									event.preventDefault();
								}
							}}
							$mouseenter={event => {
								activeItem.value = item;
								startDelayedHoverOnMouseenter(event, () => {
									event.target?.dispatchEvent(createDelayedHoverEvent());
									if (activeItem.value === item) {
										children?.show(view, event);
									}
								});
							}}
						>
							{item.label}
						</div>);
						instances.set(item, { id, children, view });
						return view;
					}}
				</For>
			</div>;

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
				$focus={() => {
					if (!activeItem.value) {
						const currentItems = items();
						activeItem.value = currentItems.find(v => get(v.current)) ?? currentItems[0];
					}
				}}
				$keydown={event => {
					// TODO: Use layer keydown event instead.
					const currentItems = items();
					const current = activeItem.value;
					switch (keyFor(event)) {
						case "arrowdown": {
							activeItem.value = currentItems[(current === undefined ? 0 : (currentItems.indexOf(current) + 1)) % currentItems.length];
							break;
						}
						case "arrowup": {
							const index = current === undefined ? -1 : (currentItems.indexOf(current) - 1);
							activeItem.value = currentItems[index < 0 ? currentItems.length - 1 : index];
							break;
						}
						case "arrowright": {
							if (current) {
								const instance = instances.get(current);
								if (instance?.children) {
									instance.children.show(instance.view, event);
									event.stopImmediatePropagation();
									event.preventDefault();
								}
							}
							break;
						}
						case "enter": {
							if (current?.action && handleActionEvent(event, current.action)) {
								popout.hide();
							} else if (current) {
								const instance = instances.get(current);
								if (instance?.children) {
									instance.children.show(instance.view, event);
									event.stopImmediatePropagation();
									event.preventDefault();
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
