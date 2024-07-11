import { CC_TURSO_DB_TOKEN, CC_TURSO_DB_URL } from "$env/static/private";
import { createClient } from "@libsql/client/web";

const client = createClient({
    url: CC_TURSO_DB_URL,
    authToken: CC_TURSO_DB_TOKEN,
});

export { client as db };