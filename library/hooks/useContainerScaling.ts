import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import type { Dimensions, ScaleFactors } from "../types";

interface UseContainerScalingOptions {
    bgRef: RefObject<HTMLElement | null>;
    compRootRef: RefObject<HTMLElement | null>;
    imgSrc?: string;
}
export default function useContainerScaling({
    bgRef,
    compRootRef,
    imgSrc,
}: UseContainerScalingOptions) {
    const toScale = !!imgSrc;
    const [bgBaseDimn, setBgBaseDimn] = useState<Dimensions | null>(null);
    const scaleFactorRef = useRef<ScaleFactors>({ x: 1, y: 1 });

    useEffect(() => {
        setBgBaseDimn(null);
    }, [imgSrc]); // reset base dimensions whenever the image source changes

    const updateBaseDimensions = useCallback((dimn: Dimensions) => {
        setBgBaseDimn(dimn);
    }, []);

    useEffect(() => {
        const rootEl = compRootRef?.current;

        function resetScaleStyles() {
            if (rootEl) {
                rootEl.style.removeProperty("max-height");
                rootEl.style.removeProperty("--scale-x");
                rootEl.style.removeProperty("--scale-y");
            }
            scaleFactorRef.current = { x: 1, y: 1 };
        }

        if (!toScale || !bgBaseDimn) return resetScaleStyles();

        const containerElement = bgRef?.current;
        if (!containerElement || !rootEl) return;

        let rafId: number | null = null;
        function updateScale() {
            const currentWidth = containerElement.clientWidth;
            const currentHeight = containerElement.clientHeight;
            if (!currentWidth || !currentHeight) return;


            // Synchronously update ref so coordinate lookups are never lagging
            scaleFactorRef.current = { x: currentWidth / bgBaseDimn.width, y: currentHeight / bgBaseDimn.height };

            // storing the scale factor as var in style tags so that it can be directly applied in css for transform
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    rootEl.style.setProperty('--scale-x', `${scaleFactorRef.current.x}`);
                    rootEl.style.setProperty('--scale-y', `${scaleFactorRef.current.y}`);
                    const toolbarHeight = (rootEl.firstElementChild?.clientHeight || 0) + 2;

                    rootEl.style.maxHeight = `${bgBaseDimn.height * scaleFactorRef.current.y + toolbarHeight}px`;
                });
            }
        }

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerElement);
        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            resizeObserver.disconnect();

            resetScaleStyles();
        }
    }, [bgBaseDimn, toScale]);


    return { toScale, bgBaseDimn, scaleFactorRef, updateBaseDimensions };
}