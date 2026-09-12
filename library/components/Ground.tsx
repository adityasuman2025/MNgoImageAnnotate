import { memo, useState, useEffect, useCallback } from "react";
import Element from "./Element";

const ID = crypto.randomUUID();

function Ground() {
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    useEffect(() => {
        // clicking anywhere else should reset the selected element
        function handlePointerDown(e: PointerEvent) {
            const target = e.target as HTMLElement | null;

            if (
                !target?.closest("[data-annotation-element]") &&
                !target?.closest("[data-selection-overlay]")
            ) {
                setSelectedElementId(null);
            }
        }

        window.addEventListener("pointerdown", handlePointerDown);
        return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const handleSelect = useCallback((id: string) => {
        setSelectedElementId(id);
    }, []);

    return (
        <div className="w-full absolute inset-0 flex-1 relative">
            <Element
                id={ID}
                isSelected={ID === selectedElementId}
                onSelect={handleSelect}
            />
        </div>
    );
}

export default memo(Ground);