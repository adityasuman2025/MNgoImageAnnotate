import { memo, useState, useRef, useCallback } from "react";
import { getTransformStyle, type Coordinates } from "../utils/transform";
import { useScaleFactor } from "../context/ScaleFactorContext";

function Element() {
    const elementRef = useRef<HTMLDivElement>(null);

    const [pos, setPos] = useState<Coordinates>({ x: 0, y: 0 }); // will come from store
    const posRef = useRef<Coordinates>(pos);
    posRef.current = pos;

    const { scaleFactorRef } = useScaleFactor();

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const element = elementRef.current;
        const currPos = posRef.current;
        const currScaleFactor = scaleFactorRef.current;
        if (!element || !currPos || !currScaleFactor) return;

        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);

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
                        element.style.transform = getTransformStyle({
                            pos: currPos,
                            scale: currScaleFactor,
                            delta: { x: diffX, y: diffY },
                            applyScaleTransform: true,
                        });
                    }
                });
            }
        }

        function onPointerUp(upEvent: PointerEvent) {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            setPos({ x: currPosX + diffX / currScaleFactor.x, y: currPosY + diffY / currScaleFactor.y });

            try {
                target.releasePointerCapture(upEvent.pointerId);
            } catch { }

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }, []);

    return (
        <div
            ref={elementRef}
            className="w-fit cursor-grab select-none absolute bg-teal-100 p-2"
            onPointerDown={handlePointerDown}
            style={{
                top: 0,
                left: 0,
                transformOrigin: "top left",
                transform: getTransformStyle({
                    pos,
                    applyScaleTransform: true,
                    useCssVariables: true, // when window will resize then instead of re-rendering this element component with the latest scaleFactor for all the applied annotations
                    // the scale data (x, y) that is stored in css variables (--scale-x, --scale-y) will be used to drectly apply the transformation
                }),
                willChange: "transform"
            }}
        >
            Element
        </div>
    );
}

export default memo(Element);