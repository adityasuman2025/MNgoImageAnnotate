import type { Coordinates, Dimensions, Tool } from "./types";
import pencilIcon from "./images/pencilToolIcon.svg";
import textIcon from "./images/textToolIcon.svg";
import undoIcon from "./images/undoToolIcon.svg";
import redoIcon from "./images/redoToolIcon.svg";
import fullScrIcon from "./images/fullScrToolIcon.svg";

export const DEFAULT_ELEMENT_DIMENSIONS: Dimensions = {
    width: 40,
    height: 40,
};

export const DEFAULT_ELEMENT_POS: Coordinates = {
    x: 0,
    y: 0,
};

export const DEFAULT_ELEMENT_ROTATION = 0;

export const MIN_ELEMENT_DIMENSIONS: Dimensions = DEFAULT_ELEMENT_DIMENSIONS;

export const ACTION_BUTTON_BASE =
    "absolute left-1/2 -translate-x-1/2 w-6 h-6 p-1 border border-gray-200 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-colors pointer-events-auto";

export const RESIZE_HANDLE_BASE =
    "absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-teal-600 rounded-full cursor-nwse-resize shadow-sm hover:scale-125 transition-transform pointer-events-auto";

export const DEFAULT_TOOL_NAMES = {
    PENCIL: "pencil",
    TEXT: "text",
    UNDO: "undo",
    REDO: "redo",
    FULLSCREEN: "fullscreen",
} as const;

const DEFAULT_TOOL_ICON_CLASS = "w-4 h-4";

export const DEFAULT_BUILTIN_TOOLS: Tool[] = [
    {
        name: DEFAULT_TOOL_NAMES.PENCIL,
        btnIcon: <img src={pencilIcon} alt="Pencil tool" className={DEFAULT_TOOL_ICON_CLASS} draggable={false} />,
    },
    {
        name: DEFAULT_TOOL_NAMES.TEXT,
        btnIcon: <img src={textIcon} alt="Text tool" className={DEFAULT_TOOL_ICON_CLASS} draggable={false} />,
    },
    {
        name: DEFAULT_TOOL_NAMES.UNDO,
        btnIcon: <img src={undoIcon} alt="Undo" className={DEFAULT_TOOL_ICON_CLASS} draggable={false} />,
    },
    {
        name: DEFAULT_TOOL_NAMES.REDO,
        btnIcon: <img src={redoIcon} alt="Redo" className={DEFAULT_TOOL_ICON_CLASS} draggable={false} />,
    },
    {
        name: DEFAULT_TOOL_NAMES.FULLSCREEN,
        btnIcon: <img src={fullScrIcon} alt="Full screen" className={DEFAULT_TOOL_ICON_CLASS} draggable={false} />,
    },
];
