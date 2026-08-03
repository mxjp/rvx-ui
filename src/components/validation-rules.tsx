import { $, Component, Expression, get, Signal, watchUpdates } from "rvx";
import { validationMessage, ValidationMessage, ValidationMessageEqualsFn, Validator } from "./validation.js";

export function rule<T>(source: Signal<T>, condition: (value: T) => boolean, component: Component<T>, eq?: ValidationMessageEqualsFn<T>): Signal<T> {
	Validator.get(source).prependRule(() => {
		if (!condition(source.value)) {
			return [validationMessage(component, source.value, eq)];
		}
	});
	return source;
}

export interface IntParserOptions {
	/** The validation message for invalid formats. */
	format: Component<string>;
	/** The validation message for an out of range value. Defaults to the format message. */
	range?: Component<string>;
	min?: Expression<number>;
	max?: Expression<number>;
}

export function intParser(source: Signal<number>, options: IntParserOptions): Signal<string> {
	const input = $(String(source.value), source);

	const messages = $<ValidationMessage<string>[]>([]);
	Validator.get(source).prependRule(() => messages.value);

	const min = options.min ?? Number.MIN_SAFE_INTEGER;
	const max = options.max ?? Number.MAX_SAFE_INTEGER;

	watchUpdates(source, value => {
		input.value = String(value);
	});

	watchUpdates(input, value => {
		if (/^-?\d+$/.test(value)) {
			const num = Number.parseInt(value);
			if (Number.isSafeInteger(num) && num >= get(min) && num <= get(max)) {
				messages.value = [];
				source.value = num;
			} else {
				messages.value = [validationMessage(options.range ?? options.format, value)];
			}
		} else {
			messages.value = [validationMessage(options.format, value)];
		}
	});

	return input;
}
