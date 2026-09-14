import { memo, useCallback, useSyncExternalStore } from "react";
import type { Tool } from "../types";
import { DEFAULT_TOOL_NAMES, DEFAULT_TOOLS } from "../constants";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import globalStore from "../store";
import { undo, redo } from "../utils/store";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";

export interface ToolButtonProps {
    tool: Tool;
    isActive?: boolean;
    disabled?: boolean;
    onClick?: (tool: Tool) => void;
}
const ToolButton = memo(function ({ tool, isActive = false, disabled = false, onClick }: ToolButtonProps) {
    return (
        <button
            type="button"
            title={tool.name}
            aria-label={tool.name}
            aria-pressed={isActive}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(tool)
            }}
            className={`p-1 rounded-md transition-colors flex items-center justify-center ${disabled
                ? "opacity-30 cursor-not-allowed pointer-events-none text-gray-400"
                : isActive
                    ? "bg-teal-100 text-teal-800 ring-1 ring-teal-400 cursor-pointer"
                    : "hover:bg-gray-200 text-gray-600 active:bg-gray-200 cursor-pointer"
                }`}
        >
            {tool.btnIcon}
        </button>
    );
});

export interface ToolbarProps {
    className?: string;
}
function Toolbar({
    className = "",
}: ToolbarProps) {
    const { compRootRef, readonly, tools } = useGlobalStaticData();

    const activeToolName = useSyncExternalStore(globalStore.subscribeToActiveToolName, globalStore.getActiveToolName);
    const isUndoDisabled = useSyncExternalStore(globalStore.subscribeToAnnotationData, globalStore.isUndoDisabled);
    const isRedoDisabled = useSyncExternalStore(globalStore.subscribeToAnnotationData, globalStore.isRedoDisabled);

    useKeyboardShortcut((e) => {
        const isModifier = e.ctrlKey || e.metaKey;
        if (!isModifier) return;

        const key = e.key.toLowerCase();
        // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y
        if (key === "y" || (e.shiftKey && key === "z")) {
            e.preventDefault();
            redo();
        }
        // Undo: Ctrl+Z / Cmd+Z (without Shift)
        else if (key === "z") {
            e.preventDefault();
            undo();
        }
    }, !readonly);

    const handleToolClick = useCallback((tool: Tool) => {
        if (readonly) return;

        if (tool.name === DEFAULT_TOOL_NAMES.FULLSCREEN) {
            globalStore.setActiveToolName(null);

            if (!document.fullscreenElement) {
                const rootEl = compRootRef?.current;
                if (rootEl?.requestFullscreen) rootEl.requestFullscreen().catch(() => { });
                else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { });
            } else if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        } else if (tool.name === DEFAULT_TOOL_NAMES.UNDO) undo();
        else if (tool.name === DEFAULT_TOOL_NAMES.REDO) redo();
        else if (tool.name === DEFAULT_TOOL_NAMES.CLEAR_ALL) {
            globalStore.setActiveToolName(null);
            globalStore.clearAnnotationData();
        } else globalStore.setActiveToolName(prev => prev === tool.name ? null : tool.name);
    }, [readonly]);

    return (
        <div
            data-toolbar
            className={`sticky top-0 z-1 flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-md border-b border-gray-200/80 select-none transition-colors ${className}`}
        >
            <div className={`flex items-center gap-1.5 ${readonly ? "opacity-50 pointer-events-none" : ""}`}>
                {DEFAULT_TOOLS.map((tool) => (
                    <ToolButton
                        key={tool.name}
                        tool={tool}
                        isActive={tool.name === activeToolName}
                        disabled={
                            tool.name === DEFAULT_TOOL_NAMES.UNDO
                                ? isUndoDisabled
                                : tool.name === DEFAULT_TOOL_NAMES.REDO
                                    ? isRedoDisabled
                                    : false
                        }
                        onClick={handleToolClick}
                    />
                ))}
            </div>

            <div className={`flex items-center gap-1.5 ${readonly ? "opacity-50 pointer-events-none" : ""}`}>
                {tools?.map((tool) => (
                    <ToolButton
                        key={tool.name}
                        tool={tool}
                        isActive={activeToolName === tool.name}
                        onClick={handleToolClick}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(Toolbar);
