import { memo, useCallback, useSyncExternalStore } from "react";
import type { Tool } from "../types";
import { DEFAULT_TOOL_NAMES } from "../constants";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import globalStore from "../store";

export interface ToolButtonProps {
    tool: Tool;
    isActive?: boolean;
    onClick?: (tool: Tool) => void;
}
export function ToolButton({ tool, isActive, onClick }: ToolButtonProps) {
    return (
        <button
            type="button"
            title={tool.name}
            aria-label={tool.name}
            aria-pressed={isActive}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(tool)
            }}
            className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center ${isActive
                ? "bg-teal-100 text-teal-800 ring-1 ring-teal-400"
                : "hover:bg-gray-200 text-gray-600 active:bg-gray-200"
                }`}
        >
            {tool.btnIcon}
        </button>
    );
}

export interface ToolbarProps {
    className?: string;
}
function Toolbar({
    className = "",
}: ToolbarProps) {
    const activeToolName = useSyncExternalStore(globalStore.subscribeToActiveToolName, globalStore.getActiveToolName);

    const { compRootRef, readonly, title, allTools } = useGlobalStaticData();

    const handleToolClick = useCallback((tool: Tool) => {
        if (readonly) return;

        if (tool.name === DEFAULT_TOOL_NAMES.FULLSCREEN) {
            globalStore.setActiveToolName(null);

            if (!document.fullscreenElement) {
                const rootEl = compRootRef?.current;
                if (rootEl?.requestFullscreen) rootEl.requestFullscreen().catch(() => { });
                else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { });
            } else if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        } else if (tool.name === DEFAULT_TOOL_NAMES.UNDO) {
            globalStore.setActiveToolName(null);

            // to-do: handle undo
        } else if (tool.name === DEFAULT_TOOL_NAMES.REDO) {
            globalStore.setActiveToolName(null);

            // to-do: handle redo
        } else {
            globalStore.setActiveToolName(prev => prev === tool.name ? null : tool.name);

            if (tool.name === DEFAULT_TOOL_NAMES.PENCIL) {
                // to-do: handle pencil
            } else if (tool.name === DEFAULT_TOOL_NAMES.TEXT) {
                // to-do: handle text
            }
        }
    }, [readonly]);

    return (
        <div
            data-toolbar
            className={`sticky top-0 flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-md border-b border-gray-200/80 z-1 select-none transition-colors ${className}`}
        >
            <div className="text-sm font-semibold text-gray-700">
                {title}
            </div>

            <div className={`flex items-center gap-1 ${readonly ? "opacity-50 pointer-events-none" : ""}`}>
                {allTools.map((tool) => (
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
