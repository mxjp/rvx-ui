import { $, Component, Context, Expression, get, Inject, memo, Signal, teardown, uncapture, untrack, watch } from "rvx";

import { Action, handleActionEvent, isKey, Key } from "../common/events.js";

interface LayerInstance {
	/** The root nodes of this layer. */
	roots: Node[];
	/** True if this is a modal layer. */
	modal: boolean;
	/** A signal representing if this layer is inert due to a modal layer on top. */
	inert: Signal<boolean>;
	/** An element to use as auto focus fallback. */
	autoFocusFallback: Element | undefined;
}

export const LAYER = new Context<LayerHandle | undefined>();

const LAYERS = $<LayerInstance[]>([
	{
		roots: [],
		modal: false,
		inert: $(false),
		autoFocusFallback: undefined,
	},
]);

const TOP_LAYER: LayerInstance = {
	roots: [],
	modal: false,
	inert: $(false),
	autoFocusFallback: undefined,
};

uncapture(() => watch(LAYERS, layers => {
	const modal = layers.findLastIndex(l => l.modal);
	for (let i = 0; i < layers.length; i++) {
		layers[i].inert.value = i < modal;
	}
}));

function staticLayer(layer: LayerInstance, content: Component): unknown {
	const root = <div
		data-rvx-layer
		style={{ display: "contents" }}
		inert={layer.inert}
	>
		<Inject context={LAYER} value={new Handle(layer)}>
			{content}
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
 * Render content inside the root layer.
 */
export function RootLayer(props: {
	children: Component;
}): unknown {
	return staticLayer(untrack(() => LAYERS.value[0]), props.children);
}

/**
 * Render content inside the top layer.
 *
 * This layer is not affected by other modal layers.
 */
export function TopLayer(props: {
	children: Component;
}): unknown {
	return staticLayer(TOP_LAYER, props.children);
}

/**
 * An input layer that is inert while there are other modal layers on top of it.
 *
 * After creation, the first element with the "autofocus" attribute inside this layer is focused.
 *
 * When disposed, focus is moved back to the previously focused element.
 */
export function Layer(props: {
	children: Component;

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
		inert: $(false),
		autoFocusFallback: undefined,
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
				let active = document.activeElement;
				if (active && (root === active || root.contains(active))) {
					return;
				}

				const autoFocus = root.querySelector("[autofocus]");
				if (autoFocus) {
					(autoFocus as HTMLElement).focus?.();
					active = document.activeElement;
					if (active === autoFocus) {
						return;
					}
				}

				(layer.autoFocusFallback as HTMLElement | undefined)?.focus?.();
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
		data-rvx-layer
		style={{ display: "contents" }}
		inert={() => layer.inert.value || !enabled()}
	>
		<Inject context={LAYER} value={new Handle(layer)}>
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
	 * Shorthand for adding a global "keydown" event listener using {@link useEvent}.
	 */
	useHotkey(key: string | Key, action: Action): void;

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

	/**
	 * Try focusing the specified element after the layer is created (in the next microtask), if no element with the `autofocus` attribute has been found or successfully focused.
	 *
	 * @param element The element to use as fallback.
	 */
	useAutoFocusFallback(element: Element): void;
}

/**
 * Reactively check if the layer in the current context (or the root layer if there is none) is inert.
 */
export function isInertLayer(): boolean {
	return LAYER.current?.inert ?? untrack(() => LAYERS.value[0]).inert.value;
}

/**
 * Reactively check if the layer in the current context (or the root layer if there is none) is the top layer.
 */
export function isTopLayer(): boolean {
	return LAYER.current?.top ?? LAYERS.value.length === 1;
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
		if (this.#instance === TOP_LAYER) {
			return true;
		}
		const layers = LAYERS.value;
		return layers[layers.length - 1] === this.#instance;
	}

	useEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
	useEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
	useEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void {
		const wrapper = Context.wrap((event: Event): void => {
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
			if (isKey(event, key)) {
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
		for (; ;) {
			if (instanceContains(layers[i], node)) {
				return true;
			}
			i++;
			if (i >= layers.length || (!includeModals && layers[i].modal)) {
				return false;
			}
		}
	}

	useAutoFocusFallback(element: Element | undefined): void {
		this.#instance.autoFocusFallback = element;
	}
}
