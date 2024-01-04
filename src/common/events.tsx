
/**
 * Get an identifier for the pressed key including any modifiers.
 *
 * The identifier is constructed by concatenating the modifies and lower cased key. In additional, the space key is represented as `space` for better readability.
 *
 * Modifiers in order:
 * + `ctrl+`
 * + `shift+`
 * + `alt+`
 * + `meta+`
 *
 * Examples:
 * + `shift+a`
 * + `ctrl+shift+space`
 *
 * @returns The identifier.
 */
export function keyFor(event: KeyboardEvent): string {
	let key = event.key.toLowerCase();
	if (key === " ") {
		key = "space";
	}
	if (event.metaKey) {
		key = "meta+" + key;
	}
	if (event.altKey) {
		key = "alt+" + key;
	}
	if (event.shiftKey) {
		key = "shift+" + key;
	}
	if (event.ctrlKey) {
		key = "ctrl+" + key;
	}
	return key;
}
