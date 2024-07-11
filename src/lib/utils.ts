import { browser } from "$app/environment";
import { writable } from "svelte/store";

export function formatString(value: number, KBonly: boolean = true) {
    if (KBonly) {
        return (value / 1024).toFixed(2) + " KB/s";
    } else {
        if (value <= 1000) return value.toFixed(2) + " B/s";
        else value /= 1024;
        if (value <= 1000) return value.toFixed(2) + " KB/s";
        else value /= 1024;
        return value.toFixed(2) + " MB/s";
    }
}

function getProgressRange(type: "download" | "upload") {
    if (type === "download") {
        return [
            { value: 400_000, progress: 100 },
            { value: 200_000, progress: 50 },
            { value: 0, progress: 0 },
        ];
    } else {
        return [
            { value: 40_000, progress: 100 },
            { value: 20_000, progress: 50 },
            { value: 0, progress: 0 },
        ];
    }
}

function mapFloat(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export function getProgressByValue(value: number, type: "download" | "upload", gradient: boolean) {
    const colors = getProgressRange(type);
    for (let i = 0; i < colors.length; ++i) {
        const colorValue = colors[i];
        if (value > colorValue.value) {
            if (gradient) {
                if (i <= 0) return colorValue.progress;
                const prevColor = colors[i - 1];
                const mappedValue = mapFloat(value, colorValue.value, prevColor.value, colorValue.progress, prevColor.progress);
                return Math.max(Math.min(mappedValue, 100), 0);
            } else {
                return colorValue.progress;
            }
        }
    }
    return 0;
}

export function eventStatusToString(status: number) {
    if (status === 1) return "Connecté";
    if (status === 0) return "En connexion";
    return "Déconnecté";
}

export function timestampToRelative(time: number): string {
    if (time < 0) return "";

    const now = new Date().getTime();
    const timeDiff = now - time;
    if (timeDiff < 1_000) {
        return "Il y a un instant";
    } else if (timeDiff < 60_000) {
        return `Il y a ${Math.floor(timeDiff / 1000)} secondes`;
    }
    return "Il y a plus d'une minutes"
}

export function createLocalStore<T>(name: string, defaultValue: T) {
    let startValue = defaultValue;
    if (browser) {
        let storedValue = localStorage.getItem(name);
        if (storedValue !== null) {
            try {
                const parsedValue = JSON.parse(storedValue);
                startValue = parsedValue;
            } catch (e) { console.warn(e) }
        }
    }
    const store = writable<T>(startValue);
    store.subscribe(value => {
        if (!browser) return;
        try {
            localStorage.setItem(name, JSON.stringify(value));
        } catch (e) { console.warn(e) }
    });
    return store;
}