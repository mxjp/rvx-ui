import { DeriveContext, Tasks, mount } from "@mxjp/gluon";
import { Button, THEME } from "@mxjp/gluon-ux";

import theme from "./theme.module.css";

mount(
	document.body,
	<DeriveContext>
		{ctx => {
			ctx.set(THEME, theme);
			ctx.set(Tasks, new Tasks());

			return <>
				<Button
					action={async () => {
						console.log("Hello World!");
						await new Promise(r => setTimeout(r, 1000));
					}
				}>Click me!</Button>
			</>;
		}}
	</DeriveContext>
);
