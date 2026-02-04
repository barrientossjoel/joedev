
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Key } from "lucide-react";
import { toast } from "sonner";

const SettingsAdmin = () => {
    const [apiKey, setApiKey] = useState("");

    // Load existing key
    useEffect(() => {
        setApiKey(localStorage.getItem("gemini_api_key") || "");
    }, []);

    const handleSave = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem("gemini_api_key");
            toast.info("API Key removed");
        } else {
            localStorage.setItem("gemini_api_key", apiKey.trim());
            window.dispatchEvent(new Event("gemini_key_updated"));
            toast.success("Settings saved");
        }
        // Also dispatch on remove
        if (!apiKey.trim()) {
            window.dispatchEvent(new Event("gemini_key_updated"));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage global configurations for your portfolio.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Translation Service</CardTitle>
                        <CardDescription>
                            Configure Google Gemini AI for automatic content translation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="gemini-key" className="flex items-center gap-2">
                                <Key size={14} /> Google Gemini API Key
                            </Label>
                            <Input
                                id="gemini-key"
                                type="password"
                                placeholder="AIzaSy..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Required for auto-translating Writings, Projects, and Bookmarks.
                                <br />
                                Get it from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-primary">Google AI Studio</a>.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave}>
                            <Check className="mr-2 h-4 w-4" /> Save Key
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default SettingsAdmin;
