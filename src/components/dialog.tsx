import { capture, ClassValue, extract, mount, StyleValue } from "@mxjp/gluon";

import { Column, FlexSpace, Row, THEME } from "../index.js";
import { Layer, layerHotkey } from "./layer.js";

export class DialogAbortError extends Error {}

export interface Dialog<T> {
	resolve: (value: T) => void;
	reject: (cause?: unknown) => void;
}

export type DialogInit<T> = (dialog: Dialog<T>) => unknown;

export interface DialogOptions {
	cancellable?: boolean;
}

export function showDialog<T>(init: DialogInit<T>, options?: DialogOptions): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const dispose = capture(() => mount(
			document.body,
			<Layer>
				{() => {
					const dialog: Dialog<T> = {
						resolve(value) {
							dispose();
							resolve(value);
						},

						reject(reason) {
							dispose();
							reject(reason);
						},
					};

					if (options?.cancellable ?? true) {
						layerHotkey("escape", () => {
							dialog.reject(new DialogAbortError());
						});
					}

					// TODO: Support auto focus.

					return init(dialog);
				}}
			</Layer>
		));
	});
}

export function DialogBody(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <div
		class={[
			theme?.dialog_container,
			props.class,
		]}
		style={props.style}
	>
		<Column class={theme?.dialog_body}>
			{props.children}
		</Column>
	</div>;
}

export function DialogFooter(props: {
	class?: ClassValue;
	style?: StyleValue;
	links?: unknown;
	children?: unknown;
}): unknown {
	return <Row class={props.class} style={props.style}>
		{props.links}
		<FlexSpace />
		{props.children}
	</Row>;
}
