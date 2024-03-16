import { ClassValue, ContextKey, Emitter, Event, Expression, extract, For, map, sharedGlobal, sig, Signal, StyleValue, teardown, trigger, uniqueId, untrack } from "@mxjp/gluon";
import { TaskSlot } from "@mxjp/gluon/async";

import { THEME } from "../common/theme.js";
import { Collapse } from "./collapse.js";
import { Text } from "./text.js";

const VALIDATORS = sharedGlobal("gluon_ux:validators", () => new WeakMap<object, Validator>());

/**
 * Context key for validation options used by new validators.
 */
export const VALIDATION = Symbol.for("gluon_ux:validation") as ContextKey<ValidationOptions>;

/**
 * Defines when accessed signals trigger automatic validation.
 *
 * + **if-validated** - **Default.** Validate if validation did run before.
 * + **if-invalid** - Validate if currently invalid.
 * + **never** - Never validate automatically.
 */
export type ValidationSignalTrigger = "if-validated" | "if-invalid" | "never";

export interface ValidationOptions {
	signalTrigger?: ValidationSignalTrigger;
}

export class Validator {
	#slot = new TaskSlot();
	#signalTrigger: ValidationSignalTrigger;
	#rules = sig<ValidationRuleEntry[]>([]);
	#invalid = sig(false);
	#cycle = 0;

	constructor() {
		const options = extract(VALIDATION);
		this.#signalTrigger = options?.signalTrigger ?? "if-validated";
	}

	/**
	 * Reactively get all validation rule entries.
	 */
	rules = (): readonly ValidationRuleEntry[] => this.#rules.value;

	/**
	 * An expression to get a space separated list of error message ids.
	 */
	errorMessageIds = (): string => this.#rules.value.map(r => r.id).join(" ");

	/**
	 * An expression to check if this validator is in an invalid state.
	 */
	invalid = (): boolean => this.#invalid.value;

	#addRule(rule: ValidationRule, add: (rules: ValidationRuleEntry[], entry: ValidationRuleEntry) => void): void {
		const entry = new ValidationRuleEntry(rule);
		this.#rules.update(rules => {
			add(rules, entry);
		});
		teardown(() => {
			this.#rules.update(rules => {
				const index = rules.indexOf(entry);
				if (index < 0) {
					return false;
				}
				rules.splice(index, 1);
			});
		});
	}

	/**
	 * Add a rule to be validated first until the current lifecycle is disposed.
	 */
	prependRule(rule: ValidationRule): void {
		this.#addRule(rule, (rules, entry) => rules.unshift(entry));
	}

	/**
	 * Add a rule to be validated last until the current lifecycle is disposed.
	 */
	appendRule(rule: ValidationRule): void {
		this.#addRule(rule, (rules, entry) => rules.push(entry));
	}

	/**
	 * Attach this validator to an object.
	 */
	attach(target: object): void {
		VALIDATORS.set(target, this);
	}

	async #validate(sideEffect: boolean, signal?: AbortSignal): Promise<boolean> {
		this.#cycle++;
		const signalTrigger = this.#signalTrigger;
		const rules = untrack(() => this.#rules.value);
		for (let i = 0; i < rules.length; i++) {
			if (signal?.aborted) {
				return false;
			}
			const { validate, visible, alert } = rules[i];
			let valid: boolean;
			if (signalTrigger === "never") {
				valid = await validate(signal);
			} else {
				valid = await trigger(() => validate(signal), cycle => {
					if (this.#cycle === cycle) {
						if (signalTrigger === "if-invalid" && !this.#invalid.value) {
							return;
						}
						this.triggerValidation();
					}
				}, this.#cycle);
			}
			if (valid) {
				visible.value = false;
			} else {
				const wasVisible = visible.value;
				visible.value = true;
				for (let r = i + 1; r < rules.length; r++) {
					rules[r].visible.value = false;
				}
				this.#invalid.value = true;
				if (wasVisible && !sideEffect) {
					alert.emit();
				}
				return false;
			}
		}
		this.#invalid.value = false;
		return true;
	}

	/**
	 * Validate using the currently attached rules.
	 */
	async validate(signal?: AbortSignal): Promise<boolean> {
		return this.#slot.block(() => this.#validate(false, signal));
	}

	/**
	 * Trigger validation as a side effect.
	 */
	triggerValidation(): void {
		this.#slot.sideEffect(signal => this.#validate(true, signal));
	}

	/**
	 * Reset this validator to it's initial state.
	 */
	reset(): void {
		this.#cycle++;
		this.#invalid.value = false;
		const rules = untrack(() => this.#rules.value);
		for (let i = 0; i < rules.length; i++) {
			rules[i].visible.value = false;
		}
	}

	/**
	 * Get or attach a validator to an object.
	 */
	static attach(target: object): Validator {
		let validator = VALIDATORS.get(target);
		if (!validator) {
			validator = new Validator();
			VALIDATORS.set(target, validator);
		}
		return validator;
	}

	/**
	 * Get a validator for an object.
	 */
	static get(target: object): Validator | undefined {
		return VALIDATORS.get(target);
	}
}

export interface ValidationRule {
	validate(signal?: AbortSignal): boolean | Promise<boolean>;
	message: unknown;
}

export class ValidationRuleEntry {
	readonly id = uniqueId();
	readonly visible = sig(false);
	readonly alert = new Emitter<[]>();
	readonly message: unknown;
	readonly validate: ValidationRule["validate"];

	constructor(rule: ValidationRule) {
		this.message = rule.message;
		this.validate = rule.validate.bind(rule);
	}
}

export interface ValidateFn<T> {
	(value: T, signal?: AbortSignal): boolean | Promise<boolean>;
}

/**
 * Prepend a validation rule to the validator attached to the specified signal.
 *
 * This is a shorthand, meant to be used with `signal.pipe`.
 *
 * @param target The signal to attach the validator to.
 * @param validate A function to validate the current value. Immediately accessed signals may trigger re-validation when updated.
 * @param message The validation message to show when invalid.
 * @returns The target itself.
 */
export function rule<T>(target: Signal<T>, validate: ValidateFn<T>, message: unknown): Signal<T> {
	Validator.attach(target).prependRule({
		validate(signal) {
			return validate(target.value, signal);
		},
		message,
	});
	return target;
}

/**
 * Validate all specified targets in parallel.
 */
export async function validate(...targets: object[]): Promise<boolean> {
	const tasks: Promise<boolean>[] = [];
	for (const target of targets) {
		const validator = Validator.get(target);
		if (validator === undefined) {
			throw new Error("target has no attached validator.");
		}
		tasks.push(validator.validate());
	}
	return !(await Promise.all(tasks)).includes(false);
}

export function ValidationMessage(props: {
	visible?: Expression<boolean | undefined>;
	alert?: Event<[]>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <Collapse
		visible={map(props.visible, v => v ?? true)}
		alert={props.alert}
		class={[
			props.class,
			theme?.validation_message_container,
		]}
		style={props.style}
		id={props.id}
	>
		<div class={theme?.validation_message}>
			<Text>
				{props.children}
			</Text>
		</div>
	</Collapse>;
}

/**
 * Render validation messages for the validator attached to a specific target.
 */
export function ValidationMessages(props: {
	for: object;
}): unknown {
	const validator = Validator.attach(props.for);
	return <For each={validator.rules}>
		{rule => <ValidationMessage visible={rule.visible} alert={rule.alert.event} id={rule.id}>
			{rule.message}
		</ValidationMessage>}
	</For>;
}
