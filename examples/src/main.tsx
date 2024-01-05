import { DeriveContext, Tasks, mount } from "@mxjp/gluon";
import { Button, Row, THEME } from "@mxjp/gluon-ux";

import theme from "@mxjp/gluon-ux/dist/theme.module.css";

mount(
	document.body,
	<DeriveContext>
		{ctx => {
			ctx.set(THEME, theme);
			ctx.set(Tasks, new Tasks());

			return <Row>
				<Button
					action={async () => {
						console.log("Hello World!");
						await new Promise(r => setTimeout(r, 1000));
					}
				}>Click me!</Button>
				<Button variant="primary">Primary</Button>
				<Button variant="success">Success</Button>
				<Button variant="warning">Warning</Button>
				<Button variant="danger">Danger</Button>
			</Row>;
		}}
	</DeriveContext>
);
