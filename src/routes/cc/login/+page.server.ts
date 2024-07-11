import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getUser, jwtDuration, login } from "$lib/server/cc-auth.server";

export const prerender = false;

export const load: PageServerLoad = async ({ cookies }) => {
    const currentUser = await getUser(cookies);
    if (currentUser) {
        redirect(302, "/cc");
    }
    cookies.delete("cc:jwt-token", { secure: true, httpOnly: true, path: "/", maxAge: jwtDuration });
}

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const data = await request.formData();
        const password = data.get("password");

        const token = await login(password as string);
        if (!token) {
            return fail(400, { incorrect: true });
        }

        cookies.set("cc:jwt-token", token, { secure: true, httpOnly: true, path: "/", maxAge: jwtDuration });
        return { success: true };
    },
    logout: async ({ cookies }) => {
        cookies.delete("cc:jwt-token", { secure: true, httpOnly: true, path: "/", maxAge: jwtDuration });
        return { success: true };
    },
}