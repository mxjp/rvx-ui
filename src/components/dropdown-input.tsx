import { ClassValue, Expression, get, map, Signal, StyleValue } from "@mxjp/gluon";

import { Button, ButtonVariant } from "./button.js";
import { Dropdown, DropdownItem } from "./dropdown.js";
import { PopoutAlignment, PopoutPlacement } from "./popout.js";
import { validatorFor } from "./validation.js";

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

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	autofocus?: Expression<boolean | undefined>;
	title?: Expression<string | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;

	dropdownId?: string;
	dropdownClass?: ClassValue;
	dropdownStyle?: StyleValue;
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
			class={props.class}
			style={props.style}
			id={props.id}
			autofocus={props.autofocus}
			title={props.title}
			role="combobox"
			aria-label={props["aria-label"]}
			aria-labelledby={props["aria-labelledby"]}
			validator={props.value instanceof Signal ? validatorFor(props.value) : undefined}
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
		id={props.dropdownId}
		style={props.dropdownStyle}
		class={props.dropdownClass}
		placement={props.placement}
		alignment={props.alignment}
		foreignEvents={props.foreignEvents}
	/>;
}
