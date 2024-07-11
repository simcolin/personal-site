import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "../$types";
import { db } from "$lib/server/db.server";
import { getUser } from "$lib/server/cc-auth.server";

export const GET: RequestHandler = async () => {
    // const resultDrop = await db.execute(`DROP TABLE IF EXISTS cc_audio`);
    // console.log(resultDrop);
    // const resultCreate = await db.execute(`CREATE TABLE IF NOT EXISTS cc_audio (id INTEGER PRIMARY KEY, name TEXT NOT NULL, data BLOB NOT NULL)`);
    // console.log(resultCreate);
    const result = await db.execute("SELECT id, name FROM cc_audio ORDER BY name");
    return json(result.rows);
}

export const PUT: RequestHandler = async ({ request, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const data: { name: string, data: Uint8Array } = await request.json();
    data.data = new Uint8Array(data.data);
    const result = await db.execute({
        sql: "INSERT INTO cc_audio(name, data) VALUES(:name, :data)",
        args: { name: data.name, data: data.data },
    });
    return json({ success: result.rowsAffected === 1 });
}