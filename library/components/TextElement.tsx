import { memo, useRef, useEffect, useState, type ChangeEvent } from "react";
import updateAnnotationById from "../utils/store";
import type { AnnotationId } from "../types";

interface TextElementProps {
    id: AnnotationId;
    initialText?: string;
    isSelected: boolean;
    readonly?: boolean;
}

function TextElement({
    id,
    initialText = "",
    isSelected,
    readonly,
}: TextElementProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(initialText);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    // Sync external changes (such as undo / redo) to local state when not actively editing
    useEffect(() => {
        if (!isEditing) {
            setLocalText(initialText);
        }
    }, [initialText, isEditing]);

    // Automatically enter edit mode if it's selected and text is empty
    useEffect(() => {
        if (isSelected && !readonly && localText === "") {
            setIsEditing(true);
        }
    }, [isSelected, readonly]);

    // Focus and select textarea when entering edit mode
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (readonly) return;
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalText(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (localText !== initialText) {
            updateAnnotationById(id, prev => ({ ...prev, text: localText }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation(); // prevent global shortcuts from firing while typing
        if (e.key === "Escape") {
            e.preventDefault();
            setIsEditing(false);
            setLocalText(initialText);
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    if (isEditing) {
        return (
            <textarea
                ref={inputRef}
                value={localText}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onPointerDown={(e) => e.stopPropagation()} // don't trigger element drag while typing/selecting text
                placeholder="Type text..."
                rows={1}
                className="w-full h-full bg-transparent text-red-600 placeholder:text-red-300 outline-none resize-none p-1 text-sm font-medium leading-tight select-text cursor-text"
            />
        );
    }

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className="w-full h-full p-1 flex items-center justify-start overflow-hidden text-red-600 text-sm font-medium leading-tight whitespace-pre-wrap break-words"
            title={readonly ? undefined : "Double click to edit"}
        >
            {localText || (!readonly ? (
                <span className="text-red-400 italic">Type text...</span>
            ) : null)}
        </div>
    );
}

export default memo(TextElement);
