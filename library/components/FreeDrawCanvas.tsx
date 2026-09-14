import { memo, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import globalStore from "../store";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import { useScaleFactor } from "../context/ScaleFactorContext";
import { DEFAULT_TOOL_NAMES, PENCIL_LINE_WIDTH, PENCIL_STROKE_COLOR } from "../constants";
import useUnmountCleanup from "../hooks/useUnmountCleanup";
import { createGestureCleanup } from "../utils/gesture";
import { createAnnotationElement } from "../utils/store";
import { clampToBoundary } from "../utils/boundary";
import type { FreeDrawPoints } from "../types";

function FreeDrawCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const currentStrokeRef = useRef<FreeDrawPoints[]>([]);  // Active in-progress stroke points in base unscaled coordinates

    const { readonly, bgRef, bgBaseDimnRef, bgCurrDimnRef } = useGlobalStaticData();
    const { scaleFactorRef } = useScaleFactor();
    const cleanupDrawRef = useUnmountCleanup();

    const activeToolName = useSyncExternalStore(globalStore.subscribeToActiveToolName, globalStore.getActiveToolName);
    const annotationData = useSyncExternalStore(globalStore.subscribeToAnnotationData, globalStore.getAnnotationData);
    const isPencilActive = !readonly && activeToolName === DEFAULT_TOOL_NAMES.PENCIL;

    // Draw all pencil strokes onto the canvas
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const currBgDimn = bgCurrDimnRef.current;
        if (!currBgDimn || currBgDimn.width === 0 || currBgDimn.height === 0) return;

        const { width: currBgWidth, height: currBgHeight } = currBgDimn;

        const dpr = window.devicePixelRatio || 1;
        const targetPixelWidth = Math.round(currBgWidth * dpr);
        const targetPixelHeight = Math.round(currBgHeight * dpr);

        if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
            canvas.width = targetPixelWidth;
            canvas.height = targetPixelHeight;
        }

        // Keep CSS dimensions in sync with client dimensions to prevent canvas distortion
        canvas.style.width = `${currBgWidth}px`;
        canvas.style.height = `${currBgHeight}px`;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, currBgWidth, currBgHeight);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = PENCIL_STROKE_COLOR;
        ctx.lineWidth = PENCIL_LINE_WIDTH;

        const scaleX = scaleFactorRef.current.x || 1;
        const scaleY = scaleFactorRef.current.y || 1;

        // Helper to draw a smooth polyline using midpoint quadratic curves
        const drawPoints = (points: FreeDrawPoints[]) => {
            if (!points || points.length === 0) return;

            if (points.length === 1) {
                ctx.beginPath();
                ctx.arc(points[0][0] * scaleX, points[0][1] * scaleY, PENCIL_LINE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fillStyle = PENCIL_STROKE_COLOR;
                ctx.fill();
                return;
            }

            ctx.beginPath();
            ctx.moveTo(points[0][0] * scaleX, points[0][1] * scaleY);

            for (let i = 1; i < points.length - 1; i++) {
                const currX = points[i][0] * scaleX;
                const currY = points[i][1] * scaleY;
                const nextX = points[i + 1][0] * scaleX;
                const nextY = points[i + 1][1] * scaleY;

                const midX = (currX + nextX) / 2;
                const midY = (currY + nextY) / 2;

                ctx.quadraticCurveTo(currX, currY, midX, midY);
            }

            const lastPoint = points[points.length - 1];
            ctx.lineTo(lastPoint[0] * scaleX, lastPoint[1] * scaleY);
            ctx.stroke();
        };

        // 1. Render all committed pencil strokes from global store
        const annotations = annotationData?.annotations || {};
        const annotationIds = annotationData?.annotationIds || [];

        annotationIds.forEach(id => {
            const annotation = annotations[id];
            if (annotation?.name === DEFAULT_TOOL_NAMES.PENCIL && annotation.points) {
                drawPoints(annotation.points);
            }
        });

        // 2. Render active in-progress stroke
        if (currentStrokeRef.current.length > 1) {
            drawPoints(currentStrokeRef.current);
        }

        ctx.restore();
    }, [annotationData]);

    // Redraw on store updates or when scale/resize happens
    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    // Track size changes via ResizeObserver on the background element & window resize
    useEffect(() => {
        const bgEl = bgRef.current;
        let rafId: number | null = null;

        const handleResize = () => {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    redrawCanvas();
                });
            }
        };

        let resizeObserver: ResizeObserver | null = null;
        if (bgEl) {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(bgEl);
        }

        window.addEventListener("resize", handleResize);

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            resizeObserver?.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [redrawCanvas]);

    // Get unscaled base coordinate from pointer event
    const getPointFromEvent = (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent): FreeDrawPoints | null => {
        const bgEl = bgRef.current;
        if (!bgEl) return null;

        const rect = bgEl.getBoundingClientRect();
        const scaleX = scaleFactorRef.current.x || 1;
        const scaleY = scaleFactorRef.current.y || 1;

        const x = (e.clientX - rect.left) / scaleX;
        const y = (e.clientY - rect.top) / scaleY;

        const clamped = clampToBoundary({ targetPos: { x, y }, bgBaseDimn: bgBaseDimnRef.current });

        return [Math.round(clamped.x), Math.round(clamped.y)];
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isPencilActive) return;
        e.stopPropagation();

        cleanupDrawRef.current?.();

        const startPoint = getPointFromEvent(e);
        if (!startPoint) return;

        currentStrokeRef.current = [startPoint];
        redrawCanvas();

        let rafId: number | null = null;

        function onPointerMove(moveEvent: PointerEvent) {
            const point = getPointFromEvent(moveEvent);
            if (!point) return;

            currentStrokeRef.current.push(point);

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    redrawCanvas();
                });
            }
        }

        function onPointerUp() {
            cleanup();

            const points = currentStrokeRef.current;
            currentStrokeRef.current = [];

            // Commit stroke only if at least 2 points were drawn
            if (points.length >= 2) {
                const annotation = createAnnotationElement(
                    {
                        name: DEFAULT_TOOL_NAMES.PENCIL,
                        points,
                    },
                    DEFAULT_TOOL_NAMES.PENCIL
                );

                globalStore.updateAnnotationById(annotation.id, annotation);
            } else {
                redrawCanvas();
            }
        }

        const cleanup = createGestureCleanup({
            getRafId: () => rafId,
            clearRafId: () => { rafId = null; },
            onPointerMove,
            onPointerUp,
            cleanupRef: cleanupDrawRef,
        });

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    };

    return (
        <canvas
            ref={canvasRef}
            data-free-draw-canvas
            onPointerDown={isPencilActive ? handlePointerDown : undefined}
            className={`w-full h-full absolute inset-0 select-none ${isPencilActive ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"}`}
        />
    );
}

export default memo(FreeDrawCanvas);
