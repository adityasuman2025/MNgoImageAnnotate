import React, { CSSProperties } from "react";
import ResizableDiv from "../ResizableDiv";
import { deleteIcon, rotateIcon } from "../img";
import { ANNOTATION_COMP_ID, AREA_ID } from "../constants";

function myDebounce<Params extends any[]>(functionToRun: (...args: Params) => any, delay: number): (...args: Params) => void {
    let timer: any;
    return (...args: Params) => {
        clearTimeout(timer)
        timer = setTimeout(() => { functionToRun(...args) }, delay)
    }
}

interface AnnotationItemTypes {
    isSelected?: boolean,
    idx: number,
    annotationImg: string,
    item: { [key: string]: any },
    setAnnot?: (data: any) => void,
    onClick?: (idx: number) => void,
    onDeleteClick?: (idx: number) => void,
}
export default function AnnotationItem({
    isSelected,
    idx,
    annotationImg,
    item,
    setAnnot,
    onClick,
    onDeleteClick,
}: AnnotationItemTypes) {
    function handleAnnotResize(size: { [key: string]: any }, idx: number) {
        setAnnot && setAnnot((prevAnnot: any[]) =>
            prevAnnot.map((item, i) => {
                if (i === idx) item.size = size;
                return item;
            }));
    }

    function handleAnnotMoveStart(e: any, idx: number) {
        const { scrollLeft, scrollTop }: { [key: string]: any } = document.getElementById(ANNOTATION_COMP_ID) || {};
        const { offsetLeft: areaOffsetLeft, offsetTop: areaOffsetTop }: { [key: string]: any } = document.getElementById(AREA_ID) || {};

        const { width = 0, height = 0 }: { [key: string]: any } = item.size || {};

        const newX: number = e.pageX + scrollLeft - areaOffsetLeft - width / 2;
        const newY: number = e.pageY + scrollTop - areaOffsetTop - height / 2;
        if (newX >= 0 && newY >= 0) {
            setAnnot && setAnnot((prevAnnot: any[]) =>
                prevAnnot.map((item, i) => {
                    if (i === idx) item.pos = { x: newX, y: newY };
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

        const { x = 0, y = 0 }: { [key: string]: any } = item.pos || {};
        const { width = 0, height = 0 }: { [key: string]: any } = item.size || {};

        const centerX: number = x + width / 2, centerY: number = y + height / 2;
        const newX: number = e.pageX + scrollLeft - areaOffsetLeft, newY: number = e.pageY + scrollTop - areaOffsetTop;

        if (e.pageX && e.pageY) {
            const rotate: number = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);
            setAnnot && setAnnot((prevAnnot: any[]) =>
                prevAnnot.map((item, i) => {
                    if (i === idx) item.rotate = rotate;
                    return item;
                }));
        }

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnnotRotateEnd(e: any) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }

    const { pos = {}, size = {}, rotate = 0 } = item;

    return (
        <div
            className={isSelected ? "annot selectedAnnot" : "annot"}
            style={{ top: pos.y, left: pos.x }}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(idx) }}
        >
            <div className="annotContent">
                <ResizableDiv className="annotImg" onResize={(size: any) => handleAnnotResize(size, idx)}>
                    <div
                        style={{
                            width: size.width, height: size.height,
                            ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
                            backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "contain",
                            backgroundImage: `url(${annotationImg})`,
                        } as CSSProperties}
                        onDrag={(e) => myDebounce(handleAnnotMoveStart, 100)(e, idx)}
                        onDragEnd={(e) => myDebounce(handleAnnotMoveEnd, 100)(e)}
                        draggable={true}
                    />
                </ResizableDiv>

                {
                    isSelected ?
                        <>
                            <img
                                className="annotRotateBtn"
                                src={rotateIcon} alt={"rotateIcon"}
                                onDrag={(e) => myDebounce(handleAnnotRotateStart, 100)(e, idx)}
                                onDragEnd={(e) => myDebounce(handleAnnotRotateEnd, 100)(e)}
                            />
                            <img
                                className="annotDeleteBtn"
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
