import { DeriveContext, Tasks, mount, sig } from "@mxjp/gluon";
import { Button, Column, DialogBody, FlexSpace, Heading, Layer, Row, THEME, Text, TextInput, Value, layerHotkey, showDialog, trim } from "@mxjp/gluon-ux";

import theme from "@mxjp/gluon-ux/dist/theme.module.css";

mount(
	document.body,
	<Layer root>
		{() => <DeriveContext>
			{ctx => {
				ctx.set(THEME, theme);
				ctx.set(Tasks, new Tasks());

				const text = sig("Hello World!");

				return <Column>
					<Heading level="1">Gluon UX</Heading>

					<Heading level="2">Basic Controls</Heading>
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

					<Heading level="2">Dialogs</Heading>
					<Row>
						<Button action={showExampleDialog}>Show Dialog</Button>
					</Row>

					<Heading level="2">Text Blocks</Heading>
					<Text>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit. Aenean sagittis turpis nec pharetra vehicula. Integer quis semper purus, a commodo justo. Proin at quam sit amet lectus vulputate sodales sed a metus. Suspendisse eleifend sit amet urna non consequat. Aenean non lectus viverra, laoreet tortor sit amet, eleifend enim. Fusce at consequat augue, vitae porttitor nisi. Nullam tincidunt vel quam nec rutrum. Pellentesque nec tincidunt quam. Aliquam volutpat elit sem, quis porttitor risus cursus a. Sed a nunc risus. Nam porta tincidunt libero, quis pretium turpis.
					</Text>
				</Column>;
			}}
		</DeriveContext>}
	</Layer>
);

function showExampleDialog() {
	showDialog<number>(dialog => {
		layerHotkey("enter", () => {
			dialog.resolve(77);
		});
		return <DialogBody>
			<Heading level="1">Example Dialog</Heading>
			<Text>Hello World!</Text>
			<Row size="control">
				<FlexSpace />
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={() => dialog.resolve(42)} variant="primary">Ok</Button>
			</Row>
		</DialogBody>;
	}).then(value => {
		console.log("Dialog result:", value);
	}, () => {
		console.log("Dialog was cancelled.");
	});
}
