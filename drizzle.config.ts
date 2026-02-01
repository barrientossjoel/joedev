
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_DATABASE_URL;
if (!url) {
    console.error("❌ CRTICAL ERROR: VITE_DATABASE_URL is missing in drizzle.config.ts process.env");
} else {
    console.log("✅ Drizzle Kit Config URL:", url.replace(/:[^:]*@/, ":***@")); // Log masked URL
    const token = process.env.VITE_DATABASE_AUTH_TOKEN;
    console.log("🔑 Drizzle Kit Token Status:", token ? `Present (Length: ${token.length})` : "MISSING");
}


export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: url!,
        authToken: process.env.VITE_DATABASE_AUTH_TOKEN,
    },
});
