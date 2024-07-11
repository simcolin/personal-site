import jwt from "@tsndr/cloudflare-worker-jwt";
import type { Cookies } from "@sveltejs/kit";
import { CC_JWT_SECRET, CC_PASSWORD } from "$env/static/private";

export const jwtDuration = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function getUser(cookies: Cookies) {
    try {
        const token = cookies.get("cc:jwt-token");
        if (token) {
            if (await jwt.verify(token, CC_JWT_SECRET)) {
                const data = jwt.decode(token as string);
                return data.payload as { chroot: string, iat: number };
            }
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}

export async function login(password: string) {
    try {
        if (password === CC_PASSWORD) {
            return await jwt.sign({ chroot: "chroot" }, CC_JWT_SECRET);
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}