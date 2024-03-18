import { Expression, Nest, get } from "@mxjp/gluon";
import { IconType } from "../../dist/index.js";
import { IconDefinition, config, icon } from "@fortawesome/fontawesome-svg-core";
import styles from "./fontawesome.module.css";
import { faSquare, faSquareCheck, faSquareMinus } from "@fortawesome/free-solid-svg-icons";

config.autoA11y = false;
config.autoAddCss = false;

const icons: Record<IconType, IconDefinition> = {
	checkbox_checked: faSquareCheck,
	checkbox_unchecked: faSquare,
	checkbox_mixed: faSquareMinus,
};

export function Icon(props: {
	icon: Expression<IconType>;
}): unknown {
	return <Nest>
		{() => {
			const def = icons[get(props.icon)];
			return () => {
				const instance = icon(def, { classes: styles.icon });
				return [...instance.node];
			};
		}}
	</Nest>;
}
