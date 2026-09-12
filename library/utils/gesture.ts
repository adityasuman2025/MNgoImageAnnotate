import type { RefObject } from "react";

export interface GestureCleanupOptions {
    getRafId: () => number | null;
    clearRafId: () => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    cleanupRef: RefObject<(() => void) | null>;
}
export function createGestureCleanup({
    getRafId,
    clearRafId,
    onPointerMove,
    onPointerUp,
    cleanupRef,
}: GestureCleanupOptions): () => void {
    function cleanup() {
        const rafId = getRafId();
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            clearRafId();
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        cleanupRef.current = null;
    }

    cleanupRef.current = cleanup;
    return cleanup;
}
