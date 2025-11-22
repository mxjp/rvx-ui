import { Group, Heading, RadioButtons, Text, Value } from "@rvx/ui";
import { $ } from "rvx";

export default function() {
	const option = $("bar");

	return <>
		<Heading level="1">Radio Buttons</Heading>
		<Group>
			<RadioButtons value={option} options={[
				{ value: "foo", label: "Foo" },
				{ value: "bar", label: "Bar" },
				{ value: "baz", label: "Baz" },
			]} />
			<Text>
				Selected value: <Value>{option}</Value>
			</Text>
		</Group>

		<Heading level="2">Unselected</Heading>
		<Group>
			<RadioButtons value={$(undefined)} options={[
				{ value: "foo", label: "Foo" },
				{ value: "bar", label: "Bar" },
			]} />
		</Group>

		<Heading level="2">Readonly</Heading>
		<Group>
			<RadioButtons value="foo" options={[
				{ value: "foo", label: "Readonly" },
			]} />
		</Group>

		<Heading level="2">Disabled</Heading>
		<Group>
			<RadioButtons value={$("foo")} disabled options={[
				{ value: "foo", label: "Disabled" },
			]} />
		</Group>
	</>;
}
