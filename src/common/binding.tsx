import { sig, Signal, watch } from "@mxjp/gluon";

export function trim(source: Signal<string>): Signal<string> {
	const input = sig(source.value);
	watch(input, value => {
		source.value = value.trim();
	}, true);
	watch(source, value => {
		if (value !== input.value.trim()) {
			input.value = value;
		}
	});
	return input;
}
