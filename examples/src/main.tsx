import { DeriveContext, Tasks, mount, sig } from "@mxjp/gluon";
import { Button, Column, Row, THEME, TextInput, trim } from "@mxjp/gluon-ux";

import theme from "@mxjp/gluon-ux/dist/theme.module.css";

mount(
	document.body,
	<DeriveContext>
		{ctx => {
			ctx.set(THEME, theme);
			ctx.set(Tasks, new Tasks());

			const text = sig("Hello World!");

			return <Column>
				<Row size="control">
					<TextInput value={trim(text)} />
					<Button
						action={async () => {
							console.log("Hello World!");
							await new Promise(r => setTimeout(r, 1000));
						}
					}>Click me!</Button>
				</Row>
			</Column>;
		}}
	</DeriveContext>
);
