import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import type { Dimensions, ScaleFactors } from "../utils/transform";

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
        const el = bgRef.current;
        if (!el) return;

        if (el instanceof HTMLImageElement && !el.complete) {
            const handleLoad = () => updateBaseDimensions(el);

            el.addEventListener("load", handleLoad, { once: true });
            return () => el.removeEventListener("load", handleLoad);
        } else updateBaseDimensions(el);
    }, [imgSrc, bgRef, updateBaseDimensions]);

    useEffect(() => {
        if (!toScale) return;

        const containerElement = bgRef?.current;
        if (!containerElement || !bgBaseDimn) return;

        function updateScale() {
            if (!containerElement || !bgBaseDimn) return;
            const rect = containerElement.getBoundingClientRect();
            const currentWidth = containerElement.clientWidth || rect.width;
            const currentHeight = containerElement.clientHeight || rect.height;

            if (currentWidth === 0 || currentHeight === 0) return;

            const newScaleFactor: ScaleFactors = { x: currentWidth / bgBaseDimn.width, y: currentHeight / bgBaseDimn.height };
            scaleFactorRef.current = newScaleFactor;

            // storing the scale factor as var in style tags so that it can be directly applied in css for transform
            const rootEl = compRootRef.current;
            if (rootEl) {
                rootEl.style.setProperty('--scale-x', `${newScaleFactor.x}`);
                rootEl.style.setProperty('--scale-y', `${newScaleFactor.y}`);
                const toolbarHeight = rootEl.firstElementChild?.clientHeight || 0;
                rootEl.style.maxHeight = `${bgBaseDimn.height * newScaleFactor.y + toolbarHeight}px`;
            }
        }

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerElement);
        return () => resizeObserver.disconnect();
    }, [bgRef, compRootRef, bgBaseDimn, toScale]);

    return { toScale, bgBaseDimn, scaleFactorRef, updateBaseDimensions };
}