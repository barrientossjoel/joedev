
import { useState } from "react";
import { useWritings } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const [views, setViews] = useState("");
    const [link, setLink] = useState("");

    const resetForm = () => {
        setYear("");
        setDate("");
        setTitle("");
        setViews("");
        setLink("");
        setEditingItem(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const handleEdit = (item: typeof schema.writings.$inferSelect) => {
        setEditingItem(item);
        setYear(item.year);
        setDate(item.date);
        setTitle(item.title);
        setViews(item.views);
        setLink(item.link || "");
        setIsOpen(true);
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
            const values = { year, date, title, views, link };

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
                    <DialogContent>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Views</Label>
                                    <Input value={views} onChange={e => setViews(e.target.value)} required placeholder="1.2k" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link (Optional)</Label>
                                    <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
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
                            <TableHead className="w-24">Year</TableHead>
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {writings.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground">{item.year}</TableCell>
                                <TableCell className="font-mono text-xs">{item.date}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {item.title}
                                        {item.link && <LinkIcon size={12} className="text-muted-foreground" />}
                                    </div>
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
