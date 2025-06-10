import { $, Component, Expression, get, Signal, watchUpdates } from "rvx";
import { Validator } from "./validation.js";

export function rule<T>(source: Signal<T>, condition: (value: T) => boolean, message: Component): Signal<T> {
	Validator.get(source).prependRule(() => {
		if (!condition(source.value)) {
			return [message];
		}
	});
	return source;
}

export interface IntParserOptions {
	/** The validation message for invalid formats. */
	format: Component;
	/** The validation message for an out of range value. Defaults to the format message. */
	range?: Component;
	min?: Expression<number>;
	max?: Expression<number>;
}

export function intParser(source: Signal<number>, options: IntParserOptions): Signal<string> {
	const input = $(String(source.value), source);

	const messages = $<Component[]>([]);
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
				messages.value = [options.range ?? options.format];
			}
		} else {
			messages.value = [options.format];
		}
	});

	return input;
}
