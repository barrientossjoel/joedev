import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAutoCollapseConfig {
    initialCollapsed?: boolean;
    initialDelay?: number;
    leaveDelay?: number;
}

export function useAutoCollapse({ initialCollapsed = true, initialDelay = 1500, leaveDelay = 300 }: UseAutoCollapseConfig = {}) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const expand = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsCollapsed(false);
    }, []);

    const collapse = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsCollapsed(true);
        }, leaveDelay);
    }, [leaveDelay]);

    // Initial collapse timer
    useEffect(() => {
        if (!initialCollapsed) {
            timeoutRef.current = setTimeout(() => {
                setIsCollapsed(true);
            }, initialDelay);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [initialCollapsed, initialDelay]);

    return {
        isCollapsed,
        expand,
        collapse,
        bind: {
            onMouseEnter: expand,
            onMouseLeave: collapse
        }
    };
}
