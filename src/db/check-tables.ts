
import { db } from "./index";
import { sql } from "drizzle-orm";

async function checkTables() {
    const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table';`);
    console.log("Tables in DB:", result);
}

checkTables().catch(console.error);
