import { Button, Heading, Link, PopoutAlignment, PopoutPlacement, Popover, Row, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum, PopoutControls } from "../common.js";

export default function() {
	const placement = $<PopoutPlacement | undefined>(undefined);
	const alignment = $<PopoutAlignment | undefined>(undefined);

	return <>
		<Heading level="1">Popovers</Heading>
		<PopoutControls placement={placement} defaultPlacement="block end" alignment={alignment} defaultAlignment="start" />

		<Row>
			<Popover
				anchor={props => <Button {...props}>Toggle popover</Button>}
				placement={placement}
				alignment={alignment}
				maxInlineSize="32rem"
			>
				{() => <>
					<Heading level="2">Hello World!</Heading>
					<LoremIpsum />
					<Row>
						<Popover
							anchor={props => <Button {...props} autofocus>Toggle nested popover</Button>}
							placement={placement}
							alignment={alignment}
							maxInlineSize="32rem"
						>
							{({ popout }) => <>
								<Text>
									Hello World!
								</Text>
								<Row>
									<Button variant="success" action={() => popout.hide()}>Close</Button>
								</Row>
							</>}
						</Popover>
					</Row>
				</>}
			</Popover>
			<Text>
				This is a <Popover
					anchor={props => <Link {...props}>popover<br/>anchor</Link>}
					placement={placement}
					alignment={alignment}
					maxInlineSize="32rem"
				>
					{() => <>
						<Heading level="2">Hello World!</Heading>
						<LoremIpsum />
					</>}
				</Popover> with line breaks.
			</Text>
		</Row>
	</>;
}
