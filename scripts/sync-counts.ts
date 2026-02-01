
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
    try {
        console.log("🔄 Recounting bookmarks...");

        // Get counts
        const start = Date.now();
        const res = await client.execute("SELECT category_id, COUNT(*) as count FROM bookmarks WHERE category_id IS NOT NULL GROUP BY category_id");

        console.log("Counts:", res.rows);

        // Reset all to 0 first (safety)
        await client.execute("UPDATE categories SET count = 0");

        // Update with real counts
        for (const row of res.rows) {
            await client.execute({
                sql: "UPDATE categories SET count = ? WHERE id = ?",
                args: [row.count, row.category_id]
            });
        }

        const end = Date.now();
        console.log(`✅ Counts synchronized in ${end - start}ms!`);

    } catch (e) {
        console.error("❌ Failed:", e);
    }
}

main();
