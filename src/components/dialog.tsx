import styles from "@rvx/ui/theme/components/dialog.module.css";
import { $, captureSelf, ClassValue, Context, Emitter, Event, Expression, map, render, StyleValue, teardown, uniqueId } from "rvx";
import { TASKS, Tasks, useMicrotask } from "rvx/async";
import { inOverlayContext } from "../common/context.js";
import { Column, Group } from "./column.js";
import { FlexSpace } from "./flex-space.js";
import { Heading } from "./heading.js";
import { LAYER, Layer } from "./layer.js";
import { Row } from "./row.js";
import { Separated } from "./separated.js";
import { Text } from "./text.js";

export class DialogAbortError extends Error { }

export interface Dialog<T> {
	resolve: (value: T) => void;
	reject: (cause?: unknown) => void;
}

export type DialogInit<T> = (dialog: Dialog<T>) => unknown;

export interface DialogOptions {
	cancellable?: boolean;
	detachCancel?: boolean;
}

export const DIALOG_FADEOUT = new Context<Event<[tasks: Promise<void>[]]> | undefined>();

export function showDialog<T = void>(init: DialogInit<T>, options?: DialogOptions): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		inOverlayContext(captureSelf, dispose => {
			const enabled = $(true);
			const fadeout = new Emitter<[tasks: Promise<void>[]]>();
			const view = render(
				<Layer modal enabled={enabled}>
					{() => Context.provide([
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
								reject(reason ?? new DialogAbortError());
							},
						};
						if (options?.cancellable ?? true) {
							TASKS.provide((options?.detachCancel ?? true) ? null : TASKS.current, () => {
								LAYER.current!.useHotkey("escape", () => {
									dialog.reject();
								});
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

	let resolveFadeOut: (() => void) | undefined;
	function fadeOutEnd(event: globalThis.Event) {
		if (event.target === body) {
			resolveFadeOut?.();
		}
	}

	DIALOG_FADEOUT.current?.(tasks => {
		if (styles.fadeout) {
			body.classList.add(styles.fadeout);
		}
		const inner = resolveFadeOut;
		tasks.push(new Promise(resolve => {
			resolveFadeOut = () => {
				inner?.();
				resolve();
			};
		}));
	});

	const body = <div
		class={[
			styles.container,
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
		on:transitionend={fadeOutEnd}
		on:transitioncancel={fadeOutEnd}
	>
		<Separated class={styles.body}>
			{head.length > 0 ? <Group padded>{head}</Group> : undefined}
			{props.children}
		</Separated>
	</div> as HTMLElement;

	useMicrotask(() => {
		if (styles.fadein) {
			body.offsetParent;
			body.classList.add(styles.fadein);
		}
	});

	return body;
}

export function DialogContent(props: Omit<Parameters<typeof Column>[0], "padded" | "size">) {
	return Column({ ...props, padded: true });
}

export function DialogFooter(props: {
	class?: ClassValue;
	style?: StyleValue;
	links?: unknown;
	children?: unknown;
}): unknown {
	return <Group padded>
		<Row
			class={[
				styles.footer,
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
		</Row>
	</Group>
}
