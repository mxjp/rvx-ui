import { Component, Context, Expression, Signal, watch } from "rvx";
import { DialogAbortError } from "./dialog.js";
import { VALIDATION, validationMessage, ValidationMessageEqualsFn, ValidationMessages, Validator } from "./validation.js";

/**
 * Define an error case.
 *
 * @param test A function to test if an error matches.
 * @param message A component to render the error message for a matching error.
 * @param eq A function to determine if two errors should be treated as the same message. By default errors are considered equal if the {@link test} function returns true for the previous error.
 */
export function errorCase<E>(test: (value: unknown) => value is E, message: Component<NoInfer<E>>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase;
export function errorCase<E>(test: (value: unknown) => boolean, message: Component<E>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase;
export function errorCase<E>(test: (value: unknown) => boolean, message: Component<E>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase {
	return {
		t: test,
		m: message as Component<unknown>,
		e: eq as ValidationMessageEqualsFn<unknown> ?? (prev => test(prev)),
	};
}

/**
 * Represents an error case.
 *
 * Fields are considered internal and not subject to semantic versioning.
 *
 * See {@link errorCase}.
 */
export interface ErrorCase {
	t: (value: unknown) => boolean;
	m: Component<unknown>;
	e: ValidationMessageEqualsFn<unknown> | undefined;
}

export const DEFAULT_ERROR_CASES = new Context<ErrorCase[]>([]);

export function ErrorMessages(props: {
	error: Expression<unknown>;
	cases: ErrorCase[];
}) {
	let current: unknown;
	const validator = VALIDATION.provide({ trigger: "never" }, () => new Validator());

	const add = (entry: ErrorCase) => {
		validator.appendRule(() => {
			if (entry.t(current)) {
				return [validationMessage(entry.m, current, entry.e)];
			}
		});
	};

	props.cases.forEach(add);
	DEFAULT_ERROR_CASES.current.forEach(add);

	watch(props.error, error => {
		current = error;
		void validator.validate();
	});

	return <ValidationMessages for={validator} />;
}

export function isAbortError(error: unknown) {
	return (error instanceof DOMException && error.name === "AbortError")
		|| error instanceof DialogAbortError;
}

export const DEFAULT_IGNORED_ERRORS = new Context<((error: unknown) => boolean)[]>([
	isAbortError,
]);

export function handleError<T>(output: Signal<unknown> | ((error: unknown) => void), action: () => T): (T extends Promise<infer P> ? Promise<P | undefined> : T) | undefined {
	const ignored = DEFAULT_IGNORED_ERRORS.current;
	const onError = (error: unknown) => {
		if (ignored.some(f => f(error))) {
			return;
		}
		if (typeof output === "function") {
			output(error);
		} else {
			output.value = error;
		}
	};
	try {
		const result = action();
		if (result instanceof Promise) {
			return result.catch(onError) as any;
		}
		return result as any;
	} catch (error) {
		onError(error);
	}
}
