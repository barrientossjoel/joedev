
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-db-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProfileAdmin = () => {
    const { data: profile, loading } = useProfile();
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [roleEs, setRoleEs] = useState("");
    const [bio, setBio] = useState("");
    const [bioEs, setBioEs] = useState("");
    const [image, setImage] = useState(""); // Base64 or URL
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setRole(profile.role);
            setRoleEs(profile.role_es || "");
            setBio(profile.bio || "");
            setBioEs(profile.bio_es || "");
            setImage(profile.image);
        }
    }, [profile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (profile) {
                // Update
                await db.update(schema.profile)
                    .set({ name, role, role_es: roleEs, bio, bio_es: bioEs, image })
                    .where(eq(schema.profile.id, profile.id));
                toast.success("Profile updated successfully");
            } else {
                // Create
                await db.insert(schema.profile).values({ name, role, role_es: roleEs, bio, bio_es: bioEs, image });
                toast.success("Profile created successfully");
                // Reload to refresh the hook state ideally, or we just rely on local state
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your public profile details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
                <div className="space-y-2">
                    <Label htmlFor="image">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border">
                            {image ? (
                                <img src={image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No Img
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, max 1MB.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Joel Barrientos"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role (English)</Label>
                        <Input
                            id="role"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            placeholder="e.g. Frontend Developer"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="roleEs">Role (Spanish)</Label>
                        <Input
                            id="roleEs"
                            value={roleEs}
                            onChange={e => setRoleEs(e.target.value)}
                            placeholder="e.g. Desarrollador Frontend"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio (English)</Label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Describe yourself for the home page..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bioEs">Bio (Spanish)</Label>
                    <textarea
                        id="bioEs"
                        value={bioEs}
                        onChange={e => setBioEs(e.target.value)}
                        placeholder="Descríbete para la página de inicio..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </div>
    );
};

export default ProfileAdmin;
