
import { useState } from "react";
import { useQuotes } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const QuotesAdmin = () => {
    const { data: quotes, loading } = useQuotes();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.quotes.$inferSelect | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [text, setText] = useState("");
    const [textEs, setTextEs] = useState("");
    const [author, setAuthor] = useState("");
    const [background, setBackground] = useState("");

    const resetForm = () => {
        setText("");
        setTextEs("");
        setAuthor("");
        setBackground("");
        setEditingItem(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const handleEdit = (item: typeof schema.quotes.$inferSelect) => {
        setEditingItem(item);
        setText(item.text);
        setTextEs(item.text_es || "");
        setAuthor(item.author);
        setBackground(item.background || "");
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quote?")) return;
        try {
            await db.delete(schema.quotes).where(eq(schema.quotes.id, id));
            toast.success("Quote deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete quote");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const values = {
                text,
                text_es: textEs,
                author,
                background
            };

            if (editingItem) {
                await db.update(schema.quotes)
                    .set(values)
                    .where(eq(schema.quotes.id, editingItem.id));
                toast.success("Quote updated");
            } else {
                await db.insert(schema.quotes).values(values);
                toast.success("Quote created");
            }
            setIsOpen(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save quote");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Quotes</h1>
                    <p className="text-muted-foreground">Manage hero section quotes and backgrounds.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus size={16} className="mr-2" />
                            Add Quote
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Quote" : "Add Quote"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Quote Text (EN)</Label>
                                <Textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    required
                                    placeholder="The only way to do great work..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Quote Text (ES)</Label>
                                <Textarea
                                    value={textEs}
                                    onChange={e => setTextEs(e.target.value)}
                                    placeholder="La única forma de hacer un gran trabajo..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Input
                                    value={author}
                                    onChange={e => setAuthor(e.target.value)}
                                    required
                                    placeholder="Steve Jobs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Background (CSS or Image URL)</Label>
                                <Input
                                    value={background}
                                    onChange={e => setBackground(e.target.value)}
                                    placeholder="https://... or linear-gradient(...)"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Can be a URL or a CSS value like 'linear-gradient(...)'.
                                </p>
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

            <div className="border rounded-lg bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Text</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead className="w-[100px]">Background</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No quotes yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((item: typeof schema.quotes.$inferSelect) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium max-w-[300px] truncate" title={item.text}>
                                        "{item.text}"
                                    </TableCell>
                                    <TableCell>{item.author}</TableCell>
                                    <TableCell>
                                        {item.background ? (
                                            <div
                                                className="w-8 h-8 rounded border bg-cover bg-center"
                                                style={{
                                                    background: item.background.includes('http') ? `url(${item.background})` : item.background
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
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
    );
};

export default QuotesAdmin;
