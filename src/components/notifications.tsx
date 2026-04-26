import styles from "@rvx/ui/theme/components/notifications.module.css";
import { $, captureSelf, Component, For, leak, movable, render, teardown, View } from "rvx";
import { useTimeout } from "rvx/async";
import { inOverlayContext } from "../common/context.js";
import { SizeContext } from "../common/types.js";
import { Card, CardVariant } from "./card.js";
import { Collapse } from "./collapse.js";
import { Column } from "./column.js";
import { TopLayer } from "./layer.js";

export type NotificationVariant = CardVariant;

export interface Notification {
	dispose(): void;
}

export interface NotificationOptions {
	variant?: NotificationVariant;
	timeout?: number;
	raw?: boolean;
	size?: SizeContext;
}

export interface NotificationHostOptions {
	inlineSize: string;
}

export const NOTIFICATIONS = $<NotificationHostOptions>({
	inlineSize: "32rem",
});

let host: View | undefined;
const instances = $<Component[]>([]);

export function showNotification(content: Component<Notification>, options?: NotificationOptions): Notification {
	return inOverlayContext(() => {
		if (!host) {
			leak(() => {
				host = render(<TopLayer>
					{() => <div
						class={styles.host}
						style={{
							"--notification-inline-size": () => NOTIFICATIONS.value.inlineSize,
						}}
					>
						<Column class={styles.area} size="group">
							<For each={instances}>
								{instance => instance()}
							</For>
						</Column>
					</div>}
				</TopLayer>);
			});
		}
		host!.appendTo(document.body);

		let handle!: Notification;
		captureSelf(dispose => {
			handle = { dispose };
			const visible = $(true);

			const instance = movable(<Collapse fadein visible={visible}>
				<Card
					class={styles.notification}
					variant={options?.variant}
					raw={options?.raw}
					size={options?.size}
				>
					{content(handle)}
				</Card>
			</Collapse>).move;

			instances.inert.push(instance);
			instances.notify();
			// TODO: Scroll notification into view.

			if (options?.timeout !== undefined) {
				// TODO: Pause & reset on notification area hover.
				useTimeout(dispose, options.timeout);
			}

			teardown(() => {
				visible.value = false;
				setTimeout(() => {
					const index = instances.inert.indexOf(instance);
					if (index >= 0) {
						instances.inert.splice(index, 1);
					}
					instances.notify();
					// TODO: Use transition delay:
				}, 1000);
			});
		});
		return handle;
	});
}
