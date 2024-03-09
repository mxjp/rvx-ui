import { ClassValue, ContextKey, Expression, extract, sig, StyleValue, TaskSlot, teardown, trigger, uniqueId, untrack } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";
import { Collapse } from "./collapse.js";
import { Text } from "./text.js";

/**
 * Represents the validity state of a specific user input.
 */
export interface Validity {
	/**
	 * Reactively get if the input is invalid.
	 */
	invalid: boolean;

	/**
	 * Reactively get a space separated list of error message element ids.
	 */
	errorMessageIds: string | undefined;
}

/**
 * Component that renders a validation message.
 */
export function ValidationMessage(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <Text
		class={[
			theme?.validation_message,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</Text>;
}

/**
 * Describes why something is validated.
 *
 * + **manual** - Validation is run manually.
 * + **side-effect** - Validation is run as a side effect e.g. due to updated signal inputs.
 */
export type ValidationCause = "manual" | "side-effect";

/**
 * Defines when validation runs automatically as a side effect when any signal inputs change.
 *
 * + **never** - Never run.
 * + **if-invalid** - Only run if the validator is currently invalid. (Default)
 * + **if-validated** - Run if validation validation did already run.
 */
export type ValidationTrigger = "never" | "if-invalid" | "if-validated";

/**
 * Defines how to proceed when a rule is invalid.
 *
 * + **stop** - Don't validate other rules. (Default)
 * + **hidden** - Validate other rules, but don't show them.
 * + **visible** - Validate other rules and show them.
 */
export type ValidationFollowUp = "stop" | "hidden" | "visible";

export interface ValidationOptions {
	/**
	 * Defines when validation runs automatically as a side effect when any signal inputs change.
	 */
	trigger?: ValidationTrigger;

	/**
	 * Defines how to proceed when a rule is invalid.
	 */
	followUp?: ValidationFollowUp;
}

/**
 * Context key for default validation options.
 */
export const VALIDATION = Symbol.for("gluon_ux:validation") as ContextKey<ValidationOptions>;

/**
 * A set of validation rules for a specific input.
 */
export class Validator implements Validity {
	#cycle = 0;
	#slot = new TaskSlot();
	#invalid = sig(false);
	#handles = sig<ValidationRuleHandle[]>([]);
	#trigger: ValidationTrigger;
	#followUp: ValidationFollowUp;

	constructor(options?: ValidationOptions) {
		const defaults = extract(VALIDATION);
		this.#trigger = options?.trigger ?? defaults?.trigger ?? "if-validated";
		this.#followUp = options?.followUp ?? defaults?.followUp ?? "stop";
	}

	get errorMessageIds(): string | undefined {
		return this.#handles.value.map(h => h.errorMessageIds ?? "").join(" ");
	}

	get invalid(): boolean {
		return this.#invalid.value;
	}

	/**
	 * Add a rule to this validator until the current lifecycle is disposed.
	 */
	use(handle: ValidationRuleHandle): void {
		this.#handles.update(handles => {
			handles.push(handle);
		});
		teardown(() => {
			this.#handles.update(handles => {
				const index = handles.indexOf(handle);
				if (index < 0) {
					return false;
				}
				handles.splice(index, 1);
			});
		});
	}

	async #validate(cause: ValidationCause, signal?: AbortSignal): Promise<boolean> {
		const handles = untrack(() => this.#handles.value);
		let valid = true;
		let show = true;
		for (let i = 0; i < handles.length; i++) {
			const handle = handles[i];
			const result = await trigger(() => handle.validate(cause, show, signal), capturedCycle => {
				if (capturedCycle === this.#cycle) {
					this.#cycle++;
					if (this.#trigger === "if-validated" || (this.#trigger === "if-invalid" && untrack(() => this.#invalid.value))) {
						this.#slot.sideEffect(signal => this.#validate("side-effect", signal));
					}
				}
			}, this.#cycle);
			if (!result) {
				valid = false;
				const followUp = handle.followUp ?? this.#followUp;
				if (followUp === "stop") {
					for (let r = i + 1; r < handles.length; r++) {
						handles[r].reset();
					}
					return false;
				}
				if (followUp === "hidden") {
					show = false;
				}
			}
		}
		return valid;
	}

	/**
	 * Validate all rules controlled by this validator.
	 *
	 * @returns True if valid.
	 */
	async validate(): Promise<boolean> {
		return this.#slot.block(() => this.#validate("manual"));
	}
}

/**
 * Validate using multiple validators in parallel.
 *
 * @returns True if valid.
 */
export async function validate(...validators: Validator[]): Promise<boolean> {
	return (await Promise.all(validators.map(v => v.validate()))).every(s => s);
}

export interface ValidationRuleHandle {
	/**
	 * Defines how to proceed when this rule is invalid.
	 */
	followUp?: ValidationFollowUp;

	/**
	 * Reactively get a space separated list of error message element ids.
	 */
	errorMessageIds: string | undefined;

	/**
	 * Validate this rule.
	 *
	 * Immediately used signals may trigger re-validation depending on the validator's trigger option.
	 *
	 * @param show True if the rule should be visible when invalid.
	 * @param signal An optional signal to abort async validation.
	 * @returns True if valid.
	 */
	validate(cause: ValidationCause, show: boolean, signal?: AbortSignal): boolean | Promise<boolean>;

	/**
	 * Reset and hide this rule.
	 */
	reset(): void;
}

export interface ValidationRuleFn {
	/**
	 * @param cause The validation cause.
	 * @param signal An optional abort signal to abort validation.
	 * @returns True if valid.
	 */
	(cause: ValidationCause, signal?: AbortSignal): boolean | Promise<boolean>;
}

/**
 * Component for defining and rendering a validation rule.
 */
export function ValidationRule(props: {
	/**
	 * The validator this rule is for.
	 */
	for: Validator;

	/**
	 * A function to check, if this rule is valid.
	 *
	 * Immediately used signals may trigger re-validation depending on the validator's trigger option.
	 */
	validate: ValidationRuleFn;

	/**
	 * Defines how to proceed when this rule is invalid.
	 */
	followUp?: ValidationFollowUp;

	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const visible = sig(false);
	const id = uniqueId();

	props.for.use({
		followUp: props.followUp,
		errorMessageIds: id,
		async validate(cause, show, signal) {
			if (!show) {
				visible.value = false;
			}
			const valid = await props.validate(cause, signal);
			visible.value = show && !valid;
			// TODO: If previously visible & now visible & cause is "manual", draw the users attention.
			return valid;
		},
		reset() {
			visible.value = false;
		},
	});

	return <Collapse
		visible={visible}
		class={props.class}
		style={props.style}
	>
		<ValidationMessage id={id}>
			{props.children}
		</ValidationMessage>
	</Collapse>;
}
