import React, { CSSProperties, Dispatch, SetStateAction } from "react";
import { ResizableDiv } from ".";
import { deleteIcon, rotateIcon } from "../images";
import { ANNOTATION_COMP_ID, FRAME_ID, AREA_ID, TEXT_TOOL } from "../constants";

const ANNOT_ACTN_BTN_STYLE = "sa-absolute sa-left-[50%] sa-rounded-full sa-w-[23px] sa-h-[23px] sa-p-[3px] sa-translate-x-[-50%] ";

function myDebounce<Params extends any[]>(functionToRun: (...args: Params) => any, delay: number): (...args: Params) => void {
    let timer: any;
    return (...args: Params) => {
        clearTimeout(timer)
        timer = setTimeout(() => { functionToRun(...args) }, delay)
    }
}

function getPosOfAnnot(e: any, compIdx: number, isInFixedContainer: boolean = false) {
    try {
        const { scrollX, scrollY } = window || {};

        const { scrollLeft = 0, scrollTop = 0, offsetLeft: compOffsetLeft = 0, offsetTop: compOffsetTop = 0 } = document.getElementById(ANNOTATION_COMP_ID + compIdx) || {};
        const { offsetLeft: frameOffsetLeft = 0, offsetTop: frameOffsetTop = 0 } = document.getElementById(FRAME_ID + compIdx) || {}; // frame/container offset top & left wrt to its parent
        const { offsetLeft: areaOffsetLeft = 0, offsetTop: areaOffsetTop = 0 } = document.getElementById(AREA_ID + compIdx) || {};

        const newX: number = (e.pageX + scrollLeft - compOffsetLeft - frameOffsetLeft - areaOffsetLeft) - (isInFixedContainer ? scrollX : 0);
        const newY: number = (e.pageY + scrollTop - compOffsetTop - frameOffsetTop - areaOffsetTop) - (isInFixedContainer ? scrollY : 0);

        return { x: newX, y: newY };
    } catch { }
    return { x: 0, y: 0 };
}

interface AnnotationItemPropsType {
    isInFixedContainer?: boolean,
    compIdx?: number,
    isSelected?: boolean,
    idx: number,
    annotationImg: string,
    item: { [key: string]: any },
    setAnnot: Dispatch<SetStateAction<{ [key: string]: any }[]>>
    onClick?: (idx: number) => void,
    onDeleteClick?: (idx: number) => void,
}
export default function AnnotationItem({
    isInFixedContainer = false,
    compIdx = 0,
    isSelected,
    idx,
    annotationImg,
    item,
    setAnnot,
    onClick,
    onDeleteClick,
}: AnnotationItemPropsType) {
    function handleAnnotResize(size: { [key: string]: any }, idx: number) {
        setAnnot && setAnnot(prevAnnot => prevAnnot.map((item, i) => ({ ...item, size: ((i === idx) ? size : item.size) })));
    }

    function handleAnnotMoveStart(e: any, idx: number) {
        const { x, y } = getPosOfAnnot(e, compIdx, isInFixedContainer) || {};

        const newX = x - ((item?.size?.width || 0) / 2), newY = y - ((item?.size?.height || 0) / 2);
        if (newX >= 0 && newY >= 0) setAnnot(prev => prev.map((item, i) => ({ ...item, pos: ((i === idx) ? { x: newX, y: newY } : item.pos) })));

        setTimeout(() => e.target.classList.add("sa-opacity-0"), 0);
    }

    function handleAnnotRotateStart(e: any, idx: number) {
        const { x: newX, y: newY } = getPosOfAnnot(e, compIdx, isInFixedContainer) || {};
        if (newX >= 0 && newY >= 0) {
            const centerX = (item?.pos?.x || 0) + ((item?.size?.width || 0) / 2), centerY = (item?.pos?.y || 0) + ((item?.size?.height || 0) / 2);
            const rotate: number = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);

            setAnnot(prev => prev?.map((item, i) => ({ ...item, rotate: ((i === idx) ? rotate : item?.rotate) })));
        }

        setTimeout(() => e.target.classList.add("sa-opacity-0"), 0);
    }

    function removeAnnotOpactiy(e: any) {
        setTimeout(() => e.target.classList.remove("sa-opacity-0"), 0);
    }

    const { pos = {}, size = {}, rotate = 0, type, html = "" } = item;
    return (
        <div
            className={`!sa-absolute ${isSelected ? "sa-border-[2px] sa-border-solid sa-border-[lime]" : ""}`}
            style={{ top: pos.y, left: pos.x }}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(idx) }}
        >
            <div className="sa-relative">
                <ResizableDiv className="annotImg" onResize={(size: any) => handleAnnotResize(size, idx)}>
                    <div
                        className="sa-cursor-grabbing sa-text-[red] sa-text-[18pt]"
                        style={{
                            width: size?.width, height: size?.height,
                            ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
                            backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
                            ...(type === TEXT_TOOL ? {} : { backgroundImage: `url(${annotationImg})` }),
                        } as CSSProperties}
                        onDrag={(e) => myDebounce(handleAnnotMoveStart, 100)(e, idx)}
                        onDragEnd={(e) => myDebounce(removeAnnotOpactiy, 100)(e)}
                        draggable={true}
                        {...(type === TEXT_TOOL ? { dangerouslySetInnerHTML: { __html: html || "" } } : {})} //if type is text tool then rendering the html 
                    />
                </ResizableDiv>

                {
                    isSelected ?
                        <>
                            <img
                                className={`${ANNOT_ACTN_BTN_STYLE} sa-bg-[yellowgreen] sa-top-[-40px] sa-cursor-grab`}
                                src={rotateIcon} alt={"rotateIcon"}
                                onDrag={(e) => myDebounce(handleAnnotRotateStart, 100)(e, idx)}
                                onDragEnd={(e) => myDebounce(removeAnnotOpactiy, 100)(e)}
                            />
                            <img
                                className={`${ANNOT_ACTN_BTN_STYLE} sa-bg-[red] sa-bottom-[-40px] sa-cursor-pointer sa-drag-none`}
                                src={deleteIcon} alt={"deleteIcon"}
                                onClick={() => { onDeleteClick && onDeleteClick(idx) }}
                            />
                        </>
                        : null
                }
            </div>
        </div>
    )
}
