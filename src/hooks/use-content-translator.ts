import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";

export const useContentTranslator = () => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [hasKey, setHasKey] = useState(!!localStorage.getItem("gemini_api_key"));

    useEffect(() => {
        const checkKey = () => setHasKey(!!localStorage.getItem("gemini_api_key"));

        window.addEventListener('storage', checkKey);
        window.addEventListener('gemini_key_updated', checkKey);

        // Check periodically just in case or on focus
        window.addEventListener('focus', checkKey);

        return () => {
            window.removeEventListener('storage', checkKey);
            window.removeEventListener('gemini_key_updated', checkKey);
            window.removeEventListener('focus', checkKey);
        };
    }, []);

    const getApiKey = () => localStorage.getItem("gemini_api_key");

    const translate = async (
        input: { title: string; content: string; description?: string },
        targetLanguage: 'es' | 'en'
    ) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            toast.error("API Key missing. Please configure it in settings.");
            return null;
        }

        if (!apiKey.startsWith("AIza")) {
            toast.error("Invalid API Key format. Must start with 'AIza'.");
            return null;
        }

        const targetLangName = targetLanguage === 'es' ? "Spanish (Argentina - 'vos', professional but friendly)" : "English (Professional US English)";
        const outputKeys = targetLanguage === 'es'
            ? '"title_es", "content_es", "description_es"'
            : '"title", "content", "description"';

        const translationPrompt = `
            You are a professional translator and copywriter specialized in software portfolios.
            Translate the following content to ${targetLangName}.
            
            Rules:
            1. Maintain all Markdown formatting exactly (headers, bullets, code blocks).
            2. Do NOT translate technical terms (e.g., "React", "Hook", "Frontend", "Slug").
            3. Return ONLY a JSON object with the keys: ${outputKeys}.
            
            Input:
            Title: ${input.title}
            Description: ${input.description || ""}
            Content: ${input.content}
            `;

        setIsTranslating(true);
        try {
            // Dynamic Model Discovery
            // We fetch the list of models available to this key to avoid 404s on specific versions
            let modelName = "gemini-1.5-flash"; // Default fallback

            try {
                const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                const listResp = await fetch(listUrl);
                if (listResp.ok) {
                    const data = await listResp.json();
                    const models = data.models || [];
                    // Prefer Flash, then Pro, then anything capable of generateContent
                    const bestModel = models.find((m: any) =>
                        m.supportedGenerationMethods?.includes("generateContent") &&
                        m.name.includes("flash")
                    ) || models.find((m: any) =>
                        m.supportedGenerationMethods?.includes("generateContent") &&
                        m.name.includes("pro")
                    );

                    if (bestModel) {
                        modelName = bestModel.name.replace("models/", "");
                        console.log("Auto-detected best model:", modelName);
                    }
                }
            } catch (e) {
                console.warn("Failed to list models, using default:", e);
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(translationPrompt);
            const response = result.response;
            const text = response.text();

            // Extract JSON from response (remove markdown code blocks if present)
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const translated = JSON.parse(jsonStr);

            toast.success(`Translated! 🪄`);
            return translated;
        } catch (error: any) {
            console.warn("Primary attempt failed, trying robust fallbacks...", error);

            // Hardcoded Fallback Strategy (if dynamic failed)
            const fallbacks = ["gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

            for (const fallbackModel of fallbacks) {
                try {
                    console.log(`Retrying with ${fallbackModel}...`);
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: fallbackModel });

                    const result = await model.generateContent(translationPrompt);
                    const response = result.response;
                    const text = response.text();

                    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                    const translated = JSON.parse(jsonStr);

                    toast.success(`Translated (fallback)! 🪄`);
                    return translated;
                } catch (retryError) {
                    continue;
                }
            }

            console.error("All translation attempts failed.");
            const errorMessage = error?.message || "Unknown error";

            if (errorMessage.includes("API key not valid")) {
                toast.error("Invalid API Key. Please check your settings.");
            } else if (errorMessage.includes("429")) {
                toast.error("Quota exceeded. Try again later.");
            } else {
                toast.error(`Translation failed. Check permissions.`);
            }
            return null;
        } finally {
            setIsTranslating(false);
        }
    };

    return { translate, isTranslating, hasKey };
};
