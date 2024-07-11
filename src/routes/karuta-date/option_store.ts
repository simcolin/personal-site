import { writable } from "svelte/store";

export const show_coordinates = writable<boolean>(false);

export const multi_thread = writable<boolean>(true);