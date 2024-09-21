import { mount } from "@mxjp/gluon";
import { RootLayer, THEME } from "@mxjp/gluon-ux";
import theme from "@mxjp/gluon-ux/dist/theme.module.css";
import { Async, Tasks, TASKS } from "@mxjp/gluon/async";
import { ComponentRoute, HashRouter, ROUTER, Routes } from "@mxjp/gluon/router";
import "./styles.scss";

const routes: ComponentRoute[] = [];
const pages = import.meta.glob("./pages/*.tsx");

for (const key in pages) {
	const name = key.slice(8, -4);
	routes.push({
		match: `/${name}`,
		content: () => <Async source={pages[key]}>
			{(module: any) => <module.default />}
		</Async>,
	});
}

mount(
	document.body,
	<RootLayer>
		{ctx => {
			ctx.set(THEME, theme);
			ctx.set(TASKS, new Tasks());
			ctx.set(ROUTER, new HashRouter());

			return <Routes routes={[
				...routes,
				{ content: () => <h1>404</h1> }
			]} />;
		}}
	</RootLayer>
)
