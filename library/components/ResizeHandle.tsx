import { memo, useCallback, type RefObject } from "react";
import { useScaleFactor } from "../context/ScaleFactorContext";
import type { Dimensions } from "../types";
import { MIN_ELEMENT_DIMENSIONS } from "../constants";
import useUnmountCleanup from "../hooks/useUnmountCleanup";
import { createGestureCleanup } from "../utils/gesture";

interface ResizeHandleProps {
    elementRef: RefObject<HTMLDivElement | null>;
    dimensionsRef: RefObject<Dimensions>;
    rotationRef: RefObject<number>;
    setDimensions: (dimensions: Dimensions) => void;
    minWidth?: number;
    minHeight?: number;
    className?: string;
}

function ResizeHandle({
    elementRef,
    dimensionsRef,
    rotationRef,
    setDimensions,
    minWidth = MIN_ELEMENT_DIMENSIONS.width,
    minHeight = MIN_ELEMENT_DIMENSIONS.height,
    className = "absolute -bottom-2.5 -right-2.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-full cursor-nwse-resize shadow-sm hover:scale-125 transition-transform pointer-events-auto",
}: ResizeHandleProps) {
    const { scaleFactorRef } = useScaleFactor();
    const cleanupResizeRef = useUnmountCleanup();

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        cleanupResizeRef.current?.();
        e.stopPropagation();

        const element = elementRef.current;
        const currDim = dimensionsRef.current;
        const currScaleFactor = scaleFactorRef.current;
        if (!element || !currDim || !currScaleFactor) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const initialWidth = currDim.width;
        const initialHeight = currDim.height;
        const initialRotation = rotationRef.current;

        const rotRad = (initialRotation * Math.PI) / 180;
        const cos = Math.cos(rotRad);
        const sin = Math.sin(rotRad);

        let finalWidth = initialWidth;
        let finalHeight = initialHeight;
        let rafId: number | null = null;

        function onPointerMove(moveEvent: PointerEvent) {
            const screenDx = (moveEvent.clientX - startX) / currScaleFactor.x;
            const screenDy = (moveEvent.clientY - startY) / currScaleFactor.y;

            // Project screen delta into element's local coordinate system
            const localDx = screenDx * cos + screenDy * sin;
            const localDy = -screenDx * sin + screenDy * cos;

            finalWidth = Math.max(minWidth, Math.round(initialWidth + localDx));
            finalHeight = Math.max(minHeight, Math.round(initialHeight + localDy));

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (element) {
                        element.style.width = `calc(${finalWidth}px * var(--scale-x, 1))`;
                        element.style.height = `calc(${finalHeight}px * var(--scale-y, 1))`;
                    }
                });
            }
        }

        function onPointerUp() {
            cleanup();
            setDimensions({ width: finalWidth, height: finalHeight });
        }

        const cleanup = createGestureCleanup({
            getRafId: () => rafId,
            clearRafId: () => { rafId = null; },
            onPointerMove,
            onPointerUp,
            cleanupRef: cleanupResizeRef,
        });

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }, [minHeight, minWidth, setDimensions]);

    return (
        <div
            role="separator"
            aria-label="Resize handle"
            className={className}
            onPointerDown={handlePointerDown}
        />
    );
}

export default memo(ResizeHandle);

