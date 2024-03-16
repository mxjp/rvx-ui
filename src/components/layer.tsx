import { ContextKey, Expression, extract, get, Inject, memo, sig, Signal, teardown, untrack, watch, wrapContext } from "@mxjp/gluon";

import { Action, handleActionEvent, keyFor } from "../common/events.js";

interface LayerInstance {
	/** The root nodes of this layer. */
	roots: Node[];
	/** True if this is a modal layer. */
	modal: boolean;
	/** A signal representing if this layer is inert due to a modal layer on top. */
	inert: Signal<boolean>;
}

export const LAYER = Symbol.for("gluon-ux:layer-handle") as ContextKey<LayerHandle>;

const LAYERS = sig<LayerInstance[]>([
	{
		roots: [],
		modal: false,
		inert: sig(false),
	},
]);

watch(LAYERS, layers => {
	const modal = layers.findLastIndex(l => l.modal);
	for (let i = 0; i < layers.length; i++) {
		layers[i].inert.value = i < modal;
	}
});

/**
 * Render content inside the root layer.
 */
export function RootLayer(props: {
	children: () => unknown;
}): unknown {
	const layer = LAYERS.value[0];
	const root = <div
		style={{ display: "contents" }}
		inert={layer.inert}
	>
		<Inject key={LAYER} value={new Handle(layer)}>
			{props.children}
		</Inject>
	</div> as HTMLDivElement;
	layer.roots.push(root);
	teardown(() => {
		const index = layer.roots.indexOf(root);
		if (index >= 0) {
			layer.roots.splice(index, 1);
		}
	});
	return root;
}

/**
 * An input layer that is inert while there are other modal layers on top of it.
 *
 * After creation, the first element with the "autofocus" attribute inside this layer is focused.
 *
 * When disposed, focus is moved back to the previously focused element.
 */
export function Layer(props: {
	children: () => unknown;

	/**
	 * If true, all layers below this one are marked as inert until the current context is disposed.
	 */
	modal?: boolean;

	/**
	 * If false, the layer doesn't affect other layers but is marked as inert. Default is true.
	 */
	enabled?: Expression<boolean | undefined>;
}): unknown {
	const layer: LayerInstance = {
		roots: [],
		modal: props.modal ?? false,
		inert: sig(false),
	};

	const enabled = memo(() => Boolean(get(props.enabled) ?? true));
	watch(enabled, enable => {
		if (!enable) {
			return;
		}

		LAYERS.update(layers => {
			layers.push(layer);
		});

		const previous = document.activeElement;
		if (previous && previous !== document.body) {
			(previous as HTMLElement).blur?.();
		}

		queueMicrotask(() => {
			const layers = LAYERS.value;
			if (layer === layers[layers.length - 1] && root.isConnected) {
				(root.querySelector("[autofocus]")! as HTMLElement)?.focus?.();
			}
		});

		teardown(() => {
			let next: LayerInstance | undefined = undefined;
			LAYERS.update(layers => {
				const index = layers.lastIndexOf(layer);
				if (index >= 0) {
					layers.splice(index, 1);
					next = layers[index - 1];
				}
			});

			queueMicrotask(() => {
				const layers = LAYERS.value;
				if (next === layers[layers.length - 1] && previous?.isConnected && previous !== document.body) {
					(previous as HTMLElement).focus?.();
				}
			});
		});
	});

	const root = <div
		style={{ display: "contents" }}
		inert={() => layer.inert.value || !enabled()}
	>
		<Inject key={LAYER} value={new Handle(layer)}>
			{props.children}
		</Inject>
	</div> as HTMLElement;
	layer.roots.push(root);
	return root;
}

export interface LayerHandle {
	/**
	 * Reactively check if this layer is inert.
	 */
	get inert(): boolean;

	/**
	 * Reactively check if this is the top layer.
	 */
	get top(): boolean;

	/**
	 * Add a global event listener that is only called when this is the top layer.
	 *
	 * The current context is available in the event listener.
	 *
	 * The event listener is removed when the current context is disposed.
	 *
	 * @param type The event type.
	 * @param listener The event listener.
	 * @param options Event listener options. See {@link window.addEventListener}.
	 */
	useEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
	useEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;

	/**
	 * Shorthand for adding a global "keydown" event listener using {@link useEvent} and {@link keyFor}.
	 */
	useHotkey(key: string, action: Action): void;

	/**
	 * Check if this layer contains the specified node.
	 *
	 * @param node The node to check.
	 */
	contains(node: Node): boolean;

	/**
	 * Check if this layer or any layers in top contain the specified node.
	 *
	 * @param node The node to check.
	 * @param includeModals If false (default), any modal layers on top or layers above that are ignored.
	 */
	stackContains(node: Node, includeModals?: boolean): boolean;
}

/**
 * Reactively check if the layer in the current context (or the root layer if there is none) is inert.
 */
export function isInertLayer(): boolean {
	return extract(LAYER)?.inert ?? untrack(() => LAYERS.value[0]).inert.value;
}

/**
 * Reactively check if the layer in the current context (or the root layer if there is none) is the top layer.
 */
export function isTopLayer(): boolean {
	return extract(LAYER)?.top ?? LAYERS.value.length === 1;
}

function instanceContains(instance: LayerInstance, node: Node): boolean {
	const roots = instance.roots;
	for (let i = 0; i < roots.length; i++) {
		const root = roots[i];
		if (root === node || root.contains(node)) {
			return true;
		}
	}
	return false;
}

class Handle implements LayerHandle {
	#instance: LayerInstance;

	constructor(instance: LayerInstance) {
		this.#instance = instance;
	}

	get inert(): boolean {
		return this.#instance.inert.value;
	}

	get top(): boolean {
		const layers = LAYERS.value;
		return layers[layers.length - 1] === this.#instance;
	}

	useEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
	useEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
	useEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void {
		const wrapper = wrapContext((event: Event): void => {
			if (this.top) {
				listener(event);
			}
		});
		window.addEventListener(type, wrapper, options);
		teardown(() => {
			window.removeEventListener(type, wrapper, options);
		});
	}

	useHotkey(key: string, action: Action): void {
		this.useEvent("keydown", event => {
			if (keyFor(event) === key) {
				handleActionEvent(event, action);
			}
		});
	}

	contains(node: Node): boolean {
		return instanceContains(this.#instance, node);
	}

	stackContains(node: Node, includeModals = false): boolean {
		const layers = untrack(() => LAYERS.value);
		let i = layers.indexOf(this.#instance);
		if (i < 0) {
			return this.contains(node);
		}
		for (;;) {
			if (instanceContains(layers[i], node)) {
				return true;
			}
			i++;
			if (i >= layers.length || (!includeModals && layers[i].modal)) {
				return false;
			}
		}
	}
}
