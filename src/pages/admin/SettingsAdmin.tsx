
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
                    <CardFooter className="flex gap-2">
                        <Button onClick={handleSave}>
                            <Check className="mr-2 h-4 w-4" /> Save Key
                        </Button>
                        <Button variant="outline" onClick={testConnection}>
                            ⚡ Test Connection
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default SettingsAdmin;

function testConnection() {
    const key = localStorage.getItem("gemini_api_key");
    if (!key) {
        toast.error("Please Save Key first.");
        return;
    }

    toast.promise(async () => {
        // Step 1: List Models (Checks Auth & Region separately from Model Generation)
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

        const response = await fetch(listUrl);
        const data = await response.json();

        if (!response.ok) {
            const errorDetails = data.error?.message || response.statusText;
            console.error("List Models Error:", data);

            if (response.status === 403) {
                throw new Error("403: Invalid API Key. (ListModels failed)");
            } else {
                throw new Error(`Connection Error (${response.status}): ${errorDetails}`);
            }
        }

        // Step 2: Find a usable model
        const models = data.models || [];
        const availableModel = models.find((m: any) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            (m.name.includes("flash") || m.name.includes("pro"))
        );

        if (!availableModel) {
            console.warn("Available models:", models);
            throw new Error("Connected, but no suitable Chat models found for this key.");
        }

        // Step 3: Test Generation with that specific model
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/${availableModel.name}:generateContent?key=${key}`;
        const genResp = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });

        if (!genResp.ok) {
            const err = await genResp.json();
            throw new Error(`Gen Error with ${availableModel.name}: ${err.error?.message}`);
        }

        return `Success! Connected via ${availableModel.name} 🚀`;
    }, {
        loading: 'Checking available models...',
        success: (msg) => msg,
        error: (err) => `Failed: ${err.message}`
    });
}
