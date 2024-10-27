import { captureSelf, ClassValue, Expression, map, mount, StyleValue } from "rvx";
import { TASKS, Tasks } from "rvx/async";
import { uniqueId } from "rvx/id";
import { FlexSpace, Heading, Row, Text, THEME } from "../index.js";
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
						return TASKS.inject(new Tasks(), () => {
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
								LAYER.current!.useHotkey("escape", () => {
									dialog.reject(new DialogAbortError());
								});
							}
							return init(dialog);
						});
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

	inlineSize?: Expression<string | undefined>;
	maxInlineSize?: Expression<string | undefined>;
	blockSize?: Expression<string | undefined>;
	maxBlockSize?: Expression<string | undefined>;

	"aria-labelledby"?: Expression<string | undefined>;
	"aria-describedby"?: Expression<string | undefined>;
}): unknown {
	const theme = THEME.current;

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
		role={map(props.role, v => v ?? "dialog")}
		aria-labelledby={map(props["aria-labelledby"], v => v ?? titleId)}
		aria-describedby={map(props["aria-describedby"], v => v ?? descriptionId)}
	>
		<div
			class={[
				theme?.column,
				theme?.column_content,
				theme?.dialog_body,
			]}
			style={{
				"inline-size": props.inlineSize,
				"max-inline-size": props.maxInlineSize,
				"block-size": props.blockSize,
				"max-block-size": props.maxBlockSize,
			}}
		>
			{head}
			{props.children}
		</div>
	</div>;
}

export function DialogFooter(props: {
	class?: ClassValue;
	style?: StyleValue;
	links?: unknown;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
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
