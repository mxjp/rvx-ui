import { $, captureSelf, Component, For, movable, render, teardown, View } from "rvx";
import { useTimeout } from "rvx/async";
import { THEME } from "../common/theme.js";
import { Collapse } from "./collapse.js";
import { Column } from "./column.js";

export type NotificationVariant = "default" | "info" | "success" | "warning" | "danger";

export interface Notification {
	dispose(): void;
}

export interface NotificationOptions {
	variant?: NotificationVariant;
	timeout?: number;
	raw?: boolean;
}

let host: View | undefined;
const instances = $<Component[]>([]);

export function showNotification(content: Component<Notification>, options?: NotificationOptions): Notification {
	const theme = THEME.current;
	if (!host) {
		host = render(<div class={theme?.notification_host}>
			<Column class={theme?.notification_area} size="group">
				<For each={instances}>
					{instance => instance()}
				</For>
			</Column>
		</div>);
	}
	host.appendTo(document.body);

	let handle!: Notification;
	captureSelf(dispose => {
		handle = { dispose };
		const visible = $(true);

		const instance = movable(<Collapse fadein visible={visible}>
			<div class={[
				theme?.notification,
				options?.raw ? theme?.notification_raw : undefined,
				theme?.[`notification_${options?.variant ?? "default"}`],
			]}>
				{options?.raw
					? content(handle)
					: <Column size="group">
						{content(handle)}
					</Column>
				}
			</div>
		</Collapse>).move;

		instances.update(instances => {
			instances.push(instance);
		});
		// TODO: Scroll notification into view.

		if (options?.timeout !== undefined) {
			// TODO: Pause & reset on notification area hover.
			useTimeout(dispose, options.timeout);
		}

		teardown(() => {
			visible.value = false;
			setTimeout(() => {
				instances.update(instances => {
					const index = instances.indexOf(instance);
					if (index >= 0) {
						instances.splice(index, 1);
					}
				});
			}, 1000);
		});
	});

	return handle;
}
