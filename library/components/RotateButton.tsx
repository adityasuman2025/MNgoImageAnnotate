import { memo, useCallback, type RefObject } from "react";
import type { AnnotationId } from "../types";
import rotateIcon from "../images/rotateIcon.svg";
import useUnmountCleanup from "../hooks/useUnmountCleanup";
import { createGestureCleanup } from "../utils/gesture";
import updateAnnotationById from "../utils/updateAnnotationById";

interface RotateButtonProps {
    id: AnnotationId;
    elementRef: RefObject<HTMLDivElement | null>;
    rotationRef: RefObject<number>;
    className?: string;
}
function RotateButton({
    id,
    elementRef,
    rotationRef,
    className = "",
}: RotateButtonProps) {
    const cleanupRotateRef = useUnmountCleanup();

    const handleRotatePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
        cleanupRotateRef.current?.();
        e.stopPropagation();

        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const initialRotation = rotationRef.current;

        let currentRot = initialRotation;
        let rafId: number | null = null;

        function onPointerMove(moveEvent: PointerEvent) {
            const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
            currentRot = Math.round(initialRotation + (angle - startAngle));

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (element) element.style.setProperty("--el-rot", `${currentRot}deg`);
                });
            }
        }

        function onPointerUp() {
            cleanup();
            if (currentRot !== initialRotation) {
                updateAnnotationById(id, (prev) => ({ ...prev, rotation: currentRot }));
            }
        }

        const cleanup = createGestureCleanup({
            getRafId: () => rafId,
            clearRafId: () => { rafId = null; },
            onPointerMove,
            onPointerUp,
            cleanupRef: cleanupRotateRef,
        });

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }, [id]);

    return (
        <button
            type="button"
            aria-label="Rotate"
            className={className}
            onPointerDown={handleRotatePointerDown}
        >
            <img src={rotateIcon} alt="Rotate" className="w-3.5 h-3.5" draggable={false} />
        </button>
    );
}

export default memo(RotateButton);
