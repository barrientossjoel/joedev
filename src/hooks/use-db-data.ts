
import { useState, useEffect } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { projects, writings, bookmarks, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export function useProjects() {
    const [data, setData] = useState<typeof projects.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(projects);
                setData(res);
            } catch (e) {
                console.error("Failed to fetch projects:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return { data, loading };
}

export function useWritings() {
    const [data, setData] = useState<typeof writings.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(writings);
                setData(res);
            } catch (e) {
                console.error("Failed to fetch writings:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return { data, loading };
}

export function useBookmarks(categoryId?: number) {
    const [data, setData] = useState<typeof bookmarks.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                setLoading(true);
                let query = db.select().from(bookmarks);
                if (categoryId) {
                    // @ts-ignore - simple filter for now
                    query = db.select().from(bookmarks).where(eq(bookmarks.categoryId, categoryId));
                }
                const res = await query;
                setData(res);
            } catch (e) {
                console.error("Failed to fetch bookmarks:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, [categoryId]);

    return { data, loading };
}

export function useCategories() {
    const [data, setData] = useState<typeof categories.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(categories).orderBy(categories.name);
                setData(res);
            } catch (e) {
                console.error("Failed to fetch categories:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return { data, loading };
}

export function useJourney() {
    const [data, setData] = useState<typeof schema.journey.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(schema.journey).orderBy(schema.journey.order);
                setData(res);
            } catch (e) {
                console.error("Failed to fetch journey:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);


    return { data, loading };
}

export function useProfile() {
    const [data, setData] = useState<typeof schema.profile.$inferSelect | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(schema.profile).limit(1);
                setData(res[0]);
            } catch (e) {
                console.error("Failed to fetch profile:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return { data, loading };
}

export function useQuotes() {
    const [data, setData] = useState<typeof schema.quotes.$inferSelect[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await db.select().from(schema.quotes);
                setData(res);
            } catch (e) {
                console.error("Failed to fetch quotes:", e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return { data, loading };
}
