import { DeriveContext, Emitter, TASKS, Tasks, UseUniqueId, extract, mount, sig, waitFor } from "@mxjp/gluon";
import { Button, Collapse, Column, DialogBody, DialogFooter, Heading, LAYER, Label, RootLayer, Row, THEME, Text, TextInput, ValidationMessages, Value, asInt, parse, rule, showDialog, trim, validate, withPair } from "@mxjp/gluon-ux";

import theme from "@mxjp/gluon-ux/dist/theme.module.css";

mount(
	document.body,
	<RootLayer>
		{() => <DeriveContext>
			{ctx => {
				ctx.set(THEME, theme);
				ctx.set(TASKS, new Tasks());

				const text = sig("Hello World!");
				const collapse = sig(false);
				const collapseAlert = new Emitter<[]>();

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
						<Button action={showValidationExample}>Validation Example</Button>
					</Row>

					<Heading level="2">Collapses</Heading>
					<Row size="control">
						<Button action={() => { collapse.value = !collapse.value }}>Toggle</Button>
						<Button action={() => collapseAlert.emit()} variant="warning">Alert</Button>
					</Row>
					<Collapse visible={collapse}>
						<Text>Hello World!</Text>
					</Collapse>
					<Collapse visible alert={collapseAlert.event}>
						<Text>This is always visible.</Text>
					</Collapse>

					<Heading level="2">Text Blocks</Heading>
					<Text>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit. Aenean sagittis turpis nec pharetra vehicula. Integer quis semper purus, a commodo justo. Proin at quam sit amet lectus vulputate sodales sed a metus. Suspendisse eleifend sit amet urna non consequat. Aenean non lectus viverra, laoreet tortor sit amet, eleifend enim. Fusce at consequat augue, vitae porttitor nisi. Nullam tincidunt vel quam nec rutrum. Pellentesque nec tincidunt quam. Aliquam volutpat elit sem, quis porttitor risus cursus a. Sed a nunc risus. Nam porta tincidunt libero, quis pretium turpis.
					</Text>
				</Column>;
			}}
		</DeriveContext>}
	</RootLayer>
);

function showExampleDialog() {
	showDialog<number>(dialog => {
		extract(LAYER)?.useHotkey("enter", () => {
			dialog.resolve(77);
		});
		return <DialogBody title="Example Dialog" description="This is an accessible example dialog.">
			<Row>
				<Button autofocus action={() => {
					showDialog<void>(dialog => {
						return <DialogBody title="Nested dialog" description="This is a dialog in a dialog.">
							<DialogFooter>
								<Button action={() => dialog.resolve()}>Close</Button>
							</DialogFooter>
						</DialogBody>;
					});
				}}>
					Open Nested Dialog
				</Button>
			</Row>
			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={() => dialog.resolve(42)} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	}).then(value => {
		console.log("Dialog result:", value);
	}, () => {
		console.log("Dialog was cancelled.");
	});
}

function showValidationExample() {
	showDialog(dialog => {
		const name = sig("");
		const port = sig<number | null>(null);

		async function ok() {
			if (await validate(name, port)) {
				console.log("Ok:", name.value, port.value);
				dialog.resolve();
			}
		}

		extract(LAYER)?.useHotkey("enter", ok);

		return <DialogBody title="Validation" description="This dialog demonstrates the validation API.">
			<UseUniqueId>
				{id => <>
					<Label for={id}>Name</Label>
					<TextInput
						id={id}
						value={name
							.pipe(rule, name => /^[a-z0-9]*$/.test(name), <>The name must contain only characters and digits.</>)
							.pipe(rule, name => name.length >= 3, <>Enter a name of at least 3 characters.</>)
							.pipe(trim)
						}
					/>
				</>}
			</UseUniqueId>
			<ValidationMessages for={name} />

			<UseUniqueId>
				{id => <>
					<Label for={id}>Network Port</Label>
					<TextInput
						id={id}
						value={port
							.pipe(rule, port => port !== null && port >= 1 && port <= 0xFFFF, <>The port must be between 1 and {0xFFFF}.</>)
							.pipe(parse, withPair(asInt(), null, ""), <>Enter a valid port.</>)
							.pipe(trim)
						}
					/>
				</>}
			</UseUniqueId>
			<ValidationMessages for={port} />

			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={ok} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	});
}
