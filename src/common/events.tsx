import { TASKS } from "rvx/async";

export interface Key {
	key: string;
	meta?: boolean;
	alt?: boolean;
	shift?: boolean;
	ctrl?: boolean;
}

export function isKey(event: KeyboardEvent, key: string | Key) {
	if (typeof key === "string") {
		key = { key };
	}
	return event.key.toLowerCase() === key.key
		&& event.metaKey === (key.meta ?? false)
		&& event.altKey === (key.alt ?? false)
		&& event.shiftKey === (key.shift ?? false)
		&& event.ctrlKey === (key.ctrl ?? false);
}

/**
 * A function to run an optionally async user action.
 *
 * Returning false indicates, that no action has been performed and that another action or the browser default behavior can be run.
 */
export type Action<T extends unknown[] = []> = (event: Event, ...args: T) => void | boolean | Promise<void>;

/**
 * Call an action that was triggered by the specified event.
 */
export function handleActionEvent<T extends unknown[]>(event: Event, action: Action<T>, ...args: T): boolean {
	const result = action(event, ...args);
	if (result === false) {
		return false;
	}
	event.preventDefault();
	event.stopImmediatePropagation();
	if (result instanceof Promise) {
		TASKS.current?.waitFor(result);
	}
	return true;
}

/**
 * Run an action of the event target is hovered for a minimum duration.
 *
 * @param event The "mouseenter" event.
 * @param action The action to run.
 * @param delay The delay to wait for.
 *
 * @example
 * ```tsx
 * <button on:mouseenter={event => {
 *   startDelayedHoverOnMouseenter(event, () => {
 *     // Close things like popovers or dropdowns in the same context
 *     // when this button was hovered for some time:
 *     event.target.dispatchEvent(createPassiveActionEvent());
 *   });
 * }}>Hover me!</button>
 * ```
 */
export function startDelayedHoverOnMouseenter(event: MouseEvent, action: () => void, delay = 300): void {
	const timer = setTimeout(action, delay);
	const cancel = () => {
		event.target?.removeEventListener("mouseleave", cancel);
		event.target?.removeEventListener("mousedown", cancel, { capture: true });
		event.target?.removeEventListener("touchstart", cancel, { capture: true });
		clearTimeout(timer);
	};
	event.target?.addEventListener("mouseleave", cancel);
	event.target?.addEventListener("mousedown", cancel, { capture: true });
	event.target?.addEventListener("touchstart", cancel, { capture: true });
}

/**
 * Rvx-ui's passive action event name.
 *
 * + This can be dispatched from an element to indicate that the user is likely no longer interested in interacting with other elements in the same context.
 * + This is currently used to close nested dropdowns when the user hovers another dropdown item in the parent for some time.
 */
export const PASSIVE_ACTION_EVENT = "rvx-ui:passive-action";

/**
 * Create a {@link PASSIVE_ACTION_EVENT} custom event.
 *
 * This event does not bubble.
 */
export function createPassiveActionEvent(): Event {
	return new CustomEvent(PASSIVE_ACTION_EVENT);
}

/**
 * Debounce an event handler.
 */
export function debounceEvent<T>(delayMs: number, handler: (event: T) => void): (event: T) => void {
	let timer: number;
	return event => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = (setTimeout as typeof window.setTimeout)(() => handler(event), delayMs);
	};
}
