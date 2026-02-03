import { useQuery } from "@tanstack/react-query";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { projects, writings, bookmarks, categories } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";

export function useProjects() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            return await db.select().from(projects);
        },
    });

    return { data: data || [], loading, error };
}

export function useWritings() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["writings"],
        queryFn: async () => {
            return await db.select().from(writings);
        },
    });

    return { data: data || [], loading, error };
}

export function useBookmarks(categoryId?: number) {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["bookmarks", categoryId],
        queryFn: async () => {
            let query = db.select().from(bookmarks);
            if (categoryId) {
                // @ts-ignore - simple filter for now
                query = db.select().from(bookmarks).where(eq(bookmarks.categoryId, categoryId));
            }
            return await query;
        },
    });

    return { data: data || [], loading, error };
}

export function useCategories() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            return await db.select().from(categories).orderBy(categories.name);
        },
    });

    return { data: data || [], loading, error };
}

export function useJourney() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["journey"],
        queryFn: async () => {
            return await db.select().from(schema.journey).orderBy(schema.journey.order);
        },
    });

    return { data: data || [], loading, error };
}

export function useProfile() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await db.select().from(schema.profile).limit(1);
            return res[0];
        },
    });

    return { data, loading, error };
}

export function useQuotes() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["quotes"],
        queryFn: async () => {
            return await db.select().from(schema.quotes);
        },
    });

    return { data: data || [], loading, error };
}

export function useCategoryCoverImages() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["categoryCoverImages"],
        queryFn: async () => {
            // Fetch all bookmarks that have images
            return await db.select({
                categoryId: bookmarks.categoryId,
                image: bookmarks.image
            })
                .from(bookmarks)
                .where(isNotNull(bookmarks.image));
        },
        select: (res) => {
            // Process to preserve the first image found for each category
            const map: Record<number, string> = {};
            res.forEach(item => {
                if (item.categoryId && !map[item.categoryId] && item.image) {
                    map[item.categoryId] = item.image;
                }
            });
            return map;
        }
    });

    return { data: data || {}, loading, error };
}
