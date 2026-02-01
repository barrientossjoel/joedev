
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_DATABASE_URL;
const authToken = process.env.VITE_DATABASE_AUTH_TOKEN;

console.log("Testing Connection...");
console.log("URL:", url?.substring(0, 20) + "...");
console.log("Token:", authToken ? "Present" : "Missing");

const client = createClient({
    url: url!,
    authToken: authToken,
});

async function main() {
    try {
        const res = await client.execute("SELECT 1");
        console.log("✅ Connection Successful!", res);
    } catch (e) {
        console.error("❌ Connection Failed:", e);
    }
}

main();
