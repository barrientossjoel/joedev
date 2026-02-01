
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_DATABASE_URL;
const authToken = process.env.VITE_DATABASE_AUTH_TOKEN;

const client = createClient({
    url: url!,
    authToken: authToken,
});

async function main() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS "quotes" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "text" text NOT NULL,
            "author" text NOT NULL,
            "background" text
        );`
    ];

    for (const query of queries) {
        try {
            console.log("Executing:", query.substring(0, 50) + "...");
            await client.execute(query);
            console.log("✅ Success");
        } catch (e: any) {
            console.error("❌ Failed:", e);
        }
    }
}

main();
