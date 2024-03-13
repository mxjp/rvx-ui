import { sig, Signal, watchUpdates } from "@mxjp/gluon";

import { Validator } from "../components/validation.js";

/**
 * Create a signal that trims input.
 *
 * This supports validation.
 */
export function trim(source: Signal<string>): Signal<string> {
	const input = sig(source.value);

	watchUpdates(input, value => {
		source.value = value.trim();
	});

	watchUpdates(source, value => {
		if (value !== input.value.trim()) {
			input.value = value;
		}
	});

	Validator.get(source)?.attach(input);
	return input;
}
