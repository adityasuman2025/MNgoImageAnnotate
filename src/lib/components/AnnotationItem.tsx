import React, { Dispatch, SetStateAction } from "react";
import { ResizableDiv } from ".";
import { deleteIcon, rotateIcon } from "../images";
import { ANNOTATION_COMP_ID, FRAME_ID, AREA_ID, TEXT_TOOL } from "../constants";

const ANNOT_ACTN_BTN_STYLE = "sa-absolute sa-left-[50%] sa-rounded-full sa-w-[23px] sa-h-[23px] sa-p-[3px] sa-translate-x-[-50%] ";

function debounceUtil(func: Function, delay: number = 500) {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        // @ts-ignore
        timer = setTimeout(() => { func.call(this, ...args); }, delay);
    };
}

function getPosOfAnnot(e: any, compIdx: number) {
    try {
        let isInFixedContainer: boolean = false;

        // getting the scroll length of all the parent divs of the component
        let parent: any = document.getElementById(ANNOTATION_COMP_ID + compIdx)?.parentNode;
        let htmlScrollX = 0, htmlScrollY = 0;
        while (parent) {
            try {
                //in case of parent's position is fixed, we don't need to go till html tag
                //so breaking when any parent element with fixed position is found
                const elePos = getComputedStyle(parent)?.position;
                isInFixedContainer = (elePos === "fixed");
                if (isInFixedContainer) break;

                if (parent.tagName === "HTML") break; //breaking when we found html tag

                htmlScrollY += (parent?.scrollTop || 0);
                htmlScrollX += (parent?.scrollLeft || 0);

                parent = parent.parentNode;
            } catch { break; }
        }

        const { scrollX, scrollY } = window || {};

        const { scrollLeft = 0, scrollTop = 0, offsetLeft: compOffsetLeft = 0, offsetTop: compOffsetTop = 0 } = document.getElementById(ANNOTATION_COMP_ID + compIdx) || {};
        const { offsetLeft: frameOffsetLeft = 0, offsetTop: frameOffsetTop = 0 } = document.getElementById(FRAME_ID + compIdx) || {}; // frame/container offset top & left wrt to its parent
        const { offsetLeft: areaOffsetLeft = 0, offsetTop: areaOffsetTop = 0 } = document.getElementById(AREA_ID + compIdx) || {};

        const newX: number = (e.pageX + scrollLeft - compOffsetLeft - frameOffsetLeft - areaOffsetLeft) + htmlScrollX - (isInFixedContainer ? scrollX : 0);
        const newY: number = (e.pageY + scrollTop - compOffsetTop - frameOffsetTop - areaOffsetTop) + htmlScrollY - (isInFixedContainer ? scrollY : 0);

        return { x: newX, y: newY };
    } catch { }
    return { x: 0, y: 0 };
}

interface AnnotationItemPropsType {
    compIdx?: number,
    isSelected?: boolean,
    isViewMode?: boolean,
    scaleRatio?: number,
    idx: number,
    annotationImg: string,
    item: { [key: string]: any },
    setAnnot: Dispatch<SetStateAction<{ [key: string]: any }[]>>
    onClick?: (idx: number) => void,
    onDeleteClick?: (idx: number) => void,
}
export default function AnnotationItem({
    compIdx = 0,
    isSelected,
    isViewMode = false,
    scaleRatio = 1,
    idx,
    annotationImg,
    item,
    setAnnot,
    onClick,
    onDeleteClick,
}: AnnotationItemPropsType) {
    function handleAnnotResize(size: { [key: string]: any }) {
        setAnnot && setAnnot(prevAnnot => prevAnnot?.map((item, i) => ({ ...item, size: ((i === idx) ? size : item.size) })));
    }

    function handleAnnotMoveStart(e: any) {
        const { x, y } = getPosOfAnnot(e, compIdx) || {};

        let width = item?.size?.width, height = item?.size?.height;
        const newX = x - ((width || 0) / 2), newY = y - ((height || 0) / 2);
        if (newX >= 0 && newY >= 0) setAnnot(prev => prev?.map((item, i) => ({ ...item, pos: ((i === idx) ? { x: newX, y: newY } : item.pos) })));

        setTimeout(() => e.target.classList.add("sa-opacity-0"), 0);
    }

    function handleAnnotRotateStart(e: any) {
        const { x: newX, y: newY } = getPosOfAnnot(e, compIdx) || {};
        if (newX >= 0 && newY >= 0) {
            let width = item?.size?.width, height = item?.size?.height;
            const centerX = (item?.pos?.x || 0) + ((width || 0) / 2), centerY = (item?.pos?.y || 0) + ((height || 0) / 2);
            const rotate: number = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);

            setAnnot(prev => prev?.map((item, i) => ({ ...item, rotate: ((i === idx) ? rotate : item?.rotate) })));
        }

        setTimeout(() => e.target.classList.add("sa-opacity-0"), 0);
    }

    function removeAnnotOpactiy(e: any) {
        setTimeout(() => e.target.classList.remove("sa-opacity-0"), 0);
    }

    const handleAnnotMoveStartOP = debounceUtil(handleAnnotMoveStart, 80); // optimised version of handleAnnotMoveStart
    const removeAnnotOpactiyOP = debounceUtil(removeAnnotOpactiy, 80); // optimised version of removeAnnotOpactiy

    const { pos = {}, size = {}, rotate = 0, type, html = "", fontSize } = item;
    const annotationImgStyle = {
        fontSize: fontSize || "10pt",
        width: (size?.width * scaleRatio), height: (size?.height * scaleRatio),
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
        backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
        ...(type === TEXT_TOOL ? {} : { backgroundImage: `url(${annotationImg})` }),
    };
    return (
        <div
            className={`!sa-absolute ${(isSelected) ? "sa-border-[2px] sa-border-solid sa-border-[lime]" : ""}`}
            style={{ top: (pos.y * scaleRatio), left: (pos.x * scaleRatio) }}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(idx) }}
        >
            <div className="sa-relative">
                {
                    !isViewMode ? (
                        <ResizableDiv className="annotImg" onResize={!isViewMode && ((size: any) => handleAnnotResize(size))}>
                            <div
                                className={`${!isViewMode ? "sa-cursor-grabbing" : ""} sa-text-[red]`}
                                style={annotationImgStyle} draggable={!isViewMode}
                                {...(type === TEXT_TOOL ? { dangerouslySetInnerHTML: { __html: html || "" } } : {})} //if type is text tool then rendering the html 

                                onDrag={handleAnnotMoveStartOP}
                                onDragEnd={removeAnnotOpactiyOP}
                            />
                        </ResizableDiv>
                    ) : (
                        <div
                            className={`${!isViewMode ? "sa-cursor-grabbing" : ""} sa-text-[red]`}
                            style={annotationImgStyle} draggable={!isViewMode}
                            {...(type === TEXT_TOOL ? { dangerouslySetInnerHTML: { __html: html || "" } } : {})} //if type is text tool then rendering the html 
                        />
                    )
                }

                {(isSelected) && (
                    <>
                        {type !== TEXT_TOOL && (
                            <img
                                className={`${ANNOT_ACTN_BTN_STYLE} sa-bg-[yellowgreen] sa-top-[-40px] sa-cursor-grab`}
                                src={rotateIcon} alt={"rotateIcon"}
                                onDrag={handleAnnotRotateStart}
                                onDragEnd={removeAnnotOpactiyOP}
                            />
                        )}

                        <img
                            className={`${ANNOT_ACTN_BTN_STYLE} sa-bg-[red] sa-bottom-[-40px] sa-cursor-pointer sa-drag-none`}
                            src={deleteIcon} alt={"deleteIcon"}
                            onClick={() => { onDeleteClick && onDeleteClick(idx) }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
