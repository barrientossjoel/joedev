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

        setIsTranslating(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const targetLangName = targetLanguage === 'es' ? "Spanish (Argentina - 'vos', professional but friendly)" : "English (Professional US English)";
            const outputKeys = targetLanguage === 'es'
                ? '"title_es", "content_es", "description_es"'
                : '"title", "content", "description"';

            const prompt = `
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

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Extract JSON from response (remove markdown code blocks if present)
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const translated = JSON.parse(jsonStr);

            toast.success(`Content translated to ${targetLanguage.toUpperCase()}! 🪄`);
            return translated;
        } catch (error) {
            console.error("Translation failed:", error);
            toast.error("Translation failed. Check your API Key.");
            return null;
        } finally {
            setIsTranslating(false);
        }
    };

    return { translate, isTranslating, hasKey };
};
