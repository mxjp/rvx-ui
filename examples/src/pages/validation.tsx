import { Button, Card, Checkbox, Column, DEFAULT_ERROR_CASES, errorCase, ErrorMessages, Group, Heading, intParser, Label, RadioButtons, Row, rule, TextInput, validate, validateSideEffect, VALIDATION, validationMessage, ValidationMessages, ValidationTrigger, Validator } from "@rvx/ui";
import { $, Expression, Nest, Provide, watch } from "rvx";
import { useMicrotask } from "rvx/async";
import { trim } from "rvx/convert";

function BaseExample(props: { microtask: Expression<boolean> }) {
	const name = $("");
	const port = $(443);

	async function ok() {
		await validate([name, port]);
	}

	watch(props.microtask, microtask => {
		if (microtask) {
			useMicrotask(() => validateSideEffect([name, port]));
		}
	});

	return <>
		<Group>
			<Label>Username</Label>
			<TextInput
				value={name
					.pipe(rule, name => /^[a-z0-9]*$/i.test(name), () => <>The name must contain only letters and numbers.</>)
					.pipe(rule, name => name.length > 0, () => <>Enter a name.</>)
					.pipe(trim)
				}
			/>
			<ValidationMessages for={name} />
		</Group>

		<Group>
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
		</Group>

		<Row>
			<Button variant="primary" action={ok}>Validate</Button>
		</Row>
	</>;
}

function CustomRulesExample(props: { microtask: Expression<boolean> }) {
	const foo = $(false);
	const bar = $(false);
	const baz = $(false);

	const validator = new Validator();

	function MissingSelectionMessage() {
		return <>Select at least one option.</>;
	}

	validator.appendRule(() => {
		if (!foo.value && !bar.value && !baz.value) {
			return [validationMessage(MissingSelectionMessage)];
		}
	});

	watch(props.microtask, microtask => {
		if (microtask) {
			useMicrotask(() => validator.sideEffect());
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

function ErrorExample() {
	const error = $<unknown>(undefined);

	class ExampleError extends Error {
		status: number;

		constructor(status: number) {
			super();
			this.status = status;
		}
	}

	return <Provide context={DEFAULT_ERROR_CASES} value={[
		errorCase(e => e !== undefined, () => "An unknown error occurred.", () => true),
	]}>
		{() => <>
			<Heading level="2">Error Messages</Heading>
			<Group>
				<Row>
					<Button action={() => { error.value = undefined }}>Clear</Button>
					<Button action={() => { error.value = new TypeError() }}>Fallback</Button>
					<Button action={() => { error.value = new ExampleError(0) }}>Example 0</Button>
					<Button action={() => { error.value = new ExampleError(1) }}>Example 1</Button>
					<Button action={() => { error.value = new ExampleError(2) }}>Example 2</Button>
				</Row>
				<ErrorMessages error={error} cases={[
					errorCase<ExampleError>(e => e instanceof ExampleError && e.status === 0, () => "Example error.", (a, b) => a.status === b.status),
					errorCase(e => e instanceof ExampleError, e => <>Example error {e.status}</>, (a, b) => a.status === b.status),
				]} />
			</Group>
		</>}
	</Provide>;
}

export default function () {
	const trigger = $<ValidationTrigger | undefined>(undefined);
	const microtask = $(false);

	return <>
		<Heading level="1">Validation</Heading>
		<Card>
			<Row size="content">
				<Group>
					<Label>Trigger</Label>
					<RadioButtons value={trigger} options={[
						{ value: "if-validated", label: "if-validated" },
						{ value: undefined, label: "if-invalid (default)" },
						{ value: "never", label: "never" },
					]} />
				</Group>
				<Group>
					<Label>Custom Behavior</Label>
					<Checkbox checked={microtask}>Queue side effect</Checkbox>
				</Group>
			</Row>
		</Card>

		<Nest watch={trigger}>
			{trigger => <Provide context={VALIDATION} value={{ trigger }}>
				{() => <>
					<Heading level="2">Basic Rules</Heading>
					<BaseExample microtask={microtask} />

					<Heading level="2">Custom & Composite Rules</Heading>
					<CustomRulesExample microtask={microtask} />
				</>}
			</Provide>}
		</Nest>

		<ErrorExample />
	</>;
}
