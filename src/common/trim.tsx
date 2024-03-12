import { sig, Signal, watch } from "@mxjp/gluon";

import { Validator } from "../components/validation.js";

/**
 * Create a signal that trims input.
 *
 * This supports validation.
 */
export function trim(source: Signal<string>): Signal<string> {
	const input = sig(source.value);
	watch(input, value => {
		source.value = value.trim();
	}, true);
	watch(source, value => {
		if (value !== input.value.trim()) {
			input.value = value;
		}
	}, true);
	Validator.get(source)?.attach(input);
	return input;
}
