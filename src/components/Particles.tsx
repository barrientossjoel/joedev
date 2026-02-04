import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const Particle = ({
    x, // percentage 0-100
    y, // percentage 0-100
    size,
    duration,
    mouseX,
    mouseY,
    containerRect
}: {
    x: number;
    y: number;
    size: number;
    duration: number;
    mouseX: any;
    mouseY: any;
    containerRect: React.MutableRefObject<{ w: number; h: number; left: number; top: number }>;
}) => {
    // Calculate repulsion
    const dx = useTransform(mouseX, (mx: number) => {
        // Calculate screen X position of the particle
        // containerRect.current.left + (percentage * width)
        const itemScreenX = containerRect.current.left + (x / 100) * containerRect.current.w;
        const diff = mx - itemScreenX;
        return diff;
    });

    const dy = useTransform(mouseY, (my: number) => {
        const itemScreenY = containerRect.current.top + (y / 100) * containerRect.current.h;
        const diff = my - itemScreenY;
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
            className="absolute bg-foreground/80 rounded-full"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                x: xSpring,
                y: ySpring,
            }}
            animate={{
                opacity: [0.2, 0.8, 0.4],
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
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
    const containerRef = useRef<HTMLDivElement>(null);
    const containerRect = useRef({ w: 0, h: 0, left: 0, top: 0 });

    useEffect(() => {
        setMounted(true);

        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                containerRect.current = {
                    w: rect.width,
                    h: rect.height,
                    left: rect.left,
                    top: rect.top
                };
            }
        };

        // Initial measurement
        updateDimensions();

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 60 : 130;

        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 5 + 5,
        }));
        setParticles(newParticles);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleResize = () => {
            updateDimensions();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);

        // Also observe the container specifically in case layout changes without window resize
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateDimensions();
            });
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, []);

    if (!mounted) return null;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        >
            {particles.map((p) => (
                <Particle
                    key={p.id}
                    {...p}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    containerRect={containerRect}
                />
            ))}
        </div>
    );
};
