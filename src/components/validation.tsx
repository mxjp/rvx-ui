import { $, Component, Context, Emitter, memo, Signal, teardown, trigger, TriggerPipe, uniqueIdFor, untrack } from "rvx";
import { Queue } from "rvx/async";
import { CollapseFor, CollapseItem } from "./collapse.js";
import { ErrorMessage } from "./error.js";

const VALIDATORS = new WeakMap<Signal<unknown>, Validator>();
const ALERTS = new WeakMap<Component, Emitter<[]>>();

export const VALIDATION = new Context<ValidationOptions | undefined>();

export type ValidationTrigger = "if-validated" | "if-invalid" | "never";

export interface ValidationOptions {
	trigger?: ValidationTrigger;
}

export interface ValidationRule {
	/**
	 * Validate this rule.
	 *
	 * Immediately accessed signals may be tracked by the caller to trigger automatic re-validation when updated.
	 *
	 * @param abortSignal An optional abort signal to abort validaiton if supported.
	 * @returns An array of validation message components. If empty, this rule is considered valid.
	 */
	(abortSignal?: AbortSignal): Component[] | undefined | Promise<Component[] | undefined>;
}

export class ValidationRuleEntry {
	#rule: ValidationRule;
	#pipe: TriggerPipe;
	#result = $<Component[]>([]);

	constructor(rule: ValidationRule, notify: () => void) {
		this.#rule = rule;
		this.#pipe = trigger(notify);
	}

	get messages(): Component[] {
		return this.#result.value;
	}

	async validate(abortSignal: AbortSignal | undefined, sideEffect: boolean): Promise<boolean> {
		const messages = (await this.#pipe(() => this.#rule(abortSignal))) ?? [];
		if (!sideEffect) {
			for (const message of messages) {
				if (this.#result.value.includes(message)) {
					ALERTS.get(message)?.emit();
				}
			}
		}
		this.#result.value = messages;
		return messages.length === 0;
	}

	reset(): void {
		this.#pipe(() => { });
		this.#result.value = [];
	}
}

export class Validator {
	#queue = new Queue();
	#trigger: ValidationTrigger;
	#rules = $<ValidationRuleEntry[]>([]);
	#notified = false;

	constructor() {
		const options = VALIDATION.current;
		this.#trigger = options?.trigger ?? "if-invalid";
	}

	#notify = (): void => {
		if (this.#notified || this.#trigger === "never" || (this.#trigger === "if-invalid" && !this.#invalid())) {
			return;
		}
		this.#notified = true;
		queueMicrotask(() => {
			if (this.#notified) {
				this.#queue.sideEffect(abortSignal => this.#validate(abortSignal, true));
			}
		});
	};

	#createRuleEntry(rule: ValidationRule): ValidationRuleEntry {
		const entry = new ValidationRuleEntry(rule, this.#notify);
		teardown(() => {
			this.#rules.update(rules => {
				const index = rules.indexOf(entry);
				if (index < 0) {
					return false;
				}
				rules.splice(index, 1);
			});
		});
		return entry;
	}

	#validate = async (abortSignal: AbortSignal | undefined, sideEffect: boolean): Promise<boolean> => {
		this.#notified = false;
		let valid = true;
		// TODO: Support custom validation behavior.
		for (const rule of untrack(() => this.#rules.value)) {
			if (valid) {
				valid = await rule.validate(abortSignal, sideEffect);
			} else {
				rule.reset();
			}
		}
		return valid;
	};

	validate(abortSignal?: AbortSignal): Promise<boolean> {
		return this.#queue.block(() => this.#validate(abortSignal, false));
	}

	#invalid = () => {
		return this.#rules.value.some(r => r.messages.length > 0);
	};

	/**
	 * Reactively check if this validator is in an invalid state.
	 *
	 * @returns `true` if invalid.
	 */
	invalid = memo<boolean>(this.#invalid);

	/**
	 * Reactively get a space separated list of message ids.
	 */
	messageIds = memo<string>(() => {
		return this.#rules.value.flatMap(r => r.messages).map(uniqueIdFor).join(" ");
	});

	get rules(): ValidationRuleEntry[] {
		return this.#rules.value;
	}

	/**
	 * Append a rule to this validator until the current lifecycle is disposed.
	 */
	appendRule(rule: ValidationRule): void {
		const entry = this.#createRuleEntry(rule);
		this.#rules.update(rules => {
			rules.push(entry);
		});
	}

	/**
	 * Prepend a rule to this validator until the current lifecycle is disposed.
	 */
	prependRule(rule: ValidationRule): void {
		const entry = this.#createRuleEntry(rule);
		this.#rules.update(rules => {
			rules.unshift(entry);
		});
	}

	/**
	 * Attach this validator to the specified target.
	 *
	 * This will overwrite existing validators on the target.
	 */
	attach(target: Signal<unknown>): void {
		VALIDATORS.set(target, this);
	}

	/**
	 * Find the {@link closestValidator closest validator} or {@link Validator.prototype.attach attach} a new one to the target's {@link Signal.prototype.root root}.
	 */
	static get(target: Signal<unknown>): Validator {
		let validator = closestValidator(target);
		if (!validator) {
			validator = new Validator();
			validator.attach(target.root);
		}
		return validator;
	}
}

export type ValidationTarget = Validator | Signal<unknown>;

/**
 * Get the validator attached to the specified target.
 *
 * @param target The target.
 * @returns The validator or `undefined` if there is none.
 */
export function validatorFor(target: ValidationTarget): Validator | undefined {
	if (target instanceof Validator) {
		return target;
	}
	return VALIDATORS.get(target);
}

/**
 * Find the closest validator attached to the specified target or any of it's {@link Signal.prototype.source sources}.
 *
 * @param target The target.
 * @returns The validator or `undefined` if there is none.
 */
export function closestValidator(target: ValidationTarget | undefined): Validator | undefined {
	while (target) {
		const validator = validatorFor(target);
		if (validator) {
			return validator;
		}
		target = (target as Signal<unknown>).source;
	}
}

/**
 * Validate the specified targets in parallel.
 *
 * @param targets The targets that have attached validators.
 * @param abortSignal An optional abort signal to abort validation if supported.
 * @returns `true` if valid.
 */
export async function validate(targets: ValidationTarget[], abortSignal?: AbortSignal): Promise<boolean> {
	const tasks: Promise<boolean>[] = [];
	for (let i = 0; i < targets.length; i++) {
		const validator = validatorFor(targets[i]);
		if (validator === undefined) {
			throw new Error(`targets[${i}] has no attached validator.`);
		}
		tasks.push(validator.validate(abortSignal));
	}
	return !(await Promise.all(tasks)).includes(false);
}

export function ValidationMessages(props: {
	for: Signal<unknown> | Validator;
}) {
	const validator = props.for instanceof Validator
		? props.for
		: closestValidator(props.for);

	if (!validator) {
		throw new Error("props.for is or has no attached validator.");
	}

	return <CollapseFor each={function * (): IterableIterator<CollapseItem<Component>> {
		for (const rule of validator.rules) {
			for (const message of rule.messages) {
				let alert = ALERTS.get(message);
				if (!alert) {
					alert = new Emitter<[]>();
					ALERTS.set(message, alert);
				}
				yield {
					value: message,
					id: uniqueIdFor(message),
					alert: alert.event,
				};
			}
		}
	}}>
		{message => <ErrorMessage>
			{message()}
		</ErrorMessage>}
	</CollapseFor>;
}
