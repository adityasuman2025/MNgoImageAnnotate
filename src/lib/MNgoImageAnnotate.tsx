import React, { useEffect, useState, CSSProperties, ReactElement } from "react";
import { AnnotationButtons, AnnotationItem, Canvas } from "./components";
import { MIN_HEIGHT, DEFAULT_WIDTH, AREA_ID, ANNOTATION_COMP_ID, PENCIL, UNDO } from "./constants";
import './MNgoImageAnnotate.css';

interface MNgoImageAnnotateTypes {
    image?: string,
    width?: number,
    loader?: string | ReactElement,
    error?: string | ReactElement,
    shapes?: { [key: string]: string },
    beforeTools?: string | ReactElement,
    afterTools?: string | ReactElement,
    annotations?: any[],
    onChange?: (data: { [key: string]: any }) => void
}
/* eslint-disable react-hooks/exhaustive-deps */
export default function MNgoImageAnnotate({
    image = "",
    width = DEFAULT_WIDTH,
    loader = "loading",
    error = "something went wrong",
    shapes = {},
    beforeTools = "",
    afterTools = "",
    annotations = [],
    onChange,
}: MNgoImageAnnotateTypes) {
    const [height, setHeight] = useState<number>(10); //height 10 is loading, 400 is error

    const [isCanvasRendered, setIsCanvasRendered] = useState<boolean>(false);
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
            setIsCanvasRendered(true);
        }
        imgEle.onerror = function () { setHeight(-400) }
    }, []);

    useEffect(() => {
        if (height > 10 && onChange) onChange({ annotations: annot, width });
    }, [annot]);

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

    function handleUndoClick(undoAll: boolean) {
        let updatedAnnot: any[] = annot.slice(0, -1)
        if (undoAll === true) updatedAnnot = [];

        setAnnot(updatedAnnot);
        setSelectedToolBarBtn(UNDO + new Date().getTime()); // disabling any selected tool bar btn
    }

    return (
        <div id={ANNOTATION_COMP_ID}>
            <AnnotationButtons
                height={height}
                beforeTools={beforeTools}
                afterTools={afterTools}
                shapes={shapes}
                selectedToolBarBtn={selectedToolBarBtn}
                setSelectedToolBarBtn={setSelectedToolBarBtn}
                onUndoClick={handleUndoClick}
            />

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
                {
                    !isCanvasRendered ? null :
                        <Canvas
                            isDrawable={selectedToolBarBtn === PENCIL}
                            width={width}
                            height={height}
                            selectedToolBarBtn={selectedToolBarBtn}
                            drawings={annot}
                            setDrawings={setAnnot}
                        />
                }

                {
                    annot.map((item, idx: number) => item.type === PENCIL ? null :
                        <AnnotationItem
                            key={idx}
                            isSelected={idx === selectedAnnot}
                            idx={idx}
                            item={item}
                            annotationImg={shapes[item.type]}
                            setAnnot={setAnnot}
                            onClick={(idx) => { setSelectedAnnot(idx) }}
                            onDeleteClick={(idx) => { setAnnot(annot.filter((_, i) => i !== idx)) }}
                        />
                    )
                }
            </div>
        </div>
    );
}
