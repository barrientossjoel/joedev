import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
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
        staleTime: Infinity, // Projects rarely change
        refetchOnWindowFocus: false,
    });

    return { data: data || [], loading, error };
}

type Writing = typeof schema.writings.$inferSelect;
type OptimizedWriting = Omit<Writing, "content" | "content_es">;

export function useWritings(options: { includeContent: true }): { data: Writing[], loading: boolean, error: any };
export function useWritings(options?: { includeContent?: false }): { data: OptimizedWriting[], loading: boolean, error: any };
export function useWritings(options: { includeContent?: boolean } = {}) {
    const { includeContent } = options;
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["writings", { includeContent }],
        queryFn: async () => {
            if (includeContent) {
                return await db.select().from(writings) as Writing[];
            }
            // Optimization: Exclude heavy 'content' field for the list view
            return await db.select({
                id: writings.id,
                year: writings.year,
                date: writings.date,
                title: writings.title,
                title_es: writings.title_es,
                slug: writings.slug,
                views: writings.views,
                link: writings.link
            }).from(writings) as OptimizedWriting[];
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    return { data: data || [], loading, error };
}

export function useArticle(slug: string) {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["article", slug],
        queryFn: async () => {
            const res = await db.select()
                .from(writings)
                .where(eq(writings.slug, slug))
                .limit(1);
            return res[0];
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    return { data, loading, error };
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return { data: data || [], loading, error };
}

export function useCategories() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            return await db.select().from(categories).orderBy(categories.name);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return { data: data || [], loading, error };
}

export function useJourney() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["journey"],
        queryFn: async () => {
            return await db.select().from(schema.journey).orderBy(schema.journey.order);
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
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
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    return { data, loading, error };
}

export function useQuotes() {
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["quotes"],
        queryFn: async () => {
            return await db.select().from(schema.quotes);
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    return { data: data || [], loading, error };
}

export function useCategoryCoverImages() {
    const { data: catData } = useCategories();
    const { data, isLoading: loading, error } = useQuery({
        queryKey: ["categoryCoverImages"],
        queryFn: async () => {
            // Optimized: We prefer the explicit coverImage from category if set
            // Otherwise we fallback to pulling images from bookmarks
            return await db.select({
                categoryId: bookmarks.categoryId,
                image: bookmarks.image
            })
                .from(bookmarks)
                .where(isNotNull(bookmarks.image));
        },
        select: (res) => {
            const map: Record<number, string> = {};

            // First pass: Fill with existing category coverImages if they exist
            catData.forEach(cat => {
                if (cat.coverImage) {
                    map[cat.id] = cat.coverImage;
                }
            });

            // Second pass: Fill gaps with bookmark images (legacy/automatic behavior)
            res.forEach(item => {
                if (item.categoryId && !map[item.categoryId] && item.image) {
                    map[item.categoryId] = item.image;
                }
            });
            return map;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return { data: data || {}, loading, error };
}

export function useIncrementView() {
    return useCallback(async (id: number, currentViews: number) => {
        try {
            await db.update(writings)
                .set({ views: currentViews + 1 })
                .where(eq(writings.id, id));
            return true;
        } catch (e) {
            console.error("Failed to increment views:", e);
            return false;
        }
    }, []);
}
