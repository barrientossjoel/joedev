
import { db } from "./index";
import { sql } from "drizzle-orm";

async function createTables() {
    console.log("🏗️ Creating tables directly via App Client...");

    try {
        // Enable foreign keys
        await db.run(sql`PRAGMA foreign_keys = ON;`);

        // Create Categories
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        count INTEGER DEFAULT 0
      );
    `);
        console.log("✓ Categories table created");

        // Create Projects
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT,
        link TEXT,
        "number" TEXT NOT NULL
      );
    `);
        console.log("✓ Projects table created");

        // Create Writings
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS writings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year TEXT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        views TEXT NOT NULL,
        link TEXT
      );
    `);
        console.log("✓ Writings table created");

        // Create Bookmarks (with FK)
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        link TEXT,
        image TEXT,
        count INTEGER DEFAULT 0,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);
        console.log("✓ Bookmarks table created");

        console.log("✅ All tables created successfully!");
    } catch (error) {
        console.error("❌ Failed to create tables:", error);
    }
}

createTables();
