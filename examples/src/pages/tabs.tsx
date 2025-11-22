import { Card, Column, Group, Heading, Link, Tab, Tabs, Text, Value } from "@rvx/ui";
import { $, Show } from "rvx";

export default function() {
	const selected = $<Tab | undefined>(undefined);
	const tabs: Tab[] = [
		{
			label: () => <>Foo</>,
			content: () => <Column size="control">
				<Heading level="3">Content A</Heading>
				<Link action={() => {
					selected.value = tabs[1];
				}}>Go to <Value>Bar</Value></Link>
			</Column>,
		},
		{
			label: () => <>Bar</>,
			content: () => <Column size="control">
				<Heading level="3">Content B</Heading>
				<Link action={() => {
					selected.value = tabs[0];
				}}>Go to <Value>Foo</Value></Link>
			</Column>,
		},
	];

	return <>
		<Heading level="1">Tabs</Heading>
		<Group>
			<Tabs tabs={[
				{
					label: () => <>Foo</>,
					content: () => <>Content A</>,
				},
				{
					label: () => <>Bar</>,
					content: () => <>Content B</>,
				},
			]} />
		</Group>

		<Heading level="2">Selection</Heading>
		<Group>
			<Text>
				Selected tab: <Show when={selected}>
					{tab => <Value>{tab.label()}</Value>}
				</Show>
			</Text>
		</Group>
		<Group>
			<Tabs selected={selected} tabs={tabs} />
		</Group>

		<Heading level="2">Embedding</Heading>
		<Group>
			<Card raw>
				<Tabs padded tabs={[
					{
						label: () => <>Foo</>,
						content: () => <>Content A</>,
					},
					{
						label: () => <>Bar</>,
						content: () => <>Content B</>,
					},
				]} />
			</Card>
		</Group>
	</>;
}
