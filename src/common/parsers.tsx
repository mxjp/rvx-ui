import { sig, Signal, watch } from "@mxjp/gluon";

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

	watch(source, value => {
		input.value = parser.format(value);
	});

	watch(input, value => {
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
		message: message,
	});

	return input;
}

/**
 * Wrap a parser to allow a specific source/input pair.
 */
export function withPair<S, I, SOpt, IOpt>(parser: Parser<S, I>, emptySource: SOpt, emptyInput: IOpt): Parser<S | SOpt, I | IOpt> {
	return {
		parse(value) {
			if (value === emptyInput) {
				return emptySource;
			}
			return parser.parse(value as I);
		},
		format(value) {
			if (value === emptySource) {
				return emptyInput;
			}
			return parser.format(value as S);
		},
	};
}

/**
 * Create a parser for safe negative or positive integers.
 */
export function asInt(): Parser<number, string> {
	return {
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
}
