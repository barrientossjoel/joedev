
import { useState, useEffect } from "react";
import { useWritings } from "@/hooks/use-db-data";
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
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, Eye } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const WritingsAdmin = () => {
    const { data: writings, loading } = useWritings();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.writings.$inferSelect | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [year, setYear] = useState("");
    const [date, setDate] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [views, setViews] = useState("");
    const [link, setLink] = useState("");

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
        setSlug("");
        setContent("");
        setViews("0");
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
        setSlug(item.slug || "");
        setContent(item.content || "");
        setViews(item.views);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const values = { year, date, title, slug, content, views, link };

            if (editingItem) {
                await db.update(schema.writings)
                    .set(values)
                    .where(eq(schema.writings.id, editingItem.id));
                toast.success("Article updated");
            } else {
                await db.insert(schema.writings).values(values);
                toast.success("Article created");
            }

            setIsOpen(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save article");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Writings</h1>
                    <p className="text-muted-foreground">Manage your articles and posts.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus size={16} className="mr-2" />
                            Add Article
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Article" : "Add Article"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Article Title" />
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

                            <div className="space-y-2">
                                <Label>Content (Markdown)</Label>
                                <Textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                    placeholder="# My Article content..."
                                    className="min-h-[200px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Views</Label>
                                    <Input value={views} onChange={e => setViews(e.target.value)} required placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>External Link (Optional)</Label>
                                    <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://... (overrides internal)" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
