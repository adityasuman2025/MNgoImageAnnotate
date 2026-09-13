import { memo, useState, useCallback, useSyncExternalStore } from "react";
import Element from "./Element";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import globalStore from "../store";
import type { Annotation } from "../types";
import { useScaleFactor } from "../context/ScaleFactorContext";
import { DEFAULT_ELEMENT_DIMENSIONS, DEFAULT_ELEMENT_ROTATION, SPECIAL_TOOLS } from "../constants";
import { clampToBoundary } from "../utils/boundary";

function Ground() {
    const { readonly, bgRef, bgBaseDimn } = useGlobalStaticData();
    const { scaleFactorRef } = useScaleFactor();

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const annotationIds = useSyncExternalStore(globalStore.subscribeToAnnotationIds, globalStore.getAllAnnotationIds);

    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
        if (readonly) return;

        const target = e.target as HTMLElement | null;

        // if clicked on any element or its selection overlay (outline, resize, delete, resize)
        // -> then removing the active tool
        if (target?.closest("[data-annotation-element]") || target?.closest("[data-selection-overlay]")) {
            globalStore.setActiveToolName(null);
        } else {
            setSelectedElementId(null); // resetting the selected element on clicking anywhere else

            // if any tool is selected from the tool bar then adding it on the ground if they are not specially abled tools 
            const activeToolName = globalStore.getActiveToolName();
            if (activeToolName && !SPECIAL_TOOLS?.includes(activeToolName)) {
                const bgEl = bgRef.current;
                if (!bgEl) return;

                const bgEleRect = bgEl.getBoundingClientRect();
                const targetPos = {
                    x: (e.clientX - bgEleRect.left) / scaleFactorRef.current.x - DEFAULT_ELEMENT_DIMENSIONS.width / 2,
                    y: (e.clientY - bgEleRect.top) / scaleFactorRef.current.y - DEFAULT_ELEMENT_DIMENSIONS.height / 2,
                };

                const { x, y } = clampToBoundary({
                    targetPos,
                    elementDimensions: DEFAULT_ELEMENT_DIMENSIONS,
                    bgBaseDimn,
                    bgElement: bgEl,
                    scaleFactor: scaleFactorRef.current,
                });

                const nextZIndex = globalStore.getHighestZIndex() + 1;
                globalStore.setHighestZIndex(nextZIndex);

                const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `anno_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                const annotationElement: Annotation = {
                    id,
                    name: activeToolName,
                    zIndex: nextZIndex,
                    pos: { x, y },
                    dimensions: DEFAULT_ELEMENT_DIMENSIONS,
                    rotation: DEFAULT_ELEMENT_ROTATION
                };

                globalStore.updateAnnotationById(id, annotationElement);
                setSelectedElementId(id); // selecting newly added element
                globalStore.setActiveToolName(null); // resetting selected tool in the toolbar
            }
        }
    };

    const handleSelect = useCallback((id: string) => {
        if (readonly) return;

        setSelectedElementId(id);
    }, [readonly]);

    console.log("Ground render");

    return (
        <div
            onPointerDown={handlePointerDown}
            className={`w-full absolute inset-0 flex-1 relative overflow-hidden ${readonly ? "pointer-events-none select-none" : ""}`}
        >
            {
                annotationIds.map(id => (
                    <Element
                        key={id}
                        id={id}
                        isSelected={id === selectedElementId}
                        onSelect={handleSelect}
                    />
                ))
            }
        </div>
    );
}

export default memo(Ground);