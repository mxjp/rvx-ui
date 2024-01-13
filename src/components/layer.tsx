import { ContextKeyFor, extract, Inject, sig, Signal, teardown, watch, wrapContext } from "@mxjp/gluon";

import { Action, handleActionEvent, keyFor } from "../common/events.js";

interface LayerInstance {
	modal: boolean;
	inert: Signal<boolean>;
}

const LAYER = Symbol.for("gluon-ux:layer") as ContextKeyFor<LayerInstance>;

const LAYERS = sig<LayerInstance[]>([
	{
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
 * Reactively check if the layer of the current context is inert.
 */
export function isInertLayer(): boolean {
	return extract(LAYER)?.inert.value ?? LAYERS.value[0].inert.value;
}

/**
 * Reactively check if the layer of the current context is the active layer.
 */
export function isActiveLayer(): boolean {
	const layers = LAYERS.value;
	return (extract(LAYER) ?? layers[0]) === layers[layers.length - 1];
}

/**
 * An input layer that is inert while there are other modal layers on top of it.
 *
 * After creation, the first element with the "autofocus" attribute inside this layer is focused.
 *
 * When disposed, focus is moved back to the previously focused element.
 */
export function Layer(props: {
	/**
	 * If true, this will act as the root layer.
	 *
	 * There can be multiple root layers at the same time.
	 */
	root?: boolean;

	/**
	 * If true, all layers below this one are marked as inert until the current context is disposed.
	 */
	modal?: boolean;

	children: () => unknown;
}): unknown {
	let layer: LayerInstance;
	if (props.root) {
		layer = LAYERS.value[0];
	} else {
		layer = {
			modal: props.modal ?? false,
			inert: sig(false),
		};

		LAYERS.update(layers => {
			layers.push(layer);
		});

		const previous = document.activeElement;
		if (previous && previous !== document.body) {
			(previous as HTMLElement).blur?.();
		}

		queueMicrotask(() => {
			const layers = LAYERS.value;
			if (layer === layers[layers.length - 1] && container.isConnected) {
				(container.querySelector("[autofocus]")! as HTMLElement)?.focus?.();
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
	}
	const container = <div
		style={{ display: "contents" }}
		inert={layer.inert}
	>
		<Inject key={LAYER} value={layer}>
			{props.children}
		</Inject>
	</div> as HTMLElement;
	return container;
}

/**
 * Add a global event listener that is only called while the layer of the current context is the active layer.
 *
 * @param type The event type.
 * @param listener The event listener.
 * @param options Event listener options. See {@link window.addEventListener}.
 */
export function useLayerEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
export function useLayerEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
export function useLayerEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void {
	const wrapper = wrapContext((event: Event): void => {
		if (isActiveLayer()) {
			listener(event);
		}
	});
	window.addEventListener(type, wrapper, options);
	teardown(() => {
		window.removeEventListener(type, wrapper, options);
	});
}

/**
 * Shorthand for adding a global keydown event listener using {@link useLayerEvent} and {@link keyFor}.
 */
export function layerHotkey(key: string, action: Action): void {
	useLayerEvent("keydown", event => {
		if (keyFor(event) === key) {
			handleActionEvent(event, action);
		}
	});
}
