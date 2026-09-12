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
    const toScale = !!imgSrc; // we are not doing scaling when the backgound is not an image

    const [bgBaseDimn, setBgBaseDimn] = useState<Dimensions | null>(null);
    const scaleFactorRef = useRef<ScaleFactors>({ x: 1, y: 1 });

    const updateBaseDimensions = useCallback((el: HTMLElement | null) => {
        if (!el) return;

        let width = 0, height = 0;
        if (el instanceof HTMLImageElement) {
            width = el.naturalWidth;
            height = el.naturalHeight;
        } else {
            const rect = el.getBoundingClientRect();
            width = el.clientWidth || rect.width;
            height = el.clientHeight || rect.height;
        }

        if (width > 0 && height > 0) setBgBaseDimn(prev => prev ?? { width, height });
    }, []);

    useEffect(() => {
        // to handle scale factor when window is resized
        if (!toScale) return;

        const containerElement = bgRef?.current;
        if (!containerElement || !bgBaseDimn) return;

        let rafId: number | null = null;
        function updateScale() {
            if (!containerElement || !bgBaseDimn) return;
            const rect = containerElement.getBoundingClientRect();
            const currentWidth = containerElement.clientWidth || rect.width;
            const currentHeight = containerElement.clientHeight || rect.height;

            if (currentWidth === 0 || currentHeight === 0) return;

            scaleFactorRef.current = { x: currentWidth / bgBaseDimn.width, y: currentHeight / bgBaseDimn.height };

            // storing the scale factor as var in style tags so that it can be directly applied in css for transform
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    const rootEl = compRootRef.current;
                    if (rootEl) {
                        rootEl.style.setProperty('--scale-x', `${scaleFactorRef.current?.x}`);
                        rootEl.style.setProperty('--scale-y', `${scaleFactorRef.current?.y}`);
                        const toolbarHeight = (rootEl.firstElementChild?.clientHeight || 0) + 2;

                        rootEl.style.maxHeight = `${bgBaseDimn.height * scaleFactorRef.current?.y + toolbarHeight}px`;
                    }
                })
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
        }
    }, [bgBaseDimn, toScale]);


    return { toScale, bgBaseDimn, scaleFactorRef, updateBaseDimensions };
}