import { useEffect, useState } from "react";
import { toast } from "sonner";

const KONAMI_CODE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
];

export function useKonamiCode() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === KONAMI_CODE[index]) {
                if (index === KONAMI_CODE.length - 1) {
                    // Success!
                    toast.success("🎮 Cheat Code Activated! God Mode Enabled!", {
                        description: "Just kidding, but here's a cookie 🍪",
                        duration: 5000,
                    });
                    setIndex(0);
                } else {
                    setIndex((prev) => prev + 1);
                }
            } else {
                setIndex(0);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [index]);
}
