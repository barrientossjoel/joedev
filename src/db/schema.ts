
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    number: text("number").notNull(),
    link: text("link"),
});

export const writings = sqliteTable("writings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: text("year").notNull(),
    date: text("date").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    views: text("views").notNull(),
    link: text("link"),
});

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    count: integer("count").notNull(),
    parentId: integer("parent_id"), // Self-reference for simple hierarchy
});

export const bookmarks = sqliteTable("bookmarks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    count: integer("count").notNull(),
    image: text("image"),
    video: text("video"),
    link: text("link"),
    categoryId: integer("category_id").references(() => categories.id),
});

export const quotes = sqliteTable("quotes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text("text").notNull(),
    author: text("author").notNull(),
    // Stores CSS output for background (e.g., specific image URL or gradient string)
    background: text("background"),
});

export const journey = sqliteTable("journey", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: text("year").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    order: integer("order").notNull().default(0),
});

export const profile = sqliteTable("profile", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    image: text("image").notNull(), // Base64 string
});
