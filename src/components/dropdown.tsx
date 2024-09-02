import { ClassValue, Expression, extract, For, get, map, memo, optionalString, render, sig, StyleValue, uniqueId, View, watch } from "@mxjp/gluon";

import { Action, createPassiveActionEvent, handleActionEvent, keyFor, startDelayedHoverOnMouseenter } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { LAYER } from "./layer.js";
import { Popout, PopoutAlignment, PopoutPlacement } from "./popout.js";

export interface DropdownItem {
	/**
	 * The item label.
	 */
	label: unknown;

	/**
	 * The action to run when this item is selected.
	 */
	action?: Action;

	/**
	 * Optional child items.
	 *
	 * + If an action is also specified and runs when the item is selected, this is only accessible by hovering or pressing `ArrowRight`.
	 * + This expression is memoized and only evaluated while the dropdown is open.
	 */
	children?: Expression<DropdownItem[]>;

	/**
	 * True if this item is currently selected.
	 */
	selected?: Expression<boolean>;
}

/**
 * Create a dropdown that is initially hidden.
 */
export function createDropdown(props: {
	/**
	 * The items contained in this dropdown.
	 *
	 * This expression is memoized and only evaluated while the dropdown is open.
	 */
	items: Expression<DropdownItem[]>;

	/**
	 * True to indicate, that this is a nested dropdown.
	 *
	 * Currently, this allows the dropdown to be closed by pressing "ArrowRight".
	 */
	expansion?: boolean;

	/** An id for the dropdown root. */
	id?: Expression<string | undefined>;
	/** Styles for the dropdown root. */
	style?: StyleValue;
	/** Classes for the dropdown root. */
	class?: ClassValue;

	/**
	 * Defines the direction in which the dropdown is placed in relation to the anchor.
	 *
	 * This expression is only evaluated when calculating the dropdown placement.
	 *
	 * See {@link PopoutPlacement}
	 *
	 * @default "block-end"
	 */
	placement?: Expression<PopoutPlacement | undefined>;

	/**
	 * Defines which side of the anchor and popover are aligned orthogonally to the placement axis.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutAlignment}
	 *
	 * @default "start"
	 */
	alignment?: Expression<PopoutAlignment | undefined>;

	/**
	 * An array of event names that cause the dropdown to hide automatically when dispatched outside of the current layer stack or the anchor.
	 *
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin", "gluon-ux:passive-action"]
	 */
	foreignEvents?: string[];
}): Popout {
	return new Popout({
		placement: map(props.placement, v => v ?? "block-end"),
		alignment: map(props.alignment, v => v ?? "start"),
		foreignEvents: props.foreignEvents,
		content: ({ popout, placement }) => {
			const theme = extract(THEME);
			const layer = extract(LAYER)!;

			const activeItem = sig<DropdownItem | undefined>(undefined);
			const instances = new WeakMap<DropdownItem, {
				id: string;
				children: Popout | undefined;
				root: HTMLElement;
				view: View;
			}>();

			const items = memo(props.items);
			watch(items, items => {
				const current = activeItem.value;
				if (current !== undefined && !items.includes(current)) {
					activeItem.value = undefined;
				}
			});

			const scrollToActive = () => {
				const active = activeItem.value;
				if (active) {
					instances.get(active)?.root.scrollIntoView({ block: "nearest", inline: "nearest" });
				}
			};

			layer.useEvent("keydown", event => {
				const currentItems = items();
				const current = activeItem.value;
				switch (keyFor(event)) {
					case "escape": {
						popout.hide();
						break;
					}
					case "arrowleft": {
						if (props.expansion) {
							popout.hide();
							break;
						}
						return;
					}
					case "arrowdown": {
						activeItem.value = currentItems[(current === undefined ? 0 : (currentItems.indexOf(current) + 1)) % currentItems.length];
						scrollToActive();
						break;
					}
					case "arrowup": {
						const index = current === undefined ? -1 : (currentItems.indexOf(current) - 1);
						activeItem.value = currentItems[index < 0 ? currentItems.length - 1 : index];
						scrollToActive();
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
			});

			const content = <div class={[
				theme?.dropdown_content,
			]}>
				<For each={items}>
					{item => {
						const id = uniqueId();

						let childrenId: string | undefined;
						let children: Popout | undefined;
						if (item.children) {
							childrenId = uniqueId();
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

						const root = <div
							id={id}
							class={[
								theme?.dropdown_item,
								() => activeItem.value === item && theme?.dropdown_item_active,
							]}
							role="option"
							aria-selected={item.selected}
							aria-haspopup={children ? "listbox" : undefined}
							aria-controls={() => children?.visible ? childrenId : undefined}
							aria-expanded={optionalString(() => children?.visible)}
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
									event.target?.dispatchEvent(createPassiveActionEvent());
									if (activeItem.value === item) {
										children?.show(view, event);
									}
								});
							}}
						>
							{item.label}
						</div> as HTMLElement;
						const view = render(root);
						instances.set(item, { id, children, root, view });
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
					map(props.expansion, v => v && theme?.dropdown_expansion),
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
						activeItem.value = currentItems.find(v => get(v.selected)) ?? currentItems[0];
					}
				}}
			>
				<div class={theme?.dropdown_scroll_area}>
					{content}
				</div>
			</div> as HTMLElement;
			layer.useAutoFocusFallback(root);
			return root;
		},
	});
}

export interface DropdownAnchorProps {
	action: Action;
	"aria-haspopup": Expression<string | undefined>;
	"aria-controls": Expression<string | undefined>;
	"aria-expanded": Expression<boolean>;
}

export function Dropdown(props: {
	/**
	 * A function to immediately render the anchor.
	 */
	anchor: (props: DropdownAnchorProps) => unknown;

	/**
	 * The items contained in this dropdown.
	 *
	 * This expression is memoized and only evaluated while the dropdown is open.
	 */
	items: Expression<DropdownItem[]>;

	/** An id for the dropdown root. */
	id?: Expression<string | undefined>;
	/** Styles for the dropdown root. */
	style?: StyleValue;
	/** Classes for the dropdown root. */
	class?: ClassValue;

	/**
	 * Defines the direction in which the dropdown is placed in relation to the anchor.
	 *
	 * This expression is only evaluated when calculating the dropdown placement.
	 *
	 * See {@link PopoutPlacement}
	 *
	 * @default "block-end"
	 */
	placement?: Expression<PopoutPlacement | undefined>;

	/**
	 * Defines which side of the anchor and popover are aligned orthogonally to the placement axis.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutAlignment}
	 *
	 * @default "start"
	 */
	alignment?: Expression<PopoutAlignment | undefined>;

	/**
	 * An array of event names that cause the dropdown to hide automatically when dispatched outside of the current layer stack or the anchor.
	 *
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin", "gluon-ux:passive-action"]
	 */
	foreignEvents?: string[];
}): unknown {
	const defaultId = uniqueId();
	const id = map(props.id, v => v ?? defaultId);

	const dropdown = createDropdown({
		items: props.items,
		id,
		style: props.style,
		class: props.class,
		placement: props.placement,
		alignment: props.alignment,
		foreignEvents: props.foreignEvents,
	});

	const anchor = render(props.anchor({
		action: event => {
			dropdown.toggle(anchor, event);
		},
		"aria-haspopup": "listbox",
		"aria-controls": () => dropdown.visible ? get(id) : undefined,
		"aria-expanded": () => dropdown.visible,
	}));

	return anchor;
}
