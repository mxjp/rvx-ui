import { Component, Context, Expression, watch } from "rvx";
import { VALIDATION, validationMessage, ValidationMessageEqualsFn, ValidationMessages, Validator } from "./validation.js";

export function errorCase<E>(test: (value: unknown) => value is E, message: Component<NoInfer<E>>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase;
export function errorCase<E>(test: (value: unknown) => boolean, message: Component<E>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase;
export function errorCase<E>(test: (value: unknown) => boolean, message: Component<E>, eq?: ValidationMessageEqualsFn<NoInfer<E>>): ErrorCase {
	return {
		t: test,
		m: message as Component<unknown>,
		e: eq as ValidationMessageEqualsFn<unknown> ?? Object.is,
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
