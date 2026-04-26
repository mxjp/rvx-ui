import styles from "@rvx/ui/theme/components/breadcrumbs.module.css";
import { ClassValue, Expression, For, Provide, Show, StyleValue, SVG, XMLNS } from "rvx";
import { Action } from "../common/events.js";
import { Link } from "./link.js";

export interface Breadcrumb {
	label: unknown;
	action?: Action;
}

export function Breadcrumbs(props: {
	items: Expression<Breadcrumb[]>;
	class?: ClassValue;
	style?: StyleValue;
}) {
	return <div
		class={[
			styles.breadcrumbs,
			props.class,
		]}
		style={props.style}
	>
		<For each={props.items}>
			{(item, index) => {
				return <div class={styles.item}>
					<Show when={() => index() !== 0}>
						{() => <span class={styles.separator}>
							<Provide context={XMLNS} value={SVG}>
								{() => <svg viewBox="0 0 8 16" preserveAspectRatio="none">
									<path d="M2,14 L6,2" stroke-width="1.75" stroke-linecap="round" />
								</svg>}
							</Provide>
						</span>}
					</Show>
					{item.action
						? <Link action={item.action}>
							{item.label}
						</Link>
						: <span>
							{item.label}
						</span>
					}
				</div>;
			}}
		</For>
	</div>;
}
