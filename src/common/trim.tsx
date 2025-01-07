import { $, Signal, watchUpdates } from "rvx";

import { validatorFor } from "../components/validation.js";

/**
 * Create a signal that trims input.
 *
 * This supports validation.
 *
 * @example
 * ```tsx
 * <TextInput value={someSignal.pipe(trim)} />;
 * ```
 */
export function trim(source: Signal<string>): Signal<string> {
	const input = $(source.value);

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
