import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const Particle = ({
    x, // percentage 0-100
    y, // percentage 0-100
    size,
    duration,
    mouseX,
    mouseY,
    winSize
}: {
    x: number;
    y: number;
    size: number;
    duration: number;
    mouseX: any;
    mouseY: any;
    winSize: React.MutableRefObject<{ w: number; h: number }>;
}) => {
    // Calculate repulsion
    const dx = useTransform(mouseX, (mx: number) => {
        const itemX = (x / 100) * winSize.current.w;
        const diff = mx - itemX;
        return diff;
    });

    const dy = useTransform(mouseY, (my: number) => {
        const itemY = (y / 100) * winSize.current.h;
        const diff = my - itemY;
        return diff;
    });

    const xMove = useTransform([dx, dy], ([latestDx, latestDy]) => {
        const distance = Math.sqrt(Number(latestDx) ** 2 + Number(latestDy) ** 2);
        const radius = 200; // Repulsion radius
        if (distance < radius) {
            const force = (radius - distance) / radius;
            return Number(latestDx) < 0 ? force * 100 : force * -100; // Push away
        }
        return 0;
    });

    const yMove = useTransform([dx, dy], ([latestDx, latestDy]) => {
        const distance = Math.sqrt(Number(latestDx) ** 2 + Number(latestDy) ** 2);
        const radius = 200;
        if (distance < radius) {
            const force = (radius - distance) / radius;
            return Number(latestDy) < 0 ? force * 100 : force * -100; // Push away
        }
        return 0;
    });

    // Smooth physics
    const springConfig = { damping: 25, stiffness: 150 };
    const xSpring = useSpring(xMove, springConfig);
    const ySpring = useSpring(yMove, springConfig);

    return (
        <motion.div
            className="absolute bg-foreground/80 rounded-full" // Brighter: 80% opacity
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                x: xSpring, // Physics repulsion
                y: ySpring, // Physics repulsion
            }}
            animate={{
                opacity: [0.2, 0.8, 0.4], // Brighter twinkling
                y: [0, -30, 0], // Re-added passive floating (up and down)
                x: [0, Math.random() * 20 - 10, 0], // Passive drift
            }}
            transition={{
                // Separate transitions for different properties
                y: {
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                x: {
                    duration: duration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                opacity: {
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }
            }}
        />
    );
};

export const Particles = () => {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);
    const winSize = useRef({ w: 0, h: 0 });

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            winSize.current = { w: window.innerWidth, h: window.innerHeight };
        }

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 60 : 130;

        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1, // 1px to 5px
            duration: Math.random() * 5 + 5,
        }));
        setParticles(newParticles);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleResize = () => {
            winSize.current = { w: window.innerWidth, h: window.innerHeight };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <Particle
                    key={p.id}
                    {...p}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    winSize={winSize}
                />
            ))}
        </div>
    );
};
