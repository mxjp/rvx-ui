import { Card, Column, Heading, Link, Tab, Tabs, Text, Value } from "@rvx/ui";
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

		<Heading level="2">Selection</Heading>
		<Text>
			Selected tab: <Show when={selected}>
				{tab => <Value>{tab.label()}</Value>}
			</Show>
		</Text>
		<Tabs selected={selected} tabs={tabs} />

		<Heading level="2">Embedding</Heading>
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
	</>;
}
