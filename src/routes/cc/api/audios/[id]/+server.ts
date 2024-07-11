import { error, json, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db.server";
import { getUser } from "$lib/server/cc-auth.server";

export const GET: RequestHandler = async ({ params }) => {
    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const result = await db.execute({
        sql: "SELECT data FROM cc_audio WHERE id = ?",
        args: [params.id]
    });
    return new Response(result.rows[0].data as ArrayBuffer, {
        headers: { "Content-Type": "audio/dfpwm", },
    });
}

export const POST: RequestHandler = async ({ params, request, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const data: { name: string, data: Uint8Array } = await request.json();
    if (data.data) {
        data.data = new Uint8Array(data.data);
        const result = await db.execute({
            sql: "UPDATE cc_audio SET name = :name, data = :data WHERE id = :id",
            args: { id, name: data.name, data: data.data },
        });
        return json({ success: result.rowsAffected === 1 });
    } else {
        const result = await db.execute({
            sql: "UPDATE cc_audio SET name = :name WHERE id = :id",
            args: { id, name: data.name },
        });
        return json({ success: result.rowsAffected === 1 });
    }
}

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const result = await db.execute({
        sql: "DELETE FROM cc_audio WHERE id = ?",
        args: [id],
    });
    return json({ success: result.rowsAffected === 1 });
}