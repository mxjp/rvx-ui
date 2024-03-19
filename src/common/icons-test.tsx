import { Expression } from "@mxjp/gluon";

import { IconType } from "./icons.js";

export function TestIcon(props: {
	icon: Expression<IconType>;
}): unknown {
	return <>icon:{props.icon}</>;
}
