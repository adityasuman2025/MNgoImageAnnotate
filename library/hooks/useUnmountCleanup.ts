import { useRef, useEffect } from "react";

type CleanupFn = () => void;

export default function useUnmountCleanup() {
    const cleanupRef = useRef<CleanupFn | null>(null);

    useEffect(() => {
        return () => {
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
    }, []);

    return cleanupRef;
}
