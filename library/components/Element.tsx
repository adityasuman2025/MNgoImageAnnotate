import { memo, useState, useRef, useCallback } from "react";
import { getTransformStyle, type Coordinates, type Dimensions } from "../utils/transform";
import { useScaleFactor } from "../context/ScaleFactorContext";
import SelectionOverlay from "./SelectionOverlay";
import { DEFAULT_ELEMENT_POS, DEFAULT_ELEMENT_ROTATION, DEFAULT_ELEMENT_DIMENSIONS } from "../constants";
import useSyncedRef from "../hooks/useSyncedRef";
import useUnmountCleanup from "../hooks/useUnmountCleanup";
import { createGestureCleanup } from "../utils/gesture";

export interface ElementProps {
    id: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
}
function Element({
    id,
    isSelected,
    onSelect,
}: ElementProps) {
    // Element encapsulates its own state (will come from global store by ID in future)
    const [pos, setPos] = useState<Coordinates>(() => ({ ...DEFAULT_ELEMENT_POS })); // will come from global store
    const posRef = useSyncedRef<Coordinates>(pos);

    const [rotation, setRotation] = useState<number>(DEFAULT_ELEMENT_ROTATION); // will come from global store
    const rotationRef = useSyncedRef<number>(rotation);

    const [dimensions, setDimensions] = useState<Dimensions>(() => ({ ...DEFAULT_ELEMENT_DIMENSIONS })); // will come from global store
    const dimensionsRef = useSyncedRef<Dimensions>(dimensions);
    // Element encapsulates its own state (will come from global store by ID in future)

    const elementRef = useRef<HTMLDivElement>(null);
    const { scaleFactorRef } = useScaleFactor();
    const cleanupDragRef = useUnmountCleanup(); // cleaning up the pointer window events and raf on un-mount

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        cleanupDragRef.current?.();

        const element = elementRef.current;
        const currPos = posRef.current;
        const currScaleFactor = scaleFactorRef.current;
        if (!element || !currPos || !currScaleFactor) return;

        // making that element in selected state
        onSelect(id);

        const dragStartPosX = e.clientX, dragStartPosY = e.clientY;
        const currPosX = currPos.x, currPosY = currPos.y;

        let diffX = 0, diffY = 0;
        let rafId: number | null = null;

        function onPointerMove(moveEvent: PointerEvent) {
            diffX = moveEvent.clientX - dragStartPosX;
            diffY = moveEvent.clientY - dragStartPosY;

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (element) {
                        element.style.transform = getTransformStyle({ pos: currPos, delta: { x: diffX, y: diffY }, rotation: rotationRef.current });
                    }
                });
            }
        }

        function onPointerUp() {
            cleanup();
            setPos({ x: currPosX + diffX / currScaleFactor.x, y: currPosY + diffY / currScaleFactor.y });
        }

        const cleanup = createGestureCleanup({
            getRafId: () => rafId,
            clearRafId: () => { rafId = null; },
            onPointerMove,
            onPointerUp,
            cleanupRef: cleanupDragRef,
        });

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }, [id, onSelect]);

    return (
        <div
            ref={elementRef}
            data-annotation-element
            className="cursor-grab select-none absolute bg-teal-100 p-2 overflow-visible flex items-center justify-center text-sm font-medium"
            onPointerDown={handlePointerDown}
            style={{
                top: 0,
                left: 0,
                width: `calc(${dimensions.width}px * var(--scale-x, 1))`,
                height: `calc(${dimensions.height}px * var(--scale-y, 1))`,
                transformOrigin: "top left",
                willChange: "transform, width, height",
                transform: getTransformStyle({ pos, rotation }),
            }}
        >
            Element

            {isSelected && (
                <SelectionOverlay
                    elementRef={elementRef}
                    posRef={posRef}
                    dimensionsRef={dimensionsRef}
                    rotationRef={rotationRef}
                    setDimensions={setDimensions}
                    setRotation={setRotation}
                />
            )}
        </div>
    );
}

export default memo(Element);