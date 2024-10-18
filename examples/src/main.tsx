import { extract, mount } from "rvx";
import { Column, Heading, Link, Page, RootLayer, ScrollView, THEME } from "@rvx/ui";
import theme from "@rvx/ui/dist/theme.module.css";
import { Async, Tasks, TASKS } from "rvx/async";
import { ComponentRoute, HashRouter, ROUTER, Routes } from "rvx/router";
import "./styles.scss";

mount(
	document.body,
	<RootLayer>
		{ctx => {
			ctx.set(THEME, theme);
			ctx.set(TASKS, new Tasks());
			ctx.set(ROUTER, new HashRouter());

			const routes: ComponentRoute[] = [];
			const links: unknown[] = [];
			const pages = import.meta.glob("./pages/*.tsx");

			for (const key in pages) {
				const name = key.slice(8, -4);
				const path = `/${name}`;

				links.push(<Link action={() => {
					extract(ROUTER)!.push(path);
				}}>{name}</Link>);

				routes.push({
					match: path,
					content: () => <Async source={pages[key]}>
						{(module: any) => <Page inlineSize="50rem">
							<module.default />
						</Page>}
					</Async>,
				});
			}

			return <div class="app">
				<ScrollView class="app-nav">
					<Page>
						<Column size="control">
							{links}
						</Column>
					</Page>
				</ScrollView>
				<ScrollView>
					<Routes routes={[
						...routes,
						{ content: () => <Page inlineSize="20rem">
							<Heading level="1">404</Heading>
						</Page> }
					]} />
				</ScrollView>
			</div>;
		}}
	</RootLayer>
)
