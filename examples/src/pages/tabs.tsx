import { Card, Column, Group, Heading, Link, Separated, Tab, TabList, TabPanel, Tabs, Text, Value } from "@rvx/ui";
import { $, Show } from "rvx";

export default function () {
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

		<Heading level="2">Projection</Heading>
		<Card raw>
			<Tabs tabs={[
				{
					label: () => <>Foo</>,
					content: () => <>Content A</>,
				},
				{
					label: () => <>Bar</>,
					content: () => <>Content B</>,
				},
			]} panel={props => <Column padded><TabPanel {...props} /></Column>} />
		</Card>

		<div style={{ "border": "2px dashed gray", "padding": ".5rem" }}>
			<code>{"<Tabs>"}</code>
			<Tabs
				tabs={[
					{
						label: () => <>Foo</>,
						content: () => <>Content A</>,
					},
					{
						label: () => <>Bar</>,
						content: () => <>Content B</>,
					},
				]}
				list={props => <div style={{ "border": "2px dashed red", "padding": ".5rem" }}>
					<code>{"<TabList>"}</code>
					<TabList {...props} />
				</div>}
				panel={props => <div style={{ "border": "2px dashed orange", "padding": ".5rem" }}>
					<code>{"<TabPanel>"}</code>
					<TabPanel {...props} />
				</div>}
				content={content => <div style={{ "border": "2px dashed green", "padding": ".5rem" }}>
					<code>{"content:"}</code>
					{content()}
				</div>}
			/>
		</div>
	</>;
}
