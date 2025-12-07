import { ClassValue, Expression, For, Inject, Show, StyleValue, SVG, XMLNS } from "rvx";
import { Action } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { Link } from "./link";

export interface Breadcrumb {
	label: unknown;
	action?: Action;
}

export function Breadcrumbs(props: {
	items: Expression<Breadcrumb[]>;
	class?: ClassValue;
	style?: StyleValue;
}) {
	const theme = THEME.current;
	return <div
		class={[
			theme?.breadcrumbs,
			props.class,
		]}
		style={props.style}
	>
		<For each={props.items}>
			{(item, index) => {
				return <div class={theme?.breadcrumb_item}>
					<Show when={() => index() !== 0}>
						{() => <span class={theme?.breadcrumb_separator}>
							<Inject context={XMLNS} value={SVG}>
								{() => <svg viewBox="0 0 8 16" preserveAspectRatio="none">
									<path d="M2,14 L6,2" stroke-width="1.75" stroke-linecap="round" />
								</svg>}
							</Inject>
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
