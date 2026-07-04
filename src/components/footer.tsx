import styles from "@rvx/ui/theme/components/footer.module.css";
import { ClassValue, Content, Expression, map, Override, StyleValue } from "rvx";
import { SizeContext } from "../common/types";
import { Row, RowAlign, RowJustify } from "./row";

export function Footer(props: {
	class?: ClassValue;
	style?: StyleValue;
	size?: Expression<SizeContext>;
	align?: Expression<RowAlign>;
	justify?: Expression<RowJustify>;
	children?: Content;
}) {
	return <Override role="contentinfo">
		<Row
			class={[props.class, styles.footer]}
			style={props.style}
			size={map(props.size, v => v ?? "group")}
			align={map(props.align, v => v ?? "center")}
			justify={map(props.justify, v => v ?? "center")}
		>
			{props.children}
		</Row>
	</Override>;
}
