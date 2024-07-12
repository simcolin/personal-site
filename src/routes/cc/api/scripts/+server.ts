import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db.server";
import { getUser } from "$lib/server/cc-auth.server";

export const GET: RequestHandler = async () => {
    // const resultDrop = await db.execute(`DROP TABLE IF EXISTS cc_script`);
    // console.log(resultDrop);
    // const resultCreate = await db.execute(`CREATE TABLE IF NOT EXISTS cc_script (id INTEGER PRIMARY KEY, path TEXT NOT NULL, content TEXT NOT NULL)`);
    // console.log(resultCreate);
    const result = await db.execute("SELECT * FROM cc_script ORDER BY path");
    return json(result.rows);
}

export const PUT: RequestHandler = async ({ request, cookies }) => {
    if (!await getUser(cookies)) error(401);

    const data: { path: string, content: string } = await request.json();
    const result = await db.execute({
        sql: "INSERT INTO cc_script(path, content) VALUES(:path, :content)",
        args: { path: data.path, content: data.content },
    });
    return json({ success: result.rowsAffected === 1 });
}