import React, { useEffect, useState, useRef } from "react";
import { AREA_ID, ANNOTATION_COMP_ID, PENCIL, UNDO } from "../constants";

interface CanvasTypes {
    isDrawable?: boolean,
    width?: number,
    height?: number,
    selectedToolBarBtn?: string,
    drawings?: any[],
    setDrawings: (drawings: any[]) => void
}
/* eslint-disable react-hooks/exhaustive-deps */
export default function Canvas({
    isDrawable = false,
    width = 0,
    height = 0,
    selectedToolBarBtn = "",
    drawings = [],
    setDrawings
}: CanvasTypes) {
    const canvasRef = useRef<any>(null), ctxRef = useRef<any>(null);
    const [isDrawingInCanvas, setIsDrawingInCanvas] = useState<boolean>(false);

    useEffect(() => {
        if (width && height) renderCanvas(height);
    }, [width, height]);

    useEffect(() => {
        if (selectedToolBarBtn.includes(UNDO)) renderImagesInCanvas(drawings); //if any canvas image is undoed then it will be removed
    }, [selectedToolBarBtn]);

    function getMousePosOnTouch(event: any) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID) || {};

        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;
        const offsetX = clientX + scrollLeft - areaOffsetLeft;
        const offsetY = clientY + scrollTop - areaOffsetTop;

        return { offsetX, offsetY };
    }

    function renderCanvas(height: number) {
        //ref: https://blog.openreplay.com/2d-sketches-with-react-and-the-canvas-api
        const canvas: any = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        const ctx: any = canvas.getContext('2d'); // Setting the context to enable draw
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 8;
        ctxRef.current = ctx;

        renderImagesInCanvas(drawings); // loading older image/canvas data in canvas
    }

    function renderImagesInCanvas(annot: { [key: string]: any }[]) {
        if (!ctxRef.current || !canvasRef.current) return;

        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //clearing old image/canvas data

        for (let i = 0; i < annot.length; i++) {
            let { type, src }: { [key: string]: any } = annot[i] || {};

            if (type === PENCIL) {
                let imgEle: any = new Image();
                imgEle.src = src;
                imgEle.onload = function () { ctxRef.current.drawImage(imgEle, 0, 0) };
            }
        }
    }

    function startDraw(e: any) {
        const { offsetX, offsetY } = (e.type === "touchstart" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        setIsDrawingInCanvas(true);
    }

    function draw(e: any) {
        if (e.type !== "touchmove" && !isDrawingInCanvas) return;
        const { offsetX, offsetY } = (e.type === "touchmove" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    }

    function stopDraw() {
        ctxRef.current.closePath();
        setIsDrawingInCanvas(false);

        const imgData: string = canvasRef.current.toDataURL("image/png"); // converting the drawing into image and storing in annot state
        // const imgData = ctx.getImageData(0, 0, imgDim.width, imgDim.height);

        setDrawings([...drawings, { src: imgData, type: PENCIL }]);
    }

    return (
        <canvas
            id="canvasEle" ref={canvasRef}
            onMouseDown={(e) => { if (isDrawable) startDraw(e) }}
            onMouseUp={() => { if (isDrawable) stopDraw() }}
            onMouseMove={(e) => { if (isDrawable) draw(e) }}
        />
    )
}
