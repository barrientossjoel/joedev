
import { useState } from "react";
import { useJourney } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const JourneyAdmin = () => {
    const { data: journey, loading } = useJourney();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.journey.$inferSelect | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [year, setYear] = useState("");
    const [title, setTitle] = useState("");
    const [titleEs, setTitleEs] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionEs, setDescriptionEs] = useState("");
    const [order, setOrder] = useState(0);

    const resetForm = () => {
        setYear("");
        setTitle("");
        setTitleEs("");
        setDescription("");
        setDescriptionEs("");
        setOrder(0);
        setEditingItem(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const handleEdit = (item: typeof schema.journey.$inferSelect) => {
        setEditingItem(item);
        setYear(item.year);
        setTitle(item.title);
        setTitleEs(item.title_es || "");
        setDescription(item.description);
        setDescriptionEs(item.description_es || "");
        setOrder(item.order);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            await db.delete(schema.journey).where(eq(schema.journey.id, id));
            toast.success("Item deleted");
            // Force reload or refetch would be better, but simple reload works for now
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete item");
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const values = {
                year,
                title,
                title_es: titleEs,
                description,
                description_es: descriptionEs,
                order
            };

            if (editingItem) {
                await db.update(schema.journey)
                    .set(values)
                    .where(eq(schema.journey.id, editingItem.id));
                toast.success("Item updated");
            } else {
                await db.insert(schema.journey).values(values);
                toast.success("Item created");
            }

            setIsOpen(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save item");
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
                    <h1 className="text-2xl font-bold">Journey</h1>
                    <p className="text-muted-foreground">Manage your career timeline.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus size={16} className="mr-2" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Event" : "Add Event"}</DialogTitle>
                            <DialogDescription>
                                Add or modify a journey timeline event.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input value={year} onChange={e => setYear(e.target.value)} required placeholder="2024" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Order</Label>
                                    <Input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Title (EN)</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Role or Achievement" />
                            </div>
                            <div className="space-y-2">
                                <Label>Title (ES)</Label>
                                <Input value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Rol o Logro" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (EN)</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Details..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (ES)</Label>
                                <Textarea value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)} placeholder="Detalles..." />
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
                            <TableHead className="w-16">Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journey.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.year}</TableCell>
                                <TableCell>{item.order}</TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell className="truncate max-w-[300px]">{item.description}</TableCell>
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

export default JourneyAdmin;
