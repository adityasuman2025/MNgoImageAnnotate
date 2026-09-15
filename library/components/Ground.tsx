import { memo, useState, useCallback, useRef } from "react";
import Image from "./Image";
import FreeDrawCanvas from "./FreeDrawCanvas";
import Stage from "./Stage";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import { useScaleFactor } from "../context/ScaleFactorContext";
import globalStore from "../store";
import { DEFAULT_ELEMENT_DIMENSIONS, DEFAULT_ELEMENT_ROTATION, DEFAULT_TOOL_NAMES, SPECIAL_TOOLS } from "../constants";
import { clampToBoundary } from "../utils/boundary";
import { createAnnotationElement } from "../utils/store";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import type { Dimensions } from "../types";

interface GroundProps {
    onImageDimensionsReady: (dimn: Dimensions) => void;
}
function Ground({ onImageDimensionsReady }: GroundProps) {
    const { readonly, imgSrc, bgRef, bgBaseDimnRef } = useGlobalStaticData();
    const { scaleFactorRef } = useScaleFactor();

    const [isImgLoaded, setIsImgLoaded] = useState(!imgSrc);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const handleImageDimnReady = useCallback((dimn: Dimensions) => {
        onImageDimensionsReady(dimn);
        setIsImgLoaded(true);
    }, [onImageDimensionsReady]);

    const handleImageLoadError = useCallback(() => {
        setIsImgLoaded(false);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (readonly) return;

        const target = e.target as HTMLElement | null;

        // if clicked on any element or its selection overlay (outline, resize, delete, resize)
        // -> then removing the active tool
        if (target?.closest("[data-annotation-element]") || target?.closest("[data-selection-overlay]")) {
            globalStore.setActiveToolName(null);
        } else {
            setSelectedElementId(null); // resetting the selected element on clicking anywhere else

            const activeToolName = globalStore.getActiveToolName();
            if (!activeToolName) return;

            const isTextTool = activeToolName === DEFAULT_TOOL_NAMES.TEXT;
            const isPencilTool = activeToolName === DEFAULT_TOOL_NAMES.PENCIL;
            const isAddableTool = (isTextTool || !SPECIAL_TOOLS.includes(activeToolName)) && !isPencilTool;

            // if any tool is selected from the tool bar then adding it on the ground if they are not specially abled tools (except for the Text tool)
            if (isAddableTool) {
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
                    bgBaseDimn: bgBaseDimnRef.current,
                });

                const annotationElement = createAnnotationElement({
                    name: activeToolName,
                    pos: { x, y },
                    dimensions: DEFAULT_ELEMENT_DIMENSIONS,
                    rotation: DEFAULT_ELEMENT_ROTATION,
                    ...(isTextTool ? { text: "" } : {})
                });

                globalStore.updateAnnotationById(annotationElement.id, annotationElement);
                setSelectedElementId(annotationElement.id); // selecting newly added element
                globalStore.setActiveToolName(null); // resetting selected tool in the toolbar
            }
        }
    }, [readonly]);

    const clipboardRef = useRef<ReturnType<typeof globalStore.getAnnotationById> | null>(null);

    useKeyboardShortcut((e) => {
        const isModifier = e.ctrlKey || e.metaKey;
        if (!isModifier) return;

        const key = e.key.toLowerCase();
        if (key === "c" && selectedElementId) {
            const element = globalStore.getAnnotationById(selectedElementId);
            if (element) clipboardRef.current = { ...element };
        } else if (key === "v" && clipboardRef.current) {
            e.preventDefault();
            const copiedElement = clipboardRef.current;
            if (!copiedElement.pos || !copiedElement.dimensions) return;

            const offset = 20;
            const { x, y } = clampToBoundary({
                targetPos: { x: copiedElement.pos.x + offset, y: copiedElement.pos.y + offset },
                elementDimensions: copiedElement.dimensions,
                bgBaseDimn: bgBaseDimnRef.current,
            });

            const newElement = createAnnotationElement({
                name: copiedElement.name,
                pos: { x, y },
                dimensions: { ...copiedElement.dimensions },
                rotation: copiedElement.rotation ?? 0,
                ...(copiedElement.text !== undefined ? { text: copiedElement.text } : {}),
            });

            globalStore.updateAnnotationById(newElement.id, newElement);
            setSelectedElementId(newElement.id);
            clipboardRef.current = null;
        }
    }, !readonly);

    return (
        <div data-ground className="relative select-none" onPointerDown={handlePointerDown} >
            {imgSrc ? (
                <Image
                    src={imgSrc}
                    bgRef={bgRef}
                    isImgLoaded={isImgLoaded}
                    onDimensionsReady={handleImageDimnReady}
                    onLoadError={handleImageLoadError}
                />
            ) : (
                <div
                    ref={(node) => {
                        bgRef.current = node;
                    }}
                    className="w-full select-none flex-1"
                    style={{
                        backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                    }}
                />
            )}

            {isImgLoaded && (
                <>
                    <FreeDrawCanvas />
                    <Stage selectedElementId={selectedElementId} onSelectElement={setSelectedElementId} />
                </>
            )}
        </div>
    );
}

export default memo(Ground);