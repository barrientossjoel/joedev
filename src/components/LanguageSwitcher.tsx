import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    const languages = [
        { code: "en", label: "English" },
        { code: "es", label: "Español" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    <span className="text-xs">{t("sidebar.language")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        <span className="flex-1">{lang.label}</span>
                        {i18n.language === lang.code && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
