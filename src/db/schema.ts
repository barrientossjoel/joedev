
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    title_es: text("title_es"),
    description: text("description").notNull(),
    description_es: text("description_es"),
    image: text("image").notNull(),
    number: text("number").notNull(),
    link: text("link"),
});

export const writings = sqliteTable("writings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: text("year").notNull(),
    date: text("date").notNull(),
    title: text("title").notNull(),
    title_es: text("title_es"),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    content_es: text("content_es"),
    views: text("views").notNull(),
    link: text("link"),
});

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    name_es: text("name_es"),
    count: integer("count").notNull(),
    parentId: integer("parent_id"), // Self-reference for simple hierarchy
});

export const bookmarks = sqliteTable("bookmarks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    title_es: text("title_es"),
    description: text("description"),
    description_es: text("description_es"),
    count: integer("count").notNull(),
    image: text("image"),
    video: text("video"),
    link: text("link"),
    categoryId: integer("category_id").references(() => categories.id),
});

export const quotes = sqliteTable("quotes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text("text").notNull(),
    text_es: text("text_es"),
    author: text("author").notNull(),
    // Stores CSS output for background (e.g., specific image URL or gradient string)
    background: text("background"),
});

export const journey = sqliteTable("journey", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: text("year").notNull(),
    title: text("title").notNull(),
    title_es: text("title_es"),
    description: text("description").notNull(),
    description_es: text("description_es"),
    order: integer("order").notNull().default(0),
});

export const profile = sqliteTable("profile", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    role_es: text("role_es"),
    bio: text("bio"), // For Home page description
    bio_es: text("bio_es"),
    image: text("image").notNull(), // Base64 string
});
