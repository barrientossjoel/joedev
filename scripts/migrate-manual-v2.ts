
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
        `ALTER TABLE "categories" ADD "parent_id" integer;`
    ];

    for (const query of queries) {
        try {
            console.log("Executing:", query.substring(0, 50) + "...");
            await client.execute(query);
            console.log("✅ Success");
        } catch (e: any) {
            if (e.message?.includes("duplicate column")) {
                console.log("⚠️ Already exists (Skipping)");
            } else {
                console.error("❌ Failed:", e);
            }
        }
    }
}

main();
