
import { useState } from "react";
import { useProjects } from "@/hooks/use-db-data";
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
import { Plus, Pencil, Trash2, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const ProjectsAdmin = () => {
    const { data: projects, loading } = useProjects();
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof schema.projects.$inferSelect | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [number, setNumber] = useState("");
    const [title, setTitle] = useState("");
    const [titleEs, setTitleEs] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionEs, setDescriptionEs] = useState("");
    const [image, setImage] = useState("");
    const [link, setLink] = useState("");

    // Translation Hook
    const { translate, isTranslating, hasKey } = useContentTranslator();

    // Handle translation
    const handleTranslate = async () => {
        // Case 1: Translate EN -> ES
        if (title && description) {
            const result = await translate({ title, content: description }, 'es');
            if (result) {
                setTitleEs(result.title_es || "");
                setDescriptionEs(result.content_es || "");
            }
            return;
        }

        // Case 2: Translate ES -> EN
        if (titleEs && descriptionEs) {
            const result = await translate({ title: titleEs, content: descriptionEs }, 'en');
            if (result) {
                setTitle(result.title || "");
                setDescription(result.content || "");
            }
            return;
        }

        toast.info("Please fill Title and Description in one language to translate.");
    };

    const resetForm = () => {
        setNumber("");
        setTitle("");
        setTitleEs("");
        setDescription("");
        setDescriptionEs("");
        setImage("");
        setLink("");
        setEditingItem(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const handleEdit = (item: typeof schema.projects.$inferSelect) => {
        setEditingItem(item);
        setNumber(item.number);
        setTitle(item.title);
        setTitleEs(item.title_es || "");
        setDescription(item.description);
        setDescriptionEs(item.description_es || "");
        setImage(item.image);
        setLink(item.link || "");
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            await db.delete(schema.projects).where(eq(schema.projects.id, id));
            toast.success("Project deleted");
            window.location.reload();
        } catch (e) {
            toast.error("Failed to delete project");
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const values = {
                number,
                title,
                title_es: titleEs,
                description,
                description_es: descriptionEs,
                image,
                link
            };

            if (editingItem) {
                await db.update(schema.projects)
                    .set(values)
                    .where(eq(schema.projects.id, editingItem.id));
                toast.success("Project updated");
            } else {
                await db.insert(schema.projects).values(values);
                toast.success("Project created");
            }

            setIsOpen(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to save project");
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
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-muted-foreground">Manage your portfolio projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus size={16} className="mr-2" />
                                Add Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Project" : "Add Project"}</DialogTitle>
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

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <Label>Number</Label>
                                        <Input value={number} onChange={e => setNumber(e.target.value)} required placeholder="01" />
                                    </div>
                                    <div className="space-y-2 col-span-3">
                                        <Label>Title (EN)</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Project Name" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Title (ES)</Label>
                                    <Input value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Nombre del Proyecto" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Project Link</Label>
                                    <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input value={image} onChange={e => setImage(e.target.value)} required placeholder="https://..." />
                                    </div>
                                    {image && (
                                        <div className="mt-2 relative h-32 w-full overflow-hidden rounded-md border">
                                            <img src={image} alt="Preview" className="object-cover w-full h-full opacity-80" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Description (EN)</Label>
                                        <Textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Project details..." className="h-32" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description (ES)</Label>
                                        <Textarea value={descriptionEs} onChange={e => setDescriptionEs(e.target.value)} placeholder="Detalles del proyecto..." className="h-32" />
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
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-muted-foreground">{item.number}</TableCell>
                                <TableCell>
                                    <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell className="truncate max-w-[300px] text-muted-foreground">{item.description}</TableCell>
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

export default ProjectsAdmin;
