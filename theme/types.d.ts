
declare module "@rvx/ui/theme/global.css" {}

declare module "@rvx/ui/theme/components/*.module.css" {
	const map: Record<string, string>;
	export default map;
}
