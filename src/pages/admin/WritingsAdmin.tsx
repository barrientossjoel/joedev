
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWritings } from "@/hooks/use-db-data";
import { useContentTranslator } from "@/hooks/use-content-translator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, Eye, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const WritingsAdmin = () => {
    const { data: writings, loading } = useWritings();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.writings.$inferSelect | null>(null);


    // Form state
    const [year, setYear] = useState("");
    const [date, setDate] = useState("");
    const [title, setTitle] = useState("");
    const [titleEs, setTitleEs] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [contentEs, setContentEs] = useState("");
    const [link, setLink] = useState("");

    // Translation Hook
    const { translate, isTranslating, hasKey } = useContentTranslator();

    // Handle translation
    const handleTranslate = async () => {
        // Case 1: Translate EN -> ES
        if (title && content) {
            const result = await translate({ title, content }, 'es');
            if (result) {
                setTitleEs(result.title_es || "");
                setContentEs(result.content_es || "");
            }
            return;
        }

        // Case 2: Translate ES -> EN
        if (titleEs && contentEs) {
            const result = await translate({ title: titleEs, content: contentEs }, 'en');
            if (result) {
                setTitle(result.title || "");
                setContent(result.content || "");
            }
            return;
        }

        toast.info("Please fill Title and Content in one language to translate.");
    };

    // Helper to track if user manually edited slug
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!editingItem && !isSlugManuallyEdited && title) {
            const autoSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(autoSlug);
        }
    }, [title, editingItem, isSlugManuallyEdited]);

    const resetForm = () => {
        setYear(new Date().getFullYear().toString());
        setDate(new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })); // e.g. 2/3
        setTitle("");
        setTitleEs("");
        setSlug("");
        setContent("");
        setContentEs("");
        setLink("");
        setEditingItem(null);
        setIsSlugManuallyEdited(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
        else if (!editingItem) resetForm(); // Reset when opening new
    };

    const handleEdit = (item: typeof schema.writings.$inferSelect) => {
        setEditingItem(item);
        setYear(item.year);
        setDate(item.date);
        setTitle(item.title);
        setTitleEs(item.title_es || "");
        setSlug(item.slug || "");
        setContent(item.content || "");
        setContentEs(item.content_es || "");
        setLink(item.link || "");
        setIsOpen(true);
        setIsSlugManuallyEdited(true); // Don't auto-update slug when editing
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            await db.delete(schema.writings).where(eq(schema.writings.id, id));
            toast.success("Article deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete article");
            console.error(e);
        }
    };

    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual Validation: Ensure at least one language is complete
        const hasEn = title.trim() && content.trim();
        const hasEs = titleEs.trim() && contentEs.trim();

        if (!hasEn && !hasEs) {
            toast.error("Please fill Title and Content in at least one language.");
            return;
        }

        // Optimistic UI: Close immediately
        setIsOpen(false);
        const toastId = toast.loading("Saving article in background...");

        // Background Process
        (async () => {
            try {
                // Auto-translate if needed (before saving)
                let finalTitleEs = titleEs;
                let finalContentEs = contentEs;
                let finalTitle = title;
                let finalContent = content;

                if (hasKey) {
                    // Case 1: EN -> ES (if ES is missing)
                    if (hasEn && !hasEs) {
                        const result = await translate({ title, content }, 'es');
                        if (result) {
                            finalTitleEs = result.title_es || finalTitleEs;
                            finalContentEs = result.content_es || finalContentEs;
                        }
                    }
                    // Case 2: ES -> EN (if EN is missing)
                    else if (hasEs && !hasEn) {
                        const result = await translate({ title: titleEs, content: contentEs }, 'en');
                        if (result) {
                            finalTitle = result.title || finalTitle;
                            finalContent = result.content || finalContent;
                        }
                    }
                }

                const values = {
                    year,
                    date,
                    title: finalTitle,
                    title_es: finalTitleEs,
                    slug,
                    content: finalContent,
                    content_es: finalContentEs,
                    // views is auto-managed
                    link
                };

                if (editingItem) {
                    await db.update(schema.writings)
                        .set(values)
                        .where(eq(schema.writings.id, editingItem.id));
                } else {
                    await db.insert(schema.writings).values({
                        ...values,
                        views: 0,
                    });
                }

                // Invalidate query to refresh list
                await queryClient.invalidateQueries({ queryKey: ["writings"] });

                toast.dismiss(toastId);
                toast.success("Article saved successfully!");

            } catch (e) {
                console.error(e);
                toast.dismiss(toastId);
                toast.error("Failed to save article in background.");
            }
        })();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Writings</h1>
                    <p className="text-muted-foreground">Manage your articles and posts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus size={16} className="mr-2" />
                                Add Article
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Article" : "Add Article"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Translation Toolbar */}
                                {hasKey && (
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleTranslate}
                                            disabled={isTranslating || (!title && !titleEs)}
                                            className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/50"
                                        >
                                            {isTranslating ? (
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Wand2 className="mr-2 h-3 w-3" />
                                            )}
                                            Auto-Translate
                                        </Button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Input value={year} onChange={e => setYear(e.target.value)} required placeholder="2024" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input value={date} onChange={e => setDate(e.target.value)} required placeholder="12/05" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Title (EN)</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Article Title" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title (ES)</Label>
                                        <Input value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Título del Artículo" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Slug (URL)</Label>
                                    <Input
                                        value={slug}
                                        onChange={e => {
                                            setSlug(e.target.value);
                                            setIsSlugManuallyEdited(true);
                                        }}
                                        required
                                        placeholder="article-title-slug"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        URL: /writing/{slug}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Content (EN - Markdown)</Label>
                                        <Textarea
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            required
                                            placeholder="# My Article content..."
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content (ES - Markdown)</Label>
                                        <Textarea
                                            value={contentEs}
                                            onChange={e => setContentEs(e.target.value)}
                                            placeholder="# Contenido del artículo..."
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label>External Link (Optional)</Label>
                                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://... (overrides internal)" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {writings.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {item.date}/{item.year}
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {item.title}
                                        {item.link && <LinkIcon size={12} className="text-muted-foreground" />}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm font-mono">
                                    {item.slug}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    <div className="flex items-center gap-1">
                                        <Eye size={12} />
                                        {item.views}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                            <Pencil size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default WritingsAdmin;
