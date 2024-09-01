import { ClassValue, Expression, get, map, Signal, StyleValue } from "@mxjp/gluon";

import { Button, ButtonVariant } from "./button.js";
import { Dropdown, DropdownItem } from "./dropdown.js";
import { PopoutAlignment, PopoutPlacement } from "./popout.js";

export interface DropdownValue<T> {
	value: T;
	label: unknown;
}

export function DropdownInput<T>(props: {
	children?: unknown;
	value: Expression<T>;
	values: Expression<DropdownValue<T>[]>;

	variant?: ButtonVariant;
	disabled?: Expression<boolean | undefined>;
	id?: Expression<string | undefined>;
	style?: StyleValue;
	class?: ClassValue;

	placement?: Expression<PopoutPlacement | undefined>;
	alignment?: Expression<PopoutAlignment | undefined>;
	foreignEvents?: string[];
}): unknown {
	const items = new WeakMap<DropdownValue<T>, DropdownItem>();
	return <Dropdown
		anchor={a => <Button
			{...a}
			variant={map(props.variant, v => v ?? "input")}
			disabled={props.value instanceof Signal ? props.disabled : true}
			id={props.id}
			style={props.style}
			class={props.class}
			role="combobox"
		>
			{props.children ?? (() => {
				const value = get(props.value);
				return get(props.values).find(v => v.value === value)?.label;
			})}
		</Button>}
		items={() => get(props.values).map<DropdownItem>(value => {
			let item = items.get(value);
			if (item === undefined) {
				item = {
					label: value.label,
					selected: () => value.value === get(props.value),
					action: () => {
						if (props.value instanceof Signal) {
							props.value.value = value.value;
						} else {
							return false;
						}
					},
				};
				items.set(value, item);
			}
			return item;
		})}
		placement={props.placement}
		alignment={props.alignment}
		foreignEvents={props.foreignEvents}
	/>;
}
