import { Button, Heading, Link, PopoutAlignment, PopoutPlacement, Popover, Row, Text } from "@rvx/ui";
import { $ } from "rvx";
import { PopoutControls } from "../common.js";

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
					<Text>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit...
					</Text>
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
						<Text>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit...
						</Text>
					</>}
				</Popover> with line breaks.
			</Text>
		</Row>
	</>;
}
