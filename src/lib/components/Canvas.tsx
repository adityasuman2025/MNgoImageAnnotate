import React, { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { AREA_ID, ANNOTATION_COMP_ID, PENCIL_TOOL } from "../constants";

const LINE_WIDTH = 3;

function oldCanvasDataRenderer(fig: { [key: string]: any }, canvasCtx: any, ratio: number) {
    try {
        //function to render canvasData(from old assessed portal) in our canvas
        if (fig.ty && fig.pts) {
            if (fig.ty === 'path') {
                canvasCtx.beginPath();
                canvasCtx.moveTo(multiplyVal(fig.pts[0][0]), multiplyVal(fig.pts[0][1]));
                for (const j in fig.pts) {
                    canvasCtx.lineTo(multiplyVal(fig.pts[j][0]), multiplyVal((fig.pts[j][1])));
                    canvasCtx.stroke();
                }
                canvasCtx.closePath();
            } else if (fig.ty === 'ellipse') {
                drawOval(multiplyVal(fig.pts[1][0]), multiplyVal(fig.pts[1][1]), multiplyVal(fig.pts[0][0]), multiplyVal(fig.pts[0][1]), canvasCtx);
            } else if (fig.ty === 'star') {
                const dist = Math.sqrt((multiplyVal(fig.pts[0][0]) - multiplyVal(fig.pts[1][0])) * (multiplyVal(fig.pts[0][0]) - multiplyVal(fig.pts[1][0])) + (multiplyVal(fig.pts[0][1]) - multiplyVal(fig.pts[1][1])) * (multiplyVal(fig.pts[0][1]) - multiplyVal(fig.pts[1][1])));
                drawStar(multiplyVal(fig.pts[0][0]), multiplyVal(fig.pts[0][1]), 5, dist, canvasCtx);
            } else if (fig.ty === 'text') {
                canvasCtx.beginPath();
                canvasCtx.font = `${fig.fontSize}px Roboto, Helvetica, Arial, sans-serif`;
                canvasCtx.fillStyle = '#FF0000';
                canvasCtx.textBaseline = 'top';
                canvasCtx.fillText(fig.text, multiplyVal(fig.pts[0][0]), multiplyVal(fig.pts[0][1]));
                canvasCtx.closePath();
            } else if (fig.ty === 'LAA') {
                refreshLinesAndAngles(fig, 'impose', canvasCtx);
            } else if (fig.ty === 'questionMark') {
                drawQuestionMark(canvasCtx, multiplyVal(fig.pts[0][0]), multiplyVal(fig.pts[0][1]), 15);
            }
        }

        function multiplyVal(val: number) {
            return val * (ratio || 1);
        }

        function drawStar(cx: number, cy: number, spikes: number, outerRadius: number, ctx: any) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;
            const innerRadius = (outerRadius * 2) / 5;

            ctx.strokeSyle = '#000';
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.28)';
            ctx.fill();
        }

        function drawOval(x: number, y: number, startX: number, startY: number, ctx: any) {
            ctx.beginPath();
            ctx.ellipse(startX + (x - startX) / 2, startY + (y - startY) / 2, Math.abs(x - startX) / 2, Math.abs(y - startY) / 2, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }

        function drawQuestionMark(ctx: any, cx: number, cy: number, radius: number, thickness: number = LINE_WIDTH) {
            ctx.beginPath();
            if (thickness) ctx.lineWidth = thickness;

            ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
            ctx.arc(cx + radius / 2, cy, radius / 2, 0, Math.PI / 5, false);
            ctx.lineTo(cx + radius * 0.2, cy + radius * 0.97);
            ctx.arc(cx + 0.5 * radius, cy + radius * 1.4, radius / 2, Math.PI + 0.7, Math.PI, true);
            ctx.lineTo(cx, cy + 1.7 * radius);
            ctx.moveTo(cx, cy + 1.9 * radius);
            ctx.lineTo(cx, cy + 1.9 * radius + ctx.lineWidth);
            ctx.stroke();
        }

        function refreshLinesAndAngles(fig: { [key: string]: any }, type: string, canvasCtx: any) {
            let canvasIndex = fig.index, fontSize = Math.round(30 / 2.2);
            if (type === 'focus') {
                fig.nodes.forEach((eachNode: any) => {
                    canvasCtx.beginPath();
                    canvasCtx.arc(eachNode.coords[0], eachNode.coords[1], 10, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = '#000000';
                    canvasCtx.fill();
                    canvasCtx.closePath();
                    canvasCtx.beginPath();
                    canvasCtx.arc(eachNode.coords[0], eachNode.coords[1], 4, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = 'red';
                    canvasCtx.fill();
                    canvasCtx.closePath();
                });
            }
            fig.lines.forEach((eachLine: any) => {
                canvasCtx.beginPath();
                canvasCtx.moveTo(fig.nodes[eachLine.pts[0]].coords[0], fig.nodes[eachLine.pts[0]].coords[1]);
                canvasCtx.lineTo(fig.nodes[eachLine.pts[1]].coords[0], fig.nodes[eachLine.pts[1]].coords[1]);
                canvasCtx.stroke();
                canvasCtx.closePath();
                canvasCtx.beginPath();
                canvasCtx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
                canvasCtx.fillStyle = '#FF0000';
                canvasCtx.fillText(`${eachLine.length} cm`, fig.nodes[eachLine.pts[0]].coords[0] + ((fig.nodes[eachLine.pts[1]].coords[0] - fig.nodes[eachLine.pts[0]].coords[0]) / 2) - 20, fig.nodes[eachLine.pts[0]].coords[1] + ((fig.nodes[eachLine.pts[1]].coords[1] - fig.nodes[eachLine.pts[0]].coords[1]) / 2) - 20);
                canvasCtx.closePath();
            });
            fig.nodes.forEach((node: any, index: number) => {
                if (node.lines === 2) {
                    fig.angles.forEach((angleData: any) => {
                        if (angleData.indexPt === index) {
                            //@ts-ignore
                            const angleText = `(${angleData.angle}, ${parseFloat(Math.round((360 - angleData.angle) * 100) / 100)})`;
                            canvasCtx.beginPath();
                            canvasCtx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
                            canvasCtx.fillStyle = '#FF0000';
                            canvasCtx.fillText(angleText, node.coords[0] - 20, node.coords[1] - 20);
                            canvasCtx.closePath();
                        }
                    });
                }
            });
        }
    } catch { }
}

interface CanvasPropsType {
    compIdx?: number,
    imageDimRatio?: { [key: string]: any }
    isDrawable?: boolean,
    width?: number,
    height?: number,
    annot?: any[],
    setAnnot: Dispatch<SetStateAction<{ [key: string]: any }[]>>
}
export default function Canvas({
    compIdx = 0,
    imageDimRatio = {},
    isDrawable = false,
    width = 0,
    height = 0,
    annot = [],
    setAnnot
}: CanvasPropsType) {
    const canvasRef = useRef<any>(null), ctxRef = useRef<any>(null);
    const [drawing, setDrawing] = useState<[number, number][]>([]);

    useEffect(() => {
        if (width && height) renderCanvas(height);
    }, [width, height]);

    useEffect(() => {
        renderAnnotsInCanvas(annot); //reresh canvas images when new annotation is added
    }, [annot.length]);

    function getMousePosOnTouch(event: any) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID + compIdx) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID + compIdx) || {};

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
        ctx.lineWidth = LINE_WIDTH;
        ctxRef.current = ctx;

        renderAnnotsInCanvas(annot); // loading older image/canvas data in canvas
    }

    function renderAnnotsInCanvas(annot: { [key: string]: any }[]) {
        if (!ctxRef.current || !canvasRef.current) return;

        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //clearing old canvas data/annots

        for (let i = 0; i < annot.length; i++) {
            const { type, pts } = annot[i] || {};

            if (type === PENCIL_TOOL) {
                ctxRef.current.beginPath();
                ctxRef.current.moveTo(pts[0][0], pts[0][1]);
                for (const j in pts) {
                    ctxRef.current.lineTo(pts[j][0], pts[j][1]);
                    ctxRef.current.stroke();
                }
                ctxRef.current.closePath();
            }
            oldCanvasDataRenderer(annot[i], ctxRef.current, imageDimRatio?.width); //if any annot item is old CanvasData then it will be rendered in canvas 
        }
    }

    function startDraw(e: any) {
        const { offsetX, offsetY } = (e.type === "touchstart" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        setDrawing(prev => ([...prev, [offsetX, offsetY]]));
    }

    function draw(e: any) {
        if (e.type !== "touchmove" && !(drawing.length)) return;
        const { offsetX, offsetY } = (e.type === "touchmove" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();

        setDrawing(prev => ([...prev, [offsetX, offsetY]]));
    }

    function stopDraw() {
        ctxRef.current.closePath();

        setAnnot(prev => ([...prev, { pts: drawing, type: PENCIL_TOOL }]));
        setDrawing([]); //resetting drawing
    }

    return (
        <canvas
            className="sa-z-10"
            id="canvasEle" ref={canvasRef}
            onMouseDown={(e) => { isDrawable ? startDraw(e) : null }}
            onMouseUp={() => { isDrawable ? stopDraw() : null }}
            onMouseMove={(e) => { isDrawable ? draw(e) : null }}
        />
    )
}
