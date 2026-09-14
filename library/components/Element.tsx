import { memo, useRef, useCallback } from "react";
import { ELEMENT_TRANSFORM_TEMPLATE, getElementTransformVariables } from "../utils/transform";
import { useScaleFactor } from "../context/ScaleFactorContext";
import SelectionOverlay from "./SelectionOverlay";
import useUnmountCleanup from "../hooks/useUnmountCleanup";
import useAnnotation from "../hooks/useAnnotation";
import useToolIcon from "../hooks/useToolIcon";
import { createGestureCleanup } from "../utils/gesture";
import updateAnnotationById from "../utils/store";
import { clampToBoundary } from "../utils/boundary";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";

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
    const elementRef = useRef<HTMLDivElement>(null);

    const { readonly, bgRef, bgBaseDimn } = useGlobalStaticData();
    const { scaleFactorRef } = useScaleFactor();
    const cleanupDragRef = useUnmountCleanup(); // cleaning up the pointer window events and raf on un-mount

    const { name, pos, rotation, dimensions, posRef, rotationRef, dimensionsRef } = useAnnotation(id);
    const toolIcon = useToolIcon(name);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (readonly) return;
        e.stopPropagation();

        cleanupDragRef.current?.();

        const element = elementRef.current;
        const currPos = posRef.current;
        const currScaleFactor = scaleFactorRef.current;
        if (!element || !currPos || !currScaleFactor) return;

        onSelect(id); // making that element in selected state

        const dragStartPosX = e.clientX, dragStartPosY = e.clientY;
        const currPosX = currPos.x, currPosY = currPos.y;

        let newX = currPosX, newY = currPosY;
        let rafId: number | null = null;

        function onPointerMove(moveEvent: PointerEvent) {
            const diffX = moveEvent.clientX - dragStartPosX, diffY = moveEvent.clientY - dragStartPosY;

            const targetPos = {
                x: currPosX + diffX / currScaleFactor.x,
                y: currPosY + diffY / currScaleFactor.y,
            };

            const clampedPos = clampToBoundary({
                targetPos,
                elementDimensions: dimensionsRef.current ?? { width: 0, height: 0 },
                bgBaseDimn,
                bgElement: bgRef.current,
                scaleFactor: currScaleFactor,
            });

            newX = clampedPos.x;
            newY = clampedPos.y;

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (element) {
                        element.style.setProperty("--el-x", `${newX}px`);
                        element.style.setProperty("--el-y", `${newY}px`);
                    }
                });
            }
        }

        function onPointerUp() {
            cleanup();
            if (newX !== currPosX || newY !== currPosY) {
                updateAnnotationById(id, prev => ({ ...prev, pos: { x: newX, y: newY } }));
            }
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
    }, [id, onSelect, readonly, bgBaseDimn]);

    console.log("Element render");

    return (
        <div
            ref={elementRef}
            data-annotation-element
            className={`select-none absolute overflow-visible flex items-center justify-center text-sm font-medium ${readonly ? "pointer-events-none cursor-default" : "cursor-grab"}`}
            onPointerDown={handlePointerDown}
            style={{
                top: 0,
                left: 0,
                width: `calc(${dimensions.width}px * var(--scale-x, 1))`,
                height: `calc(${dimensions.height}px * var(--scale-y, 1))`,
                transformOrigin: "top left",
                willChange: "transform, width, height",
                transform: ELEMENT_TRANSFORM_TEMPLATE,
                ...getElementTransformVariables(pos, rotation),
            }}
        >
            {toolIcon}

            {isSelected && (
                <SelectionOverlay
                    id={id}
                    elementRef={elementRef}
                    rotationRef={rotationRef}
                    dimensionsRef={dimensionsRef}
                />
            )}
        </div>
    );
}

export default memo(Element);