
import { db } from "../src/db";
import { writings } from "../src/db/schema";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Fetching writings...");
    const allWritings = await db.select().from(writings);
    console.log("Found", allWritings.length, "writings");
    allWritings.forEach((w: typeof writings.$inferSelect) => {
        console.log(`ID: ${w.id}, Title: ${w.title}, Slug: '${w.slug}', Views: '${w.views}', Type: ${typeof w.views}`);
    });
}

main().catch(console.error);
