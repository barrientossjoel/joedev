
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
    // Check if column exists strictly if needed, but given the flow, we'll just try to add it.
    // Specifying "IF NOT EXISTS" logic in sqlite ALTER is tricky, so we just wrap in try-catch 
    // expecting success if it's new.
    const queries = [
        `ALTER TABLE projects ADD COLUMN link text;`
    ];

    for (const query of queries) {
        try {
            console.log("Executing:", query);
            await client.execute(query);
            console.log("✅ Success");
        } catch (e: any) {
            console.error("❌ Failed (might already exist):", e.message);
        }
    }
}

main();
