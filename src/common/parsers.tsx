import { sig, Signal, watchUpdates } from "@mxjp/gluon";

import { Validator } from "../components/validation.js";

export const INVALID = Symbol.for("gluon_ux:parsers:invalid");

export interface Parser<S, I> {
	parse(input: I): S | typeof INVALID;
	format(source: S): I;
}

/**
 * Create a two-way parsing signal with validation.
 *
 * @param source The source signal to parse into.
 * @param parser The parser to use.
 * @param message The validation message to use when parsing fails.
 * @returns The input signal.
 */
export function parse<S, I>(
	source: Signal<S>,
	parser: Parser<S, I>,
	message: unknown,
): Signal<I> {
	const input = sig(parser.format(source.value));
	const valid = sig(true);

	watchUpdates(source, value => {
		input.value = parser.format(value);
	});

	watchUpdates(input, value => {
		const result = parser.parse(value);
		if (result === INVALID) {
			valid.value = false;
		} else {
			source.value = result;
			valid.value = true;
		}
	});

	const validator = Validator.attach(source);
	validator.attach(input);
	validator.prependRule({
		validate: () => valid.value,
		message,
	});

	return input;
}

export const intParser: Parser<number, string> = {
	parse(input) {
		if (/^-?\d+$/.test(input)) {
			const int = Number(input);
			if (Number.isSafeInteger(int)) {
				return int;
			}
		}
		return INVALID;
	},
	format(source) {
		return String(source);
	},
};
