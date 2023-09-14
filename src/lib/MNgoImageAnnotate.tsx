import React, { useEffect, useState, CSSProperties, ReactElement, useRef, Dispatch, SetStateAction } from "react";
import { AnnotationButtons, AnnotationItem, Canvas, Loader } from "./components";
import {
    MIN_HEIGHT, DEFAULT_ANNOT_AREA_WIDTH, FRAME_ID, AREA_ID, ANNOTATION_COMP_ID,
    PENCIL_TOOL, UNDO_TOOL, REDO_TOOL, TEXT_TOOL, FULL_SCREEN_TOOL
} from "./constants";
import "./index.css";

const TOOL_BAR_HEIGHT = 55, SCROLL_BAR_HEIGHT = 20;

interface MNgoImageAnnotatePropsType {
    isViewMode?: boolean
    compIdx?: number,
    compMaxWidth?: number,
    compMaxHeight?: string,
    image?: string,
    loc?: number[],
    imgWidth?: number,
    isDarkMode?: boolean,
    loader?: string | ReactElement,
    error?: string | ReactElement,
    textInputField?: (textInputVal: string, setTextInputVal: Dispatch<SetStateAction<string>>) => ReactElement,
    shapes?: { [key: string]: any },
    annotations?: any[],
    onChange?: (data: { [key: string]: any }) => void
}
export default function MNgoImageAnnotate({
    isViewMode = false,
    compIdx = 0,
    compMaxWidth,
    compMaxHeight,
    image = "",
    loc = [], //loc represents co-ordinates of visible portion of the image, i.e. [x1, y1, x2, y2]
    imgWidth = DEFAULT_ANNOT_AREA_WIDTH,
    isDarkMode = false,
    loader = <Loader />,
    error = "Something went wrong",
    textInputField = (textInputVal, setTextInputVal) => {
        return (
            <textarea
                autoFocus
                className="sa-h-[50px] sa-w-[95%] sa-resize-none sa-border-[lightgrey] sa-shadow-md sa-rounded-md"
                value={textInputVal}
                onChange={(e) => setTextInputVal(e.target.value)}
            />
        )
    },
    shapes = {},
    annotations = [],
    onChange,
}: MNgoImageAnnotatePropsType) {
    image = image.replace(/ /g, '%20'); // to remove spaces from image url

    const compLoaded = useRef(false);

    const [height, setHeight] = useState<number>(10); //height 10 is loading, 400 is error
    const [imageDimRatio, setImageDimRatio] = useState({ width: 1 });
    const [frameDims, setFrameDims] = useState<{ [key: string]: number }>({ height: 10, top: 0 });

    const [isCanvasRendered, setIsCanvasRendered] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState<{ [key: string]: any }>({ x: 0, y: 0 });
    const [selectedToolBarBtn, setSelectedToolBarBtn] = useState<string>("");
    const [textToolContent, setTextToolContent] = useState<string>("");

    const [annot, setAnnot] = useState<{ [key: string]: any }[]>([]);
    const [undoAnnot, setUndoAnnot] = useState<{ [key: string]: any }[]>([]);
    const [selectedAnnot, setSelectedAnnot] = useState<number | string>("");

    const requiredWidth = compMaxWidth || imgWidth;
    const scaleRatio = requiredWidth / imgWidth;

    useEffect(() => {
        compLoaded.current = false;

        const imgEle: any = document.createElement("img");
        imgEle.src = image;
        imgEle.onload = function () {
            setImageDimRatio({ ...imageDimRatio, width: requiredWidth / imgEle.width });
            const calcHeight = (requiredWidth / imgEle.width * imgEle.height) || -400;
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
                const ratio = diffX / requiredWidth;
                setFrameDims({ height: diffY / ratio, top: loc[1] / ratio });
            } else setFrameDims({ ...frameDims, height: calcHeight });
        }
        imgEle.onerror = function () { setHeight(-400) }
    }, [image]);

    useEffect(() => {
        if (height > 10) {
            if (compLoaded?.current && onChange) onChange({ annotations: annot, imgWidth: requiredWidth });
            compLoaded.current = true;
        }
    }, [annot]);

    function handleAreaMouseMove({ nativeEvent = {} }: { [key: string]: any } = {}) {
        if (!isViewMode) setMousePos({ x: nativeEvent.offsetX, y: nativeEvent.offsetY });
    }

    function handleAreaClick() {
        if (isViewMode || (selectedToolBarBtn === PENCIL_TOOL)) return;

        if (selectedToolBarBtn) {
            const size = shapes?.[selectedToolBarBtn]?.size || { height: 50, width: 50 };

            const newAnnot = {
                type: selectedToolBarBtn, size,
                pos: { x: mousePos.x - size.width / 2, y: mousePos.y - size.height / 2 },
            };
            if (selectedToolBarBtn === TEXT_TOOL) {
                if ((textToolContent?.trim() !== "") && (textToolContent?.trim() !== undefined)) {
                    setAnnot([...annot, {
                        ...newAnnot,
                        html: textToolContent,
                        size: { width: "fit-content", height: "fit-content" },
                        fontSize: "18pt"
                    }]);
                }
            } else {
                setAnnot([...annot, newAnnot]);
            }

            setTextToolContent(""); //emptying the text tool content in the editor
        }
    }

    function handleUndoClick(isRedo: boolean) {
        if (isRedo) {
            if (undoAnnot.length) {
                setAnnot((prev) => ([...prev, undoAnnot[0]]));
                setUndoAnnot(prev => prev?.filter((i, idx) => idx != 0));
            }
        } else {
            if (annot.length) setUndoAnnot(prev => [{ ...annot[annot.length - 1] }, ...prev]);
            setAnnot(annot.slice(0, -1));
        }
    }

    function toggleFullScreen() {
        try {
            if (!document?.fullscreenElement) {
                document?.documentElement?.requestFullscreen();
            } else if (document?.exitFullscreen) {
                document?.exitFullscreen();
            }
        } catch (e) { console.log("failed to toggle full screen", e) }
    }

    function render(compIdx: number) {
        return (
            <div
                id={ANNOTATION_COMP_ID + compIdx}
                className={`${isDarkMode ? "sa-bg-slate-900" : "sa-bg-white"} sa-overflow-auto sa-select-none sa-relative`}
                style={{
                    minWidth: requiredWidth + SCROLL_BAR_HEIGHT, maxWidth: requiredWidth + SCROLL_BAR_HEIGHT,
                    maxHeight: compMaxHeight || (frameDims.height + TOOL_BAR_HEIGHT),
                    minHeight: MIN_HEIGHT + TOOL_BAR_HEIGHT
                }} // SCROLL_BAR_HEIGHT is added to adjust scrollbar width // TOOL_BAR_HEIGHT is added to adjust the tool bar height
            >

                {
                    !isViewMode &&
                    <AnnotationButtons
                        isDarkMode={isDarkMode}
                        isLoading={height <= 10}
                        shapes={shapes}
                        isRedoEnabled={undoAnnot.length ? true : false}
                        isUndoEnabled={annot.length ? true : false}
                        selectedTool={selectedToolBarBtn}
                        onToolClick={(tool) => {
                            if ([UNDO_TOOL, REDO_TOOL].includes(tool)) handleUndoClick(tool === REDO_TOOL);
                            else if (tool === FULL_SCREEN_TOOL) toggleFullScreen();
                            else setSelectedToolBarBtn(tool);
                        }}
                    />
                }

                {
                    selectedToolBarBtn === TEXT_TOOL &&
                    <div className="sa-flex sa-items-center sa-justify-center sa-my-1">
                        {textInputField && textInputField(textToolContent, setTextToolContent)}
                    </div>
                }

                {
                    height <= 10 &&
                    <div className={`sa-absolute sa-top-[${TOOL_BAR_HEIGHT}] sa-left-0 sa-right-0`}>
                        {height === -400 ? error : loader}
                    </div>
                }

                <div id={FRAME_ID + compIdx} className="sa-relative sa-overflow-hidden"
                    style={{ minWidth: requiredWidth, maxWidth: requiredWidth, height: frameDims.height }}
                >
                    <div id={AREA_ID + compIdx} className="sa-relative sa-overflow-hidden"
                        style={{
                            top: -frameDims.top,
                            minWidth: requiredWidth, maxWidth: requiredWidth, height, minHeight: MIN_HEIGHT,
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
                                    width={requiredWidth}
                                    height={height}
                                    annot={annot}
                                    setAnnot={setAnnot}
                                    scaleRatio={scaleRatio}
                                />
                        }

                        {
                            annot?.map((item, idx: number) => (item.type === PENCIL_TOOL || item.ty || item.pts) ? null : //old canvasData from old assessed portal has ty and pts keys which will be handled using canvas not AnnotationItem
                                <AnnotationItem
                                    compIdx={compIdx}
                                    key={idx}
                                    isSelected={isViewMode ? false : idx === selectedAnnot}
                                    isViewMode={isViewMode}
                                    scaleRatio={scaleRatio}
                                    idx={idx}
                                    item={item}
                                    annotationImg={shapes?.[item?.type]?.img}
                                    setAnnot={setAnnot}
                                    onClick={(idx) => { setSelectedAnnot(idx) }}
                                    onDeleteClick={(idx) => { setAnnot(annot?.filter((_, i) => i !== idx)) }}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="sa">{render(compIdx)}</div>
    );
}
