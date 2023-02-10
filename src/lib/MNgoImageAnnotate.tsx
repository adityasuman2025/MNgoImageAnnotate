import React, { useEffect, useState, CSSProperties, ReactElement, useRef } from "react";
import "./index.css";

import { AnnotationButtons, AnnotationItem, Canvas, Modal, Loader } from "./components";
import {
    MIN_HEIGHT, DEFAULT_ANNOT_AREA_WIDTH, FRAME_ID, AREA_ID, ANNOTATION_COMP_ID,
    PENCIL_TOOL, UNDO_TOOL, REDO_TOOL, TEXT_TOOL, FULL_SCREEN_TOOL
} from "./constants";

const CORR_FULL_SCR_MODAL = "corrFullScreenModal";

interface MNgoImageAnnotatePropsType {
    compIdx?: number,
    image?: string,
    loc?: number[],
    width?: number,
    loader?: string | ReactElement,
    error?: string | ReactElement,
    shapes?: { [key: string]: any },
    annotations?: any[],
    onChange?: (data: { [key: string]: any }) => void
}
export default function MNgoImageAnnotate({
    compIdx = 0,
    image = "",
    loc = [], //loc represents co-ordinates of visible portion of the image, i.e. [x1, y1, x2, y2]
    width = DEFAULT_ANNOT_AREA_WIDTH,
    loader = <Loader />,
    error = "Something went wrong",
    shapes = {},
    annotations = [],
    onChange,
}: MNgoImageAnnotatePropsType) {
    const compLoaded = useRef(false);

    const [height, setHeight] = useState<number>(10); //height 10 is loading, 400 is error
    const [imageDimRatio, setImageDimRatio] = useState({ width: 1 });
    const [frameDims, setFrameDims] = useState<{ [key: string]: number }>({ height: 10, top: 0 });

    const [isCanvasRendered, setIsCanvasRendered] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState<{ [key: string]: any }>({ x: 0, y: 0 });
    const [modalData, setModalData] = useState<{ [key: string]: any }>({ isOpen: false, hideTitle: true });
    const [selectedToolBarBtn, setSelectedToolBarBtn] = useState<string>("");
    const [textToolContent, setTextToolContent] = useState<string>("");

    const [annot, setAnnot] = useState<{ [key: string]: any }[]>([]);
    const [undoAnnot, setUndoAnnot] = useState<{ [key: string]: any }[]>([]);
    const [selectedAnnot, setSelectedAnnot] = useState<number | string>("");

    useEffect(() => {
        compLoaded.current = false;

        const imgEle: any = document.createElement("img");
        imgEle.src = image;
        imgEle.onload = function () {
            setImageDimRatio({ ...imageDimRatio, width: width / imgEle.width });
            const calcHeight = (width / imgEle.width * imgEle.height) || -400;
            setHeight(calcHeight);
            setAnnot(annotations);

            setIsCanvasRendered(true);

            // for showing the any part of image in case of segmented correction, logic we use is
            // we will load the complete image, canvas and annotations, but display only a certain part to the user
            // to manifest segmented correction (using position relative of the frame/container and absolute of the area/content)
            if (loc.length) {
                // if we have coordinates in the loc array, means we have to display only that portion of the image
                // calculating the frame's height, width and area's top position, what will be visible
                const diffY = Math.abs(loc[1] - loc[3]);
                const diffX = Math.abs(loc[0] - loc[2]);
                const ratio = diffX / width;
                setFrameDims({ height: diffY / ratio, top: loc[1] / ratio });
            } else setFrameDims({ ...frameDims, height: calcHeight });
        }
        imgEle.onerror = function () { setHeight(-400) }
    }, [image]);

    useEffect(() => {
        if (height > 10) {
            if (compLoaded.current && onChange) onChange({ annotations: annot, width });
            compLoaded.current = true;
        }
    }, [annot]);

    function handleAreaMouseMove({ nativeEvent = {} }: { [key: string]: any } = {}) {
        setMousePos({ x: nativeEvent.offsetX, y: nativeEvent.offsetY });
    }

    function handleAreaClick() {
        if (selectedToolBarBtn === PENCIL_TOOL) return;

        if (selectedToolBarBtn) {
            const size = shapes?.[selectedToolBarBtn]?.size || { height: 50, width: 50 };
            setAnnot([...annot, {
                type: selectedToolBarBtn, size,
                pos: { x: mousePos.x - size.width / 2, y: mousePos.y - size.height / 2 },
                ...(selectedToolBarBtn === TEXT_TOOL ? { html: textToolContent } : {})
            }]);
            setTextToolContent(""); //emptying the text tool content in the editor
        }
    }

    function handleUndoClick(isRedo: boolean) {
        if (isRedo) {
            if (undoAnnot.length) {
                setAnnot((prev) => ([...prev, undoAnnot[0]]));
                setUndoAnnot(prev => prev.filter((i, idx) => idx != 0));
            }
        } else {
            if (annot.length) setUndoAnnot(prev => [{ ...annot[annot.length - 1] }, ...prev]);
            setAnnot(annot.slice(0, -1));
        }
    }

    function render(compIdx: number, isInFixedContainer: boolean = false) {
        return (
            <div
                id={ANNOTATION_COMP_ID + compIdx}
                className={`sa-bg-white sa-overflow-auto sa-select-none sa-relative sa-max-h-screen`}
                style={{ minWidth: width + 20, maxWidth: width + 20, height: frameDims.height }} // 20 is added to adjust scrollbar width
            >
                <AnnotationButtons
                    isLoading={height <= 10}
                    shapes={shapes}
                    isRedoEnabled={undoAnnot.length ? true : false}
                    isUndoEnabled={annot.length ? true : false}
                    selectedTool={selectedToolBarBtn}
                    onToolClick={(tool) => {
                        if ([UNDO_TOOL, REDO_TOOL].includes(tool)) {
                            handleUndoClick(tool === REDO_TOOL ? true : false);
                        } else if (tool === FULL_SCREEN_TOOL) {
                            setModalData({ isOpen: true, type: CORR_FULL_SCR_MODAL, hideTitle: true });
                        } else {
                            setSelectedToolBarBtn(tool);
                        }
                    }}
                />

                {
                    selectedToolBarBtn === TEXT_TOOL ?
                        <div className="sa-flex sa-items-center sa-justify-center sa-my-1">
                            <textarea
                                autoFocus
                                className="sa-h-[50px] sa-w-[95%] sa-resize-none sa-border-[lightgrey] sa-shadow-md sa-rounded-md"
                                value={textToolContent}
                                onChange={(e) => setTextToolContent(e.target.value)}
                            />
                        </div>
                        : null
                }

                {
                    height <= 10 ?
                        <div className="sa-sticky sa-top-0 sa-z-10 sa-py-[7px]">
                            {height === -400 ? error : loader}
                        </div>
                        : null
                }

                <div id={FRAME_ID + compIdx} className="sa-relative sa-overflow-hidden"
                    style={{ minWidth: width, maxWidth: width, height: frameDims.height }}
                >
                    <div id={AREA_ID + compIdx} className="sa-relative sa-overflow-hidden"
                        style={{
                            top: -frameDims.top,
                            minWidth: width, maxWidth: width, height, minHeight: MIN_HEIGHT,
                            backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
                            backgroundImage: (height > 10 ? `url(${image})` : ""),
                            // cursor: `url(${shapes[selectedToolBarBtn]?.img}), auto`,
                        } as CSSProperties}
                        onMouseMove={handleAreaMouseMove}
                        onClick={handleAreaClick}
                        onDragOver={(e) => { e.preventDefault() /* to prevent drag shadow going to old position */ }}
                    >
                        {
                            !isCanvasRendered ? null :
                                <Canvas
                                    compIdx={compIdx}
                                    imageDimRatio={imageDimRatio}
                                    isDrawable={selectedToolBarBtn === PENCIL_TOOL}
                                    width={width}
                                    height={height}
                                    annot={annot}
                                    setAnnot={setAnnot}
                                />
                        }

                        {
                            annot.map((item, idx: number) => (item.type === PENCIL_TOOL || item.ty || item.pts) ? null : //old canvasData from old assessed portal has ty and pts keys which will be handled using canvas not AnnotationItem
                                <AnnotationItem
                                    isInFixedContainer={isInFixedContainer}
                                    compIdx={compIdx}
                                    key={idx}
                                    isSelected={idx === selectedAnnot}
                                    idx={idx}
                                    item={item}
                                    annotationImg={shapes?.[item.type]?.img}
                                    setAnnot={setAnnot}
                                    onClick={(idx) => { setSelectedAnnot(idx) }}
                                    onDeleteClick={(idx) => { setAnnot(annot.filter((_, i) => i !== idx)) }}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="sa">
            <Modal
                className={`!sa-max-h-screen`}
                open={modalData.isOpen}
                hideTitle={modalData.hideTitle}
                onClose={() => { setModalData(prev => ({ ...prev, isOpen: false })) }}
            >
                <>{modalData.type === CORR_FULL_SCR_MODAL ? <>{render(-1, true)}</> : null}</>
            </Modal>

            {render(compIdx)}
        </div>
    );
}
