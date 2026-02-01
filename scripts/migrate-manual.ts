
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
        `CREATE TABLE IF NOT EXISTS "journey" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "year" text NOT NULL,
            "title" text NOT NULL,
            "description" text NOT NULL,
            "order" integer DEFAULT 0 NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS "profile" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "name" text NOT NULL,
            "role" text NOT NULL,
            "image" text NOT NULL
        );`,
        // We use try-catch for ALTER as sqlite doesn't support IF NOT EXISTS for columns easily in one statement
        `ALTER TABLE "bookmarks" ADD "link" text;`
    ];

    for (const query of queries) {
        try {
            console.log("Executing:", query.substring(0, 50) + "...");
            await client.execute(query);
            console.log("✅ Success");
        } catch (e: any) {
            if (e.message?.includes("already exists") || e.message?.includes("duplicate column")) {
                console.log("⚠️ Already exists (Skipping)");
            } else {
                console.error("❌ Failed:", e);
            }
        }
    }
}

main();
