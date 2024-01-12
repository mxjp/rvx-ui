import { ContextKeyFor, extract, Inject, sig, Signal, teardown, wrapContext } from "@mxjp/gluon";

/**
 * A function to check if a context is inert.
 */
export type InertFn = () => boolean;

const INERT = Symbol.for("gluon-ux:inert") as ContextKeyFor<InertFn>;
const INERT_STACK: Signal<boolean>[] = [sig(false)];

/**
 * Check if the current context is inert.
 */
export function isInert(): boolean {
	return extract(INERT)?.() ?? INERT_STACK[0].value;
}

/**
 * Check if the root context is inert.
 */
export function isRootInert(): boolean {
	return INERT_STACK[0].value;
}

/**
 * Create a new inert layer.
 *
 * All previous layers are marked as inert until the current context is disposed.
 */
export function useInertLayer(): InertFn {
	const inert = sig(false);
	INERT_STACK[INERT_STACK.length - 1].value = true;
	INERT_STACK.push(inert);
	teardown(() => {
		const index = INERT_STACK.lastIndexOf(inert);
		if (index >= 0) {
			INERT_STACK.splice(index, 1);
			INERT_STACK[INERT_STACK.length - 1].value = false;
		}
	});
	return () => inert.value;
}

/**
 * Component to render content in a new inert layer.
 *
 * All previous layers are marked as inert until the current context is disposed.
 */
export function Layer(props: {
	/**
	 * If true, the root layer is used instead of a new inert layer.
	 */
	root?: boolean;
	children: () => unknown;
}): unknown {
	const inert = props.root ? isRootInert : useInertLayer();
	return <div
		style={{ display: "contents" }}
		inert={inert}
	>
		<Inject key={INERT} value={inert}>
			{props.children}
		</Inject>
	</div>;
}

/**
 * Add a global event listener until the current context is disposed.
 *
 * If the current context is inert, the event listener is ignored.
 *
 * @param type The event type.
 * @param listener The event listener.
 * @param options Event listener options. See {@link window.addEventListener}.
 */
export function useLayerEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
export function useLayerEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
export function useLayerEvent(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void {
	const wrapper = wrapContext((event: Event): void => {
		if (!isInert()) {
			listener(event);
		}
	});
	window.addEventListener(type, wrapper, options);
	teardown(() => {
		window.removeEventListener(type, wrapper, options);
	});
}
