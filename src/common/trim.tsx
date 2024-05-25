import { sig, Signal, watchUpdates } from "@mxjp/gluon";

import { validatorFor } from "../components/validation.js";

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

	validatorFor(source)?.attach(input);
	return input;
}
