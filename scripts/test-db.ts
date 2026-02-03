import { createClient } from "@libsql/client";
import "dotenv/config";

const url = process.env.VITE_DATABASE_URL;
const authToken = process.env.VITE_DATABASE_AUTH_TOKEN;

console.log("Testing connection...");
console.log("URL:", url);
console.log("Token present:", !!authToken);

const client = createClient({ url: url!, authToken });

async function main() {
    console.log("Fixing unique slugs...");

    try {
        const result = await client.execute("SELECT id FROM writings");
        for (const row of result.rows) {
            await client.execute({
                sql: "UPDATE writings SET slug = ? WHERE id = ?",
                args: [`post-${row.id}`, row.id]
            });
            console.log(`Updated slug for id ${row.id}`);
        }
    } catch (e) {
        console.error("Error updating slugs:", e);
    }

    try {
        await client.execute("CREATE UNIQUE INDEX `writings_slug_unique` ON `writings` (`slug`)");
        console.log("Created unique index on slug");
    } catch (e) { console.log("Index error (might exist):", e); }
}

main();
