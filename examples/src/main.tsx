import { DeriveContext, Tasks, mount, sig } from "@mxjp/gluon";
import { Button, Column, Row, THEME, Text, TextInput, Value, trim } from "@mxjp/gluon-ux";

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
				<Text>
					You typed: <Value>{() => JSON.stringify(text.value)}</Value>
				</Text>

				<Text>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit. Aenean sagittis turpis nec pharetra vehicula. Integer quis semper purus, a commodo justo. Proin at quam sit amet lectus vulputate sodales sed a metus. Suspendisse eleifend sit amet urna non consequat. Aenean non lectus viverra, laoreet tortor sit amet, eleifend enim. Fusce at consequat augue, vitae porttitor nisi. Nullam tincidunt vel quam nec rutrum. Pellentesque nec tincidunt quam. Aliquam volutpat elit sem, quis porttitor risus cursus a. Sed a nunc risus. Nam porta tincidunt libero, quis pretium turpis.
				</Text>
			</Column>;
		}}
	</DeriveContext>
);
