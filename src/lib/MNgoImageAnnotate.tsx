import React, { useEffect, useState, useRef, CSSProperties } from "react";
import { ResizeProvider, ResizeConsumer } from "react-resize-context"; //ref: https://codesandbox.io/embed/jjjmp4z6yy
import './MNgoImageAnnotate.css';

//@ts-ignore
import deleteImg from "./img/delete.png";
//@ts-ignore
import rotateImg from "./img/rotate.png";

function myDebounce<Params extends any[]>(functionToRun: (...args: Params) => any, delay: number): (...args: Params) => void {
    let timer: NodeJS.Timeout;
    return (...args: Params) => {
        clearTimeout(timer)
        timer = setTimeout(() => { functionToRun(...args) }, delay)
    }
}

const MIN_HEIGHT: number = 100, DEFAULT_WIDTH: number = 900;
const AREA_ID: string = "area", ANNOTATION_COMP_ID: string = "annotationComp";
const PENCIL: string = "pencil";

function MNgoImageAnnotate({
    image = "",
    width = DEFAULT_WIDTH,
    loader = "loading",
    error = "something went wrong",
    shapes = {},
    beforeTools = "",
    afterTools = "",
    annotations = [],
    onChange,
}: { [key: string]: any }) {
    const [height, setHeight] = useState<number>(10); //height 10 is loading, 400 is error

    const canvasRef = useRef<any>(null);
    const ctxRef = useRef<any>(null);
    const [isDrawingInCanvas, setIsDrawingInCanvas] = useState<boolean>(false);

    const [selectedToolBarBtn, setSelectedToolBarBtn] = useState<string>("");
    const [mousePos, setMousePos] = useState<{ [key: string]: any }>({ x: 0, y: 0 });

    const [annot, setAnnot] = useState<{ [key: string]: any }[]>([]);
    const [selectedAnnot, setSelectedAnnot] = useState<number | string>("");

    useEffect(() => {
        const imgEle: any = document.createElement("img");
        imgEle.src = image;
        imgEle.onload = function () {
            const calcHeight = (width / imgEle.width * imgEle.height) || -400;
            setHeight(calcHeight);

            setAnnot(annotations || []);
            renderCanvas(calcHeight, annotations);
            // addTouchSupportToCanvas();
        }
        imgEle.onerror = function () {
            setHeight(-400);
        }
    }, []);

    useEffect(() => {
        if (height > 10 && onChange) onChange({ annotations: annot, width });
    }, [annot]);


    /* ---- touch support for canvas stuffs ---- */
    // useEffect(() => {
    //     localStorage.setItem("selectedToolBarBtn", selectedToolBarBtn);
    // }, [selectedToolBarBtn])

    function addTouchSupportToCanvas() {
        /*
        selectedToolBarBtn is stored and retrived from localStorage because here
        we had to use 3rd argument of addEventListener i.e. { passive: false } and e.preventDefault() to prevent scrolling on touch swipe
        event handlers get atteched to them when this comp loaded and at that time selectedToolBarBtn is empty 
        so selectedToolBarBtn remains empty for the event handler functions, even after clicking on any tool bar buttons because handler were loaded when the comp was loaded and not updated on updation of selectedToolBarBtn
        therefore I need to go with localStorage solution to retrive current state of selectedToolBarBtn in event handlers

        issues we got now
        1. need to store and retrive isDrawingInCanvas and annot too from localStorage because those are also useState which are not binded with our addEventListener event handlers, when they get updated
        */

        const canvas: any = canvasRef.current;
        canvas.addEventListener('touchstart', (e: any) => {
            const activeToolBarBtn = localStorage.getItem("selectedToolBarBtn");

            if (activeToolBarBtn === PENCIL) {
                e.preventDefault(); // to prevent scolling on touch swipe
                startDraw(e);
            }
        }, { passive: false });
        canvas.addEventListener('touchmove', (e: any) => {
            const activeToolBarBtn = localStorage.getItem("selectedToolBarBtn");

            if (activeToolBarBtn === PENCIL) {
                e.preventDefault(); // to prevent scolling on touch swipe
                draw(e);
            }
        }, { passive: false });
        canvas.addEventListener('touchend', (e: any) => {
            const activeToolBarBtn = localStorage.getItem("selectedToolBarBtn");

            if (activeToolBarBtn === PENCIL) {
                e.preventDefault(); // to prevent scolling on touch swipe
                stopDraw();
            }
        }, { passive: false });
    }

    function getMousePosOnTouch(event: any) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID) || {};

        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;
        const offsetX = clientX + scrollLeft - areaOffsetLeft;
        const offsetY = clientY + scrollTop - areaOffsetTop;

        return { offsetX, offsetY };
    }
    /* ---- touch support for canvas stuffs ---- */


    /* ---- canvas stuffs ---- */
    function renderCanvas(height: number, annot: { [key: string]: any }[]) {
        //ref: https://blog.openreplay.com/2d-sketches-with-react-and-the-canvas-api
        const canvas: any = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        // Setting the context to enable draw
        const ctx: any = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 8;
        ctxRef.current = ctx;

        // loading older image/canvas data in canvas
        renderImagesInCanvas(annot);
    }

    function renderImagesInCanvas(annot: { [key: string]: any }[]) {
        if (!ctxRef.current || !canvasRef.current) return;

        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //clearing old image/canvas data

        for (let i = 0; i < annot.length; i++) {
            let { type, src }: { [key: string]: any } = annot[i] || {};

            if (type === PENCIL) {
                let imgEle: any = new Image();
                imgEle.src = src;
                imgEle.onload = function () {
                    ctxRef.current.drawImage(imgEle, 0, 0);
                };
            }
        }
    }

    function startDraw(e: any) {
        const { offsetX, offsetY } = (e.type === "touchstart" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        setIsDrawingInCanvas(true);
    }

    function stopDraw() {
        ctxRef.current.closePath();
        setIsDrawingInCanvas(false);

        // converting the drawing into image and storing in annot state
        const canvas: any = canvasRef.current;
        const imgData: string = canvas.toDataURL("image/png");
        // const imgData = ctx.getImageData(0, 0, imgDim.width, imgDim.height);

        setAnnot([...annot, { src: imgData, type: PENCIL }]);
    }

    function draw(e: any) {
        if (e.type !== "touchmove" && !isDrawingInCanvas) return;
        const { offsetX, offsetY } = (e.type === "touchmove" ? getMousePosOnTouch(e) : e.nativeEvent) || {};
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    }
    /* ---- canvas stuffs ---- */


    /* ---- annotations stuffs ---- */
    function handleBtnClick(type: string) {
        setSelectedToolBarBtn(type);
    }

    function handleAreaMouseMove({ nativeEvent = {} }: { [key: string]: any } = {}) {
        setMousePos({ x: nativeEvent.offsetX, y: nativeEvent.offsetY });
    }

    function handleAreaClick() {
        if (selectedToolBarBtn === PENCIL) return;

        if (selectedToolBarBtn) setAnnot([...annot, {
            type: selectedToolBarBtn,
            pos: { x: mousePos.x, y: mousePos.y },
            size: { height: 50, width: 50 }
        }]);
    }

    function handleAnnotClick(e: any, idx: number) {
        e.stopPropagation();

        setSelectedAnnot(idx);
    }

    function handleAnnotDeleteClick(idx: number) {
        setSelectedAnnot("");
        setAnnot(annot.filter((_, i) => i !== idx));
    }

    function handleAnnotResize(size: { [key: string]: any }, idx: number) {
        setAnnot(annot.map((item, i) => {
            if (i === idx) item.size = size;
            return item;
        }));
    }

    function handleAnnotMoveStart(e: any, idx: number) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID) || {};

        const { width = 0, height = 0 }: { [key: string]: any } = annot[idx].size || {};

        const newX: number = e.pageX + scrollLeft - areaOffsetLeft - width / 2;
        const newY: number = e.pageY + scrollTop - areaOffsetTop - height / 2;
        if (newX >= 0 && newY >= 0) {
            //to-do add limit condition for img top-right, bottom-left and bottom right too
            setAnnot(annot.map((item, i) => {
                if (i === idx) item.pos = { x: newX, y: newY }
                return item;
            }));
        }

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnnotMoveEnd(e: any) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }

    function handleAnnotRotateStart(e: any, idx: number) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID) || {};

        const { x = 0, y = 0 }: { [key: string]: any } = annot[idx].pos || {};
        const { width = 0, height = 0 }: { [key: string]: any } = annot[idx].size || {};

        const centerX: number = x + width / 2, centerY: number = y + height / 2;
        const newX: number = e.pageX + scrollLeft - areaOffsetLeft, newY: number = e.pageY + scrollTop - areaOffsetTop;

        if (e.pageX && e.pageY) {
            const angle: number = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);

            setAnnot(annot.map((item, i) => {
                if (i === idx) item.rotate = angle;
                return item;
            }));
        }

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnnotRotateEnd(e: any) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }
    /* ---- annotations stuffs ---- */


    function handleUndoClick(undoAll: boolean) {
        let updatedAnnot: any[] = annot.slice(0, -1)
        if (undoAll === true) updatedAnnot = [];

        setAnnot(updatedAnnot);
        setSelectedToolBarBtn(""); // disabling any selected tool bar btn

        renderImagesInCanvas(updatedAnnot); //if any canvas image is undoed then it will be removed
    }

    function renderToolBar() {
        return (
            <div id="toolBar" className={height <= 10 ? "disabledToolBar" : ""}>
                {beforeTools}

                {
                    Object.keys(shapes).map((type, idx) => (
                        <div
                            key={type + "_" + idx}
                            className={selectedToolBarBtn === type ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"}
                            onClick={() => handleBtnClick(type)}
                        >
                            <img alt={type} src={shapes[type]} />
                        </div>
                    ))
                }

                <div className={selectedToolBarBtn === PENCIL ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"} onClick={() => handleBtnClick(PENCIL)}>{PENCIL}</div>
                <div className="toolBarBtn" onClick={() => handleUndoClick(false)}>undo</div>
                <div className="toolBarBtn" onClick={() => handleUndoClick(true)}>clear</div>

                {afterTools}
            </div>
        )
    }

    return (
        <div id={ANNOTATION_COMP_ID}>
            {renderToolBar()}

            {height <= 10 ? <div id="loaderOrError">{height === -400 ? error : loader}</div> : null}

            <div
                id={AREA_ID}
                style={{
                    minWidth: width, maxWidth: width, height, minHeight: MIN_HEIGHT,
                    backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
                    backgroundImage: (height > 10 ? `url(${image})` : ""),
                    // cursor: `url(${shapes[selectedToolBarBtn]}), auto`,
                } as CSSProperties}
                onMouseMove={handleAreaMouseMove}
                onClick={handleAreaClick}
                onDragOver={(e) => { e.preventDefault() /* to prevent drag shadow going to old position */ }}
            >
                <canvas
                    id="canvasEle"
                    ref={canvasRef}
                    onMouseDown={(e) => { if (selectedToolBarBtn === PENCIL) startDraw(e) }}
                    onMouseUp={() => { if (selectedToolBarBtn === PENCIL) stopDraw() }}
                    onMouseMove={(e) => { if (selectedToolBarBtn === PENCIL) draw(e) }}
                />

                {
                    //@ts-ignore
                    annot.map(({ pos = {}, size = {}, rotate = 0, type }: { [key: string]: any } = {}, idx: number) => {
                        if (type !== PENCIL)
                            return (
                                <div
                                    className={idx === selectedAnnot ? "annot selectedAnnot" : "annot"}
                                    key={idx}
                                    style={{ top: pos.y, left: pos.x }}
                                    onClick={(e) => handleAnnotClick(e, idx)}
                                >
                                    <div className="annotContent">
                                        <ResizeProvider>
                                            <ResizeConsumer className="annotImg" onSizeChanged={(size) => handleAnnotResize(size, idx)}>
                                                <div
                                                    style={{
                                                        width: size.width, height: size.height,
                                                        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
                                                        backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
                                                        backgroundImage: `url(${shapes[type]})`,
                                                    } as CSSProperties}
                                                    onDrag={(e) => myDebounce(handleAnnotMoveStart, 100)(e, idx)}
                                                    onDragEnd={(e) => myDebounce(handleAnnotMoveEnd, 100)(e)}
                                                    draggable={true}
                                                />
                                            </ResizeConsumer>
                                        </ResizeProvider>

                                        {
                                            idx === selectedAnnot ?
                                                <>
                                                    <img
                                                        className="annotRotateBtn"
                                                        src={rotateImg} alt={"rotateImg"}
                                                        onDrag={(e) => myDebounce(handleAnnotRotateStart, 100)(e, idx)}
                                                        onDragEnd={(e) => myDebounce(handleAnnotRotateEnd, 100)(e)}
                                                    />
                                                    <img
                                                        className="annotDeleteBtn"
                                                        src={deleteImg} alt={"deleteImg"}
                                                        onClick={() => handleAnnotDeleteClick(idx)}
                                                    />
                                                </>
                                                : null
                                        }
                                    </div>
                                </div>
                            )
                    })
                }
            </div>
        </div>
    );
}

export default MNgoImageAnnotate;
