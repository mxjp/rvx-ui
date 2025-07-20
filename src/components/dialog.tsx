import { $, captureSelf, ClassValue, Context, Emitter, Event, Expression, map, render, StyleValue, teardown, uniqueId } from "rvx";
import { TASKS, Tasks, useMicrotask } from "rvx/async";
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

export const DIALOG_FADEOUT = new Context<Event<[tasks: Promise<void>[]]> | undefined>();

export function showDialog<T = void>(init: DialogInit<T>, options?: DialogOptions): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		captureSelf(dispose => {
			const enabled = $(true);
			const fadeout = new Emitter<[tasks: Promise<void>[]]>();
			const view = render(
				<Layer modal enabled={enabled}>
					{() => Context.inject([
						TASKS.with(new Tasks()),
						DIALOG_FADEOUT.with(fadeout.event),
					], () => {
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
					})}
				</Layer>
			);
			view.appendTo(document.body);
			teardown(async () => {
				try {
					enabled.value = false;
					const tasks: Promise<void>[] = [];
					fadeout.emit(tasks);
					await Promise.all(tasks);
				} finally {
					view.detach();
				}
			});
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
	blockSize?: Expression<string | undefined>;

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

	const body = <div
		class={[
			theme?.dialog_container,
			props.class,
		]}
		style={[
			props.style,
			{
				"--dialog-inline-size": map(props.inlineSize, v => v ?? "auto"),
				"--dialog-block-size": map(props.blockSize, v => v ?? "auto"),
			},
		]}
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
		>
			{head}
			{props.children}
		</div>
	</div> as HTMLElement;

	useMicrotask(() => {
		if (theme?.dialog_fadein) {
			body.offsetParent;
			body.classList.add(theme.dialog_fadein);
		}
	});

	DIALOG_FADEOUT.current?.(tasks => {
		if (theme?.dialog_fadeout) {
			body.classList.add(theme.dialog_fadeout);
		}
		const duration = parseInt(getComputedStyle(body).getPropertyValue("--dialog-fadeout-ms"));
		if (Number.isSafeInteger(duration)) {
			tasks.push(new Promise(resolve => setTimeout(resolve, duration)));
		}
	});

	return body;
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
