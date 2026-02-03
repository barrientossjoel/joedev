
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Helper to getenv specifically for Vite + Bun compatibility
const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    return undefined;
};

const url = getEnv("VITE_DATABASE_URL")?.replace("libsql://", "https://");
const authToken = getEnv("VITE_DATABASE_AUTH_TOKEN");

console.log("🔌 Connecting to DB:", url ? "Turso Cloud" : "Local Fallback");

const client = createClient({
    url: url || "file:local.db",
    authToken: authToken,
});

export const db = drizzle(client, { schema });
