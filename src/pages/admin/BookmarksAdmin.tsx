
import { useState } from "react";
import { useBookmarks, useCategories } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// Sub-component for managing categories
const CategoryManager = ({ categories, counts }: { categories: typeof schema.categories.$inferSelect[], counts: Record<number, number> }) => {
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<string>("root"); // "root" or ID
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter categories to avoid circular dependencies (simple version: don't allow selecting self)
    const availableParents = categories.filter(c => c.id !== editingId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            const newParentId = parentId === "root" ? null : parseInt(parentId);

            if (editingId) {
                await db.update(schema.categories)
                    .set({ name, parentId: newParentId })
                    .where(eq(schema.categories.id, editingId));
                toast.success("Category updated");
            } else {
                await db.insert(schema.categories).values({ name, count: 0, parentId: newParentId });
                toast.success("Category created");
            }
            setName("");
            setParentId("root");
            setEditingId(null);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save category");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this category? Bookmarks in it will become Uncategorized.")) return;
        try {
            // First update bookmarks to remove category
            await db.update(schema.bookmarks)
                .set({ categoryId: null })
                .where(eq(schema.bookmarks.categoryId, id));

            // Then delete category
            await db.delete(schema.categories).where(eq(schema.categories.id, id));
            toast.success("Category deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete category");
        }
    };

    const getParentName = (pid: number | null) => {
        if (!pid) return "-";
        return categories.find(c => c.id === pid)?.name || "?";
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="space-y-1">
                    <Label className="text-xs">Category Name</Label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Category name..."
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Parent Category (Optional)</Label>
                    <Select value={parentId} onValueChange={setParentId}>
                        <SelectTrigger>
                            <SelectValue placeholder="No Parent (Root)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="root">No Parent (Root)</SelectItem>
                            {availableParents.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 justify-end">
                    {editingId && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setName(""); setParentId("root"); setEditingId(null); }}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" size="sm" disabled={isLoading}>
                        {editingId ? "Update" : "Add Category"}
                    </Button>
                </div>
            </form>

            <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {categories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No categories yet.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="py-2">Name</TableHead>
                                <TableHead className="py-2">Parent</TableHead>
                                <TableHead className="py-2 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell className="py-2 font-medium">
                                        {cat.name} <span className="text-muted-foreground font-normal text-xs ml-1">({counts[cat.id] || 0} items)</span>
                                    </TableCell>
                                    <TableCell className="py-2 text-muted-foreground text-xs">{getParentName(cat.parentId)}</TableCell>
                                    <TableCell className="py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                setName(cat.name);
                                                setParentId(cat.parentId ? cat.parentId.toString() : "root");
                                                setEditingId(cat.id);
                                            }}>
                                                <Pencil size={12} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(cat.id)}>
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

const BookmarksAdmin = () => {
    const { data: bookmarks, loading: bookmarksLoading } = useBookmarks();
    const { data: categories, loading: categoriesLoading } = useCategories();

    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.bookmarks.$inferSelect | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Selection state
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [count, setCount] = useState(0);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setLink("");
        setMediaUrl("");
        setCategoryId(selectedCategoryId ? selectedCategoryId.toString() : ""); // Pre-select current category
        setCount(0);
        setEditingItem(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // If opening and we have a selected category, set it
            if (!editingItem && selectedCategoryId) {
                setCategoryId(selectedCategoryId.toString());
            }
        } else {
            resetForm(); // Reset on close
        }
    };

    const handleEdit = (item: typeof schema.bookmarks.$inferSelect) => {
        setEditingItem(item);
        setTitle(item.title);
        setDescription(item.description || "");
        setLink(item.link || "");
        setMediaUrl(item.video || item.image || "");
        setCategoryId(item.categoryId?.toString() || "");
        setCount(item.count);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this bookmark?")) return;

        try {
            // Get the bookmark first to know its category
            const item = bookmarks.find(b => b.id === id);

            await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id));

            // Decrement category count if it had one
            if (item?.categoryId) {
                const cat = categories.find(c => c.id === item.categoryId);
                if (cat) {
                    await db.update(schema.categories)
                        .set({ count: cat.count > 0 ? cat.count - 1 : 0 })
                        .where(eq(schema.categories.id, cat.id));
                }
            }

            toast.success("Bookmark deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete bookmark");
            console.error(e);
        }
    };

    const isVideo = (url: string) => {
        return /\.(mp4|webm|mov|mkv)(\?|$|#)/i.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const newCategoryId = categoryId ? parseInt(categoryId) : null;

            const isVid = isVideo(mediaUrl);
            const values = {
                title,
                description,
                link,
                image: isVid ? null : mediaUrl,
                video: isVid ? mediaUrl : null,
                count,
                categoryId: newCategoryId
            };

            if (editingItem) {
                await db.update(schema.bookmarks)
                    .set(values)
                    .where(eq(schema.bookmarks.id, editingItem.id));

                // Handle Category Count Update if Changed
                // 1. If category changed
                if (editingItem.categoryId !== newCategoryId) {
                    // Decrement old
                    if (editingItem.categoryId) {
                        const oldCat = categories.find(c => c.id === editingItem.categoryId);
                        if (oldCat) {
                            await db.update(schema.categories)
                                .set({ count: oldCat.count > 0 ? oldCat.count - 1 : 0 })
                                .where(eq(schema.categories.id, oldCat.id));
                        }
                    }
                    // Increment new
                    if (newCategoryId) {
                        const newCat = categories.find(c => c.id === newCategoryId);
                        if (newCat) {
                            await db.update(schema.categories)
                                .set({ count: newCat.count + 1 })
                                .where(eq(schema.categories.id, newCat.id));
                        }
                    }
                }

                toast.success("Bookmark updated");
            } else {
                await db.insert(schema.bookmarks).values(values);

                // Increment category count
                if (newCategoryId) {
                    const newCat = categories.find(c => c.id === newCategoryId);
                    if (newCat) {
                        await db.update(schema.categories)
                            .set({ count: newCat.count + 1 })
                            .where(eq(schema.categories.id, newCat.id));
                    }
                }

                toast.success("Bookmark created");
            }

            setIsOpen(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save bookmark");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (bookmarksLoading || categoriesLoading) return <div>Loading...</div>;

    const getCategoryName = (id: number | null) => {
        if (!id) return "Uncategorized";
        return categories.find(c => c.id === id)?.name || "Unknown";
    };

    // Filter bookmarks
    const filteredBookmarks = selectedCategoryId
        ? bookmarks.filter(b => b.categoryId === selectedCategoryId)
        : bookmarks;

    // Calculate real counts from bookmarks
    const categoryCounts = bookmarks.reduce((acc, b) => {
        if (b.categoryId) {
            acc[b.categoryId] = (acc[b.categoryId] || 0) + 1;
        }
        return acc;
    }, {} as Record<number, number>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Bookmarks</h1>
                    <p className="text-muted-foreground">Manage your curated resources.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Categories */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-semibold">Categories</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Pencil size={12} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Manage Categories</DialogTitle>
                                </DialogHeader>
                                <CategoryManager categories={categories} counts={categoryCounts} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="space-y-1">
                        <Button
                            variant={selectedCategoryId === null ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedCategoryId(null)}
                        >
                            All Bookmarks
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={selectedCategoryId === cat.id ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setSelectedCategoryId(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-4">
                    <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                        <h2 className="text-lg font-medium">
                            {selectedCategoryId
                                ? getCategoryName(selectedCategoryId)
                                : "All Bookmarks"}
                            <span className="ml-2 text-sm text-muted-foreground">({filteredBookmarks.length})</span>
                        </h2>

                        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus size={16} className="mr-2" />
                                    Add Bookmark
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{editingItem ? "Edit Bookmark" : "Add Bookmark"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Resource Name" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={categoryId} onValueChange={setCategoryId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Link URL</Label>
                                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Media URL (Image or Video)</Label>
                                        <div className="flex gap-2">
                                            <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://... (.jpg, .png, .mp4, .webm)" />
                                        </div>
                                        {mediaUrl && (
                                            <div className="mt-2 relative h-32 w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                                                {isVideo(mediaUrl) ? (
                                                    <video src={mediaUrl} className="max-h-full max-w-full" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={mediaUrl} alt="Preview" className="object-cover w-full h-full opacity-80" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." />
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

                    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Img</TableHead>
                                    <TableHead>Title</TableHead>
                                    {!selectedCategoryId && <TableHead>Category</TableHead>}
                                    <TableHead>Link</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookmarks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No bookmarks found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookmarks.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.image || item.video ? (
                                                    <div className="w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
                                                        {item.video ? (
                                                            <video src={item.video} className="w-full h-full object-cover" muted />
                                                        ) : (
                                                            <img src={item.image!} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                                        <LinkIcon size={14} className="text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.title}</span>
                                                    <span
                                                        className="text-xs text-muted-foreground truncate max-w-[200px] cursor-help"
                                                        title={item.description || ""}
                                                    >
                                                        {item.description}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {!selectedCategoryId && (
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {getCategoryName(item.categoryId)}
                                                    </span>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {item.link && (
                                                    <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink size={12} className="mr-1" /> Visit
                                                        </a>
                                                    </Button>
                                                )}
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookmarksAdmin;
