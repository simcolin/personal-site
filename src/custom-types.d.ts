declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		"on:clickoutside"?: (event: MouseEvent) => boolean | void,
	}
}