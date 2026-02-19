import { Button, Card, Checkbox, Column, Group, Heading, intParser, Label, RadioButtons, Row, rule, TextInput, validate, VALIDATION, ValidationMessages, ValidationTrigger, Validator } from "@rvx/ui";
import { $, Inject, Nest } from "rvx";
import { trim } from "rvx/convert";

function BaseExample() {
	const name = $("");
	const port = $(443);

	async function ok() {
		await validate([name, port]);
	}

	return <>
		<Label>Username</Label>
		<TextInput
			value={name
				.pipe(rule, name => /^[a-z0-9]*$/i.test(name), () => <>The name must contain only letters and numbers.</>)
				.pipe(rule, name => name.length > 0, () => <>Enter a name.</>)
				.pipe(trim)
			}
		/>
		<ValidationMessages for={name} />

		<Label>Network Port</Label>
		<TextInput
			value={port
				.pipe(intParser, {
					format: () => <>Enter a valid port.</>,
					range: () => <>The port must range from 1 to {0xFFFF}.</>,
					min: 1,
					max: 0xFFFF,
				})
				.pipe(trim)
			}
		/>
		<ValidationMessages for={port} />

		<Row>
			<Button variant="primary" action={ok}>Validate</Button>
		</Row>
	</>;
}

function CustomRulesExample() {
	const foo = $(false);
	const bar = $(false);
	const baz = $(false);

	const validator = new Validator();

	function MissingSelectionMessage() {
		return <>Select at least one option.</>;
	}

	validator.appendRule(() => {
		if (!foo.value && !bar.value && !baz.value) {
			return [MissingSelectionMessage];
		}
	});

	return <>
		<Group>
			<Label>Options</Label>
			<Column size="control">
				<Checkbox checked={foo}>Foo</Checkbox>
				<Checkbox checked={bar}>Bar</Checkbox>
				<Checkbox checked={baz}>Baz</Checkbox>
			</Column>

			<ValidationMessages for={validator} />
		</Group>

		<Row>
			<Button variant="primary" action={async () => {
				await validate([validator]);
				// Or:
				// await validator.validate();
			}}>Validate</Button>
		</Row>
	</>;
}

export default function () {
	const trigger = $<ValidationTrigger | undefined>(undefined);

	return <>
		<Heading level="1">Validation</Heading>
		<Card>
			<Label>Trigger</Label>
			<RadioButtons value={trigger} options={[
				{ value: "if-validated", label: "if-validated" },
				{ value: undefined, label: "if-invalid (default)" },
				{ value: "never", label: "never" },
			]} />
		</Card>

		<Nest watch={() => [trigger.value]}>
			{([trigger]) => <Inject context={VALIDATION} value={{ trigger }}>
				{() => <>
					<Heading level="2">Basic Rules</Heading>
					<BaseExample />

					<Heading level="2">Custom & Composite Rules</Heading>
					<CustomRulesExample />
				</>}
			</Inject>}
		</Nest>
	</>;
}
