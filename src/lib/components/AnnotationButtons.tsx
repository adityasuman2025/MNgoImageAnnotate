import React, { ReactElement } from "react";
import { PENCIL } from "../constants";

interface AnnotationButtonsTypes {
    height: number,
    beforeTools?: string | ReactElement,
    afterTools?: string | ReactElement,
    shapes?: { [key: string]: string },
    selectedToolBarBtn: string,
    setSelectedToolBarBtn: (type: string) => void,
    onUndoClick: (undoAll: boolean) => void
}

export default function AnnotationButtons({
    height,
    beforeTools = "",
    afterTools = "",
    shapes = {},
    selectedToolBarBtn,
    setSelectedToolBarBtn,
    onUndoClick,
}: AnnotationButtonsTypes) {
    return (
        <div id="toolBar" className={height <= 10 ? "disabledToolBar" : ""}>
            {beforeTools}

            {
                Object.keys(shapes).map((type, idx) => (
                    <div
                        key={type + "_" + idx}
                        className={selectedToolBarBtn === type ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"}
                        onClick={() => { setSelectedToolBarBtn(type) }}
                    >
                        <img alt={type} src={shapes[type]} />
                    </div>
                ))
            }

            <div
                className={selectedToolBarBtn === PENCIL ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"}
                onClick={() => { setSelectedToolBarBtn(PENCIL) }}
            >{PENCIL}</div>
            <div className="toolBarBtn" onClick={() => onUndoClick(false)}>undo</div>
            <div className="toolBarBtn" onClick={() => onUndoClick(true)}>clear</div>

            {afterTools}
        </div>
    )
}
