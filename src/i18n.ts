import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en } from "./locales/en";
import { es } from "./locales/es";

// Extend the CustomTypeOptions interface for type safety
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "translation";
        resources: typeof en;
    }
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en,
            es,
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ["navigator", "htmlTag", "path", "subdomain"],
            caches: ["localStorage"],
        },
    });

export default i18n;
