import * as esbuild from "esbuild";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const args = parseArgs({
	allowNegative: true,
	options: {
		watch: {
			type: "boolean",
			short: "w",
			default: false,
		},
	},
});

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
await mkdir(dist, { recursive: true });

/** @type {esbuild.BuildOptions} */
const options = {
	absWorkingDir: root,
	entryPoints: {
		"index": "src/index.tsx"
	},
	sourcemap: true,
	bundle: true,
	outdir: dist,
	logLevel: "info",
	format: "esm",
	tsconfig: "tsconfig-bundle.json",
	external: ["rvx"],
	legalComments: "external",
};

if (args.values.watch) {
	const ctx = await esbuild.context(options);
	await ctx.watch();
} else {
	await esbuild.build(options);
}
