import { Moon, Sun, Monitor, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="theme-toggle-btn rounded-none">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 theme-retro:scale-0 theme-amber:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 theme-retro:scale-0 theme-amber:scale-0" />
                    <Terminal className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all theme-retro:rotate-0 theme-retro:scale-100 theme-amber:rotate-0 theme-amber:scale-100 text-[hsl(var(--primary))]" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("theme-amber")}>
                    <div className="mr-2 h-4 w-4 rounded-full bg-[oklch(0.85_0.12_95)]" />
                    <span>Amber / Petrochem</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("theme-retro")}>
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>Retrofuturism</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
