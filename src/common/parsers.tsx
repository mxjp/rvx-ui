import { $, Signal, watchUpdates } from "rvx";

import { Validator } from "../components/validation.js";

export interface ValidParseResult<S> {
	type: "valid";

	/**
	 * The parsed value.
	 */
	value: S;
}

export interface InvalidParseResult<M> {
	type: "invalid";

	/**
	 * The validation message key.
	 */
	value: M;
}

export type ParseResult<S, M> = ValidParseResult<S> | InvalidParseResult<M>;

export class ParserFormatError extends TypeError {}

export interface Parser<S, I, M extends string> {
	/**
	 * Parse the specified input.
	 */
	parse(input: I): ParseResult<S, M>;

	/**
	 * Format the specified source.
	 *
	 * @throws A {@link ParserFormatError} if the source isn't currently formattable.
	 */
	format(source: S): I;

	/**
	 * An object with validation message keys and content to display.
	 */
	messages: Record<M, unknown>;
}

/**
 * Utility to get the source type from a parser.
 */
export type ParserSource<P extends Parser<any, any, any>> = P extends Parser<infer S, any, any> ? S : never;

/**
 * Utility to get the input type from a parser.
 */
export type ParserInput<P extends Parser<any, any, any>> = P extends Parser<any, infer I, any> ? I : never;

/**
 * Utility to get the message keys type from a parser.
 */
export type ParserMessages<P extends Parser<any, any, any>> = P extends Parser<any, any, infer M> ? M : never;

/**
 * Create a bi-directional input signal with validation.
 *
 * @param source The source signal.
 * @param parser The parser to use.
 * @param input The initial input signal to use. If not specified, the parser is used to format the current source value.
 *
 * @example
 * ```tsx
 * const value = $(0);
 *
 * // Format the current value as initial value:
 * <TextInput value={
 *   value
 *     .pipe(parse, intParser({ format: "Enter a valid number." }))
 *     .pipe(trim)
 * } />
 * ```
 */
export function parse<S, P extends Parser<S, any, any>>(source: Signal<S>, parser: P, input?: Signal<ParserInput<P>>): Signal<ParserInput<P>> {
	if (input === undefined) {
		input = $(parser.format(source.value));
	}

	const invalid = $<undefined | ParserMessages<P>>(undefined);

	watchUpdates(source, value => {
		try {
			input!.value = parser.format(value) as ParserInput<P>;
		} catch (error) {
			if (!(error instanceof ParserFormatError)) {
				throw error;
			}
		}
	});

	watchUpdates(input, value => {
		const result = parser.parse(value);
		if (result.type === "valid") {
			source.value = result.value;
			invalid.value = undefined;
		} else {
			invalid.value = result.value as ParserMessages<P>;
		}
	});

	const validator = Validator.attach(source);
	validator.attach(input);

	for (const key in parser.messages) {
		validator.prependRule({
			validate: () => invalid.value !== key,
			message: parser.messages[key],
		});
	}

	return input;
}

export interface IntParserOptions {
	/**
	 * A function to check if the parsed value is in a valid range.
	 *
	 * By default, the value must be a safe integer.
	 */
	testRange?: (value: number) => boolean;

	/**
	 * A validation message if the format is invalid.
	 */
	format: unknown;

	/**
	 * A validation message if the parsed value is out of range.
	 *
	 * By default, the format validation message is used.
	 */
	range?: unknown;
}

/**
 * Create a parser for integers for use with {@link parse}.
 */
export function intParser(options: IntParserOptions): Parser<number, string, "format" | "range"> {
	const range = options.testRange ?? Number.isSafeInteger;
	return {
		parse(input) {
			if (!/^-?\d+$/.test(input)) {
				return { type: "invalid", value: "format" };
			}
			const value = Number(input);
			if (!range(value)) {
				return { type: "invalid", value: "range" };
			}
			return { type: "valid", value };
		},

		format(source) {
			return String(source);
		},

		messages: {
			format: options.format,
			range: options.range ?? options.format,
		},
	};
}
