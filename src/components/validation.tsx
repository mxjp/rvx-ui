
/**
 * Represents the validity state of a specific user input.
 */
export interface Validity {
	/**
	 * Reactively get if the input is invalid.
	 */
	get invalid(): boolean;

	/**
	 * Reactively get a space separated list of error message element ids.
	 */
	get errorMessageIds(): string | undefined;
}
