
import { db } from "../src/db";
import { writings } from "../src/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Fixing views data...");
    const allWritings = await db.select().from(writings);

    for (const w of allWritings) {
        // Cast to string because runtime value is string despite TS type saying number/null from new schema
        let val = String(w.views);
        let newVal = 0;

        if (val === 'null' || !val) {
            newVal = 0;
        } else if (val.includes("Views")) {
            newVal = parseInt(val.replace("Views", ""), 10);
        } else if (val.endsWith("k")) {
            newVal = parseFloat(val.replace("k", "")) * 1000;
        } else {
            newVal = parseInt(val, 10);
        }

        if (isNaN(newVal)) newVal = 0;

        console.log(`Updating ID ${w.id}: '${val}' -> ${newVal}`);

        await db.update(writings)
            .set({ views: newVal })
            .where(eq(writings.id, w.id));
    }

    console.log("Done!");
}

main().catch(console.error);
