import styles from "@rvx/ui/theme/components/footer.module.css";
import { ClassValue, Content, Expression, map, Override, StyleValue } from "rvx";
import { SizeContext } from "../common/types";
import { Row, RowAlign, RowJustify } from "./row";

export function Footer(props: {
	class?: ClassValue;
	style?: StyleValue;
	size?: Expression<SizeContext | undefined>;
	align?: Expression<RowAlign | undefined>;
	justify?: Expression<RowJustify | undefined>;
	role?: Expression<string | undefined | false>;
	children?: Content;
}) {
	return <Override role={map(props.role, v => v ?? "contentinfo")}>
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
