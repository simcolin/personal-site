// See https://kit.svelte.dev/docs/types#app

import type { EventHandler } from "svelte/elements";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	type SvelteEvent<E extends Event = Event, T extends EventTarget = Element> = Parameters<EventHandler<E, T>>[0];
}

export {};