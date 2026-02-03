
import { createClient } from "@libsql/client";
import "dotenv/config";

const url = process.env.VITE_DATABASE_URL;
const authToken = process.env.VITE_DATABASE_AUTH_TOKEN;

console.log("Testing auth with URL:", url);
console.log("Token length:", authToken?.length);

const client = createClient({ url: url!, authToken });

async function main() {
    try {
        await client.execute("SELECT 1");
        console.log("✅ Connection SUCCESS");

        // Also check if video column exists (it shouldn't yet)
        try {
            await client.execute("SELECT video FROM bookmarks LIMIT 1");
            console.log("⚠️ Video column ALREADY EXISTS");
        } catch {
            console.log("ℹ️ Video column does not exist (expected)");
        }

    } catch (e) {
        console.error("❌ Connection FAILED:", e);
    }
}

main();
