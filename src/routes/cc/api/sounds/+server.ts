import type { RequestHandler } from "./$types";
import sounds from "./sounds.json?raw";

export const GET: RequestHandler = () => {
    return new Response(sounds, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}