import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAutoCollapseConfig {
    initialCollapsed?: boolean;
    initialDelay?: number;
    leaveDelay?: number;
}

export function useAutoCollapse({ initialCollapsed = true, initialDelay = 1500, leaveDelay = 300 }: UseAutoCollapseConfig = {}) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onMouseEnter = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsCollapsed(false);
    }, []);

    const onMouseLeave = useCallback(() => {
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
    }, []);

    return {
        isCollapsed,
        bind: {
            onMouseEnter,
            onMouseLeave
        }
    };
}
