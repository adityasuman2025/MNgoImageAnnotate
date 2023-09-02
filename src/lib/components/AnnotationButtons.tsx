import React from "react";
import { UNDO_TOOL, REDO_TOOL, PENCIL_TOOL, TEXT_TOOL, FULL_SCREEN_TOOL } from "../constants";
import { undoToolIcon, redoToolIcon, pencilToolIcon, textToolIcon, fullScrToolIcon } from "../images";

const TOOL_STYLE = "sa-ml-[16px] sa-p-[3px] sa-flex sa-items-center sa-justify-center sa-cursor-pointer sa-rounded-full";
const SELECTED_TOOL_STYLE = "sa-shadow sa-bg-neutral-200 sa-border-[0.5px] sa-border-solid sa-border-stone-300";
const DISABLED_TOOL_STYLE = "sa-pointer-events-none sa-opacity-50";
const TOOL_WIDTH = 12;

const DEFAULT_TOOLS: { [key: string]: any } = {
    [PENCIL_TOOL]: { btnIcon: pencilToolIcon },
    [TEXT_TOOL]: { btnIcon: textToolIcon }
}

interface AnnotationButtonsPropsType {
    isLoading?: boolean,
    shapes?: { [key: string]: any },
    isRedoEnabled: boolean,
    isUndoEnabled: boolean,
    selectedTool: string,
    onToolClick: (type: string) => void,
}
export default function AnnotationButtons({
    isLoading = true,
    shapes = {},
    isRedoEnabled,
    isUndoEnabled,
    selectedTool,
    onToolClick,
}: AnnotationButtonsPropsType) {
    return (
        <div className={`sa-sticky sa-top-0 sa-z-10 sa-bg-white sa-flex sa-items-center sa-justify-between sa-shadow sa-border-neutral-100 sa-border-solid sa-border-0 sa-border-y-[1px] sa-py-[16px] sa-px-[24px] sa-max-w-full sa-overflow-x-auto ${isLoading ? "sa-pointer-events-none sa-opacity-20" : ""}`}>
            <div className={`sa-flex sa-items-center sa-justify-left`}>
                <div className={`sa-mr-[16px] sa-cursor-pointer ${isUndoEnabled ? "" : DISABLED_TOOL_STYLE}`} onClick={() => onToolClick(UNDO_TOOL)}>
                    <img src={undoToolIcon} width={TOOL_WIDTH + 2} height={TOOL_WIDTH + 2} alt="tool" />
                </div>
                <div className={`sa-cursor-pointer ${isRedoEnabled ? "" : DISABLED_TOOL_STYLE}`} onClick={() => onToolClick(REDO_TOOL)}>
                    <img src={redoToolIcon} width={TOOL_WIDTH + 2} height={TOOL_WIDTH + 2} alt="tool" />
                </div>
            </div>

            <div className={`sa-flex sa-items-center sa-justify-center`}>
                {
                    Object.keys(DEFAULT_TOOLS).map((type, idx) => (
                        <div className={`${TOOL_STYLE} ${selectedTool === type ? SELECTED_TOOL_STYLE : ""}`}
                            key={type + "_" + idx} title={type} onClick={() => onToolClick(type)}
                        >
                            <img src={DEFAULT_TOOLS?.[type]?.btnIcon} height={TOOL_WIDTH} width={TOOL_WIDTH} alt="tool" />
                        </div>
                    ))
                }

                {
                    Object.keys(shapes).map((type, idx) => (
                        <div className={`${TOOL_STYLE} ${selectedTool === type ? SELECTED_TOOL_STYLE : ""}`}
                            key={type + "_" + idx} title={type} onClick={() => onToolClick(type)}
                        >
                            <img src={shapes?.[type]?.btnIcon} height={TOOL_WIDTH} width={TOOL_WIDTH} alt="tool" />
                        </div>
                    ))
                }

                <div className="sa-ml-[28px] sa-cursor-pointer" onClick={() => onToolClick(FULL_SCREEN_TOOL)}>
                    <img src={fullScrToolIcon} width={TOOL_WIDTH} height={TOOL_WIDTH} alt="tool" />
                </div>
            </div>
        </div>
    )
}
