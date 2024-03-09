import { captureSelf, ClassValue, Expression, extract, get, Inject, mount, StyleValue, TASKS, Tasks, uniqueId } from "@mxjp/gluon";

import { Column, FlexSpace, Heading, Row, Text, THEME } from "../index.js";
import { LAYER, Layer } from "./layer.js";

export class DialogAbortError extends Error {}

export interface Dialog<T> {
	resolve: (value: T) => void;
	reject: (cause?: unknown) => void;
}

export type DialogInit<T> = (dialog: Dialog<T>) => unknown;

export interface DialogOptions {
	cancellable?: boolean;
}

export function showDialog<T = void>(init: DialogInit<T>, options?: DialogOptions): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		captureSelf(dispose => {
			mount(
				document.body,
				<Layer modal>
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
							extract(LAYER)?.useHotkey("escape", () => {
								dialog.reject(new DialogAbortError());
							});
						}
						return <Inject key={TASKS} value={new Tasks()}>
							{() => init(dialog)}
						</Inject>;
					}}
				</Layer>
			);
		});
	});
}

export type DialogRole = "dialog" | "alertdialog";

export function DialogBody(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
	role?: Expression<DialogRole | undefined>;
	title?: unknown;
	description?: unknown;

	"aria-labelledby"?: Expression<string | undefined>;
	"aria-describedby"?: Expression<string | undefined>;
}): unknown {
	const theme = extract(THEME);

	let titleId: string | undefined;
	let descriptionId: string | undefined;
	const head: unknown[] = [];

	if (props.title !== undefined) {
		titleId = uniqueId();
		head.push(<Heading level="2" id={titleId}>{props.title}</Heading>);
	}
	if (props.description !== undefined) {
		descriptionId = uniqueId();
		head.push(<Text id={descriptionId}>{props.description}</Text>);
	}

	return <div
		class={[
			theme?.dialog_container,
			props.class,
		]}
		style={props.style}
		role={() => get(props.role) ?? "dialog"}
		aria-labelledby={() => get(props["aria-labelledby"]) ?? titleId}
		aria-describedby={() => get(props["aria-describedby"]) ?? descriptionId}
	>
		<Column class={theme?.dialog_body}>
			{head}
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
	const theme = extract(THEME);
	return <Row
		size="control"
		class={[
			theme?.dialog_footer,
			props.class,
		]}
		style={props.style}
		align="center"
	>
		<Row size="control">
			{props.links}
		</Row>
		<FlexSpace />
		<Row size="control">
			{props.children}
		</Row>
	</Row>;
}
