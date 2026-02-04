import { useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export const Background = () => {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Create random pulses
    // We'll generate a fixed set of "active" squares that will pulse
    // To keep it performant, we won't render thousands of individual divs,
    // but a few absolute positioned accents.
    const [pulses, setPulses] = useState<Array<{ id: number, x: number, y: number, delay: number }>>([]);

    useEffect(() => {
        setMounted(true);
        // Generate random pulses positions
        const newPulses = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            delay: Math.random() * 5,
        }));
        setPulses(newPulses);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-10 h-full w-full bg-background overflow-hidden pointer-events-none">
            {/* Base Grid - Low opacity */}
            <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent)]" />

            {/* Spotlight Grid - Higher opacity, reveals on hover */}
            <motion.div
                className="absolute h-full w-full bg-[linear-gradient(to_right,#80808040_1px,transparent_1px),linear-gradient(to_bottom,#80808040_1px,transparent_1px)] bg-[size:24px_24px]"
                style={{ maskImage, WebkitMaskImage: maskImage }}
            />

            {/* Pulsing Data Squares */}
            {pulses.map((pulse) => (
                <motion.div
                    key={pulse.id}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                    style={{
                        left: `${pulse.x}%`,
                        top: `${pulse.y}%`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [1, 2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: pulse.delay,
                        ease: "easeInOut",
                        repeatDelay: Math.random() * 5
                    }}
                />
            ))}
        </div>
    );
};
