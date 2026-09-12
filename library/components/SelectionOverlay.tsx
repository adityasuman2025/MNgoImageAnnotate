import { memo, type RefObject } from "react";
import type { Coordinates, Dimensions } from "../utils/transform";
import RotateButton from "./RotateButton";
import ResizeHandle from "./ResizeHandle";
import deleteIcon from "../images/deleteIcon.svg";
import { ACTION_BUTTON_BASE, RESIZE_HANDLE_BASE } from "../constants";

interface SelectionOverlayProps {
    elementRef: RefObject<HTMLDivElement | null>;
    posRef: RefObject<Coordinates>;
    dimensionsRef: RefObject<Dimensions>;
    rotationRef: RefObject<number>;
    setDimensions: (dim: Dimensions) => void;
    setRotation: (rot: number) => void;
    onDelete?: () => void;
}

function SelectionOverlay({
    elementRef,
    posRef,
    dimensionsRef,
    rotationRef,
    setDimensions,
    setRotation,
    onDelete,
}: SelectionOverlayProps) {
    return (
        <div
            data-selection-overlay
            className="absolute -inset-1.5 pointer-events-none"
            style={{ zIndex: 1 }}
        >
            <div
                data-outline-box
                className="absolute inset-0 border-2 border-teal-500 rounded-md pointer-events-none"
            />

            <RotateButton
                elementRef={elementRef}
                posRef={posRef}
                rotationRef={rotationRef}
                setRotation={setRotation}
                className={`${ACTION_BUTTON_BASE} -top-5 -translate-y-1/2 bg-violet-300 hover:bg-violet-400`}
            />

            <button
                type="button"
                aria-label="Delete"
                className={`${ACTION_BUTTON_BASE} -bottom-5 translate-y-1/2 bg-red-300 hover:bg-red-400`}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                }}
            >
                <img src={deleteIcon} alt="Delete" className="w-3.5 h-3.5" draggable={false} />
            </button>

            <ResizeHandle
                elementRef={elementRef}
                dimensionsRef={dimensionsRef}
                rotationRef={rotationRef}
                setDimensions={setDimensions}
                className={RESIZE_HANDLE_BASE}
            />
        </div>
    );



}

export default memo(SelectionOverlay);
