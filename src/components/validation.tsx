import { Context, Signal } from "rvx";

const VALIDATORS = new WeakMap<Signal<unknown>, Validator>();

export const VALIDATION = new Context<ValidationOptions | undefined>();

export type ValidationTrigger = "if-validated" | "if-invalid" | "never";

export interface ValidationOptions {
	trigger?: ValidationTrigger;
}

export class Validator {
	#trigger: ValidationTrigger;

	constructor() {
		const options = VALIDATION.current;
		this.#trigger = options?.trigger ?? "if-invalid";
	}

	invalid = (): boolean => {
		throw new Error("not implemented");
	};

	messageIds = (): string => {
		throw new Error("not implemented");
	};

	attach(target: Signal<unknown>): void {
		VALIDATORS.set(target, this);
	}

	static get(target: Signal<unknown>): Validator {
		let validator = closestValidator(target);
		if (!validator) {
			validator = new Validator();
			validator.attach(target.root);
		}
		return validator;
	}
}

export function validatorFor(target: Signal<unknown>): Validator | undefined {
	return VALIDATORS.get(target);
}

export function closestValidator(target: Signal<unknown>): Validator | undefined;
export function closestValidator(target: Signal<unknown> | undefined): Validator | undefined {
	while (target) {
		const validator = VALIDATORS.get(target);
		if (validator) {
			return validator;
		}
		target = target.source;
	}
}
