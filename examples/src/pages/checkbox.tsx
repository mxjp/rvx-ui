import { Button, Checkbox, Column, Group, Heading, Row, Text, Value } from "@rvx/ui";
import { $ } from "rvx";

export default function () {
	const checked = $<boolean | undefined>(undefined);

	return <>
		<Heading level="1">Checkboxes</Heading>
		<Group>
			<Column size="control">
				<Checkbox checked={checked}>Editable checkbox</Checkbox>
			</Column>
			<Text>
				Checkbox state: <Value>{() => checked.value === undefined ? "Mixed" : (checked.value ? "Checked" : "Unchecked")}</Value>
			</Text>
			<Row>
				<Button action={() => { checked.value = undefined; }} disabled={() => checked.value === undefined}>Reset to mixed</Button>
			</Row>
		</Group>

		<Heading level="2">States</Heading>
		<Group>
			<Column size="control">
				<Checkbox checked={$(true)} disabled>Disabled</Checkbox>
				<Checkbox checked={true}>Readonly</Checkbox>
			</Column>
		</Group>
	</>;
}
