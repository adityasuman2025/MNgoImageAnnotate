import { memo, type RefObject, type MouseEvent } from "react";
import RotateButton from "./RotateButton";
import ResizeHandle from "./ResizeHandle";
import deleteIcon from "../images/deleteIcon.svg";
import { ACTION_BUTTON_BASE, RESIZE_HANDLE_BASE } from "../constants";
import type { AnnotationId, Dimensions } from "../types";
import globalStore from "../store";

interface SelectionOverlayProps {
    id: AnnotationId;
    elementRef: RefObject<HTMLDivElement | null>;
    rotationRef: RefObject<number>;
    dimensionsRef: RefObject<Dimensions>;
}
function SelectionOverlay({
    id,
    elementRef,
    rotationRef,
    dimensionsRef,
}: SelectionOverlayProps) {

    function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
        e.stopPropagation();
        globalStore.removeAnnotationById(id);
    }

    return (
        <div
            data-selection-overlay
            className="absolute -inset-1.5 pointer-events-none"
        >
            <div data-outline-box className="absolute inset-0 border-2 border-teal-500 rounded-md pointer-events-none" />

            <RotateButton
                id={id}
                elementRef={elementRef}
                rotationRef={rotationRef}
                className={`${ACTION_BUTTON_BASE} -top-5 -translate-y-1/2 bg-violet-300 hover:bg-violet-400`}
            />

            <button
                type="button"
                aria-label="Delete"
                className={`${ACTION_BUTTON_BASE} -bottom-5 translate-y-1/2 bg-red-300 hover:bg-red-400`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleDeleteClick}
            >
                <img src={deleteIcon} alt="Delete" className="w-3.5 h-3.5" draggable={false} />
            </button>

            <ResizeHandle
                id={id}
                elementRef={elementRef}
                rotationRef={rotationRef}
                dimensionsRef={dimensionsRef}
                className={RESIZE_HANDLE_BASE}
            />
        </div>
    );
}

export default memo(SelectionOverlay);
