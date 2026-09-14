import { useRef, useEffect, useCallback, type RefObject } from "react";
import type { Dimensions, ScaleFactors } from "../types";

const MIN_HEIGHT = 300;

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

    const bgBaseDimnRef = useRef<Dimensions | null>(null); // original dimension (height, width) of the background image
    const bgCurrDimnRef = useRef<Dimensions | null>(null); // current (rendered) dimensions (width, height) of the background element
    const scaleFactorRef = useRef<ScaleFactors>({ x: 1, y: 1 });

    useEffect(() => {
        bgBaseDimnRef.current = null;
    }, [imgSrc]); // reset base dimensions whenever the image source changes

    const updateScale = useCallback(() => {
        const compRootEl = compRootRef?.current;
        const bgEle = bgRef?.current;
        const baseDimn = bgBaseDimnRef.current;

        if (!toScale) {
            const parentHeight = Math.max(MIN_HEIGHT, compRootEl?.parentElement?.clientHeight || 0);

            if (compRootEl) {
                compRootEl.style.height = `${parentHeight}px`;
                compRootEl.style.removeProperty("--scale-x");
                compRootEl.style.removeProperty("--scale-y");
            }
            if (bgEle) {
                const toolbarHeight = (compRootEl?.firstElementChild?.clientHeight || 0) + 2;
                bgEle.style.height = `${Math.max(0, parentHeight - toolbarHeight)}px`;
                const dimn = { width: bgEle.clientWidth, height: bgEle.clientHeight };

                bgCurrDimnRef.current = dimn;
                bgBaseDimnRef.current = dimn;
            }
            scaleFactorRef.current = { x: 1, y: 1 };
            return;
        }

        if (!baseDimn || !bgEle || !compRootEl) {
            bgCurrDimnRef.current = null;
            scaleFactorRef.current = { x: 1, y: 1 };
            return;
        }

        const bgCurrWidth = bgEle.clientWidth, bgCurrHeight = bgEle.clientHeight;
        if (!bgCurrWidth || !bgCurrHeight) return;

        bgCurrDimnRef.current = { width: bgCurrWidth, height: bgCurrHeight };
        scaleFactorRef.current = { x: bgCurrWidth / baseDimn.width, y: bgCurrHeight / baseDimn.height };

        compRootEl.style.setProperty('--scale-x', `${scaleFactorRef.current.x}`);
        compRootEl.style.setProperty('--scale-y', `${scaleFactorRef.current.y}`);
        const toolbarHeight = (compRootEl.firstElementChild?.clientHeight || 0) + 2;
        compRootEl.style.height = `${bgCurrHeight + toolbarHeight}px`;
    }, [toScale]);

    const updateBgBaseDimn = useCallback((dimn: Dimensions) => {
        const prev = bgBaseDimnRef.current;
        if (prev?.width === dimn.width && prev?.height === dimn.height) return;

        bgBaseDimnRef.current = dimn;
        updateScale();
    }, [updateScale]);

    useEffect(() => {
        updateScale();

        const bgEle = bgRef?.current;
        if (!bgEle) return;

        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(bgEle);
        return () => resizeObserver.disconnect();
    }, [toScale, updateScale]);

    return { toScale, bgBaseDimnRef, bgCurrDimnRef, scaleFactorRef, updateBgBaseDimn };
}