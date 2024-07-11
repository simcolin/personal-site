import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getUser } from "$lib/server/cc-auth.server";
import { db } from "$lib/server/db.server";

export const load: PageServerLoad = async ({ cookies }) => {
    const currentUser = await getUser(cookies);
    if (!currentUser) {
        redirect(302, "/cc/login");
    }

    const result = await db.execute("SELECT * FROM cc_script ORDER BY path");
    return {
        scripts: result.rows as any as { id: number, path: string, content: string }[]
    };
}