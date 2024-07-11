import { error, json, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db.server";
import { getUser } from "$lib/server/cc-auth.server";

export const GET: RequestHandler = async ({ params }) => {
    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const result = await db.execute({
        sql: "SELECT content FROM cc_script WHERE id = ?",
        args: [params.id]
    });
    return text(result.rows[0].content as string);
}

export const POST: RequestHandler = async ({ params, request, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const data: { path: string, content: string } = await request.json();
    const result = await db.execute({
        sql: "UPDATE cc_script SET path = :path, content = :content WHERE id = :id",
        args: { id, path: data.path, content: data.content },
    });
    return json({ success: result.rowsAffected === 1 });
}

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const id = Number(params.id);
    if (isNaN(id)) error(400);
    const result = await db.execute({
        sql: "DELETE FROM cc_script WHERE id = ?",
        args: [id],
    });
    return json({ success: result.rowsAffected === 1 });
}