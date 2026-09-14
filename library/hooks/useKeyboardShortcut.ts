import { useEffect, useRef } from "react";

export function isTypingInInputElement(): boolean {
    const activeEl = document.activeElement;
    return (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable)
    );
}

export default function useKeyboardShortcut(
    handler: (e: KeyboardEvent) => void,
    enabled = true
) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (isTypingInInputElement()) return;
            handlerRef.current(e);
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled]);
}
