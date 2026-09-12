import { memo, useState, useEffect, useCallback } from "react";
import Element from "./Element";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";

const ID = crypto.randomUUID();

function Ground() {
    const { readonly } = useGlobalStaticData();
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    useEffect(() => {
        if (readonly) {
            setSelectedElementId(null);
            return;
        }

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
    }, [readonly]);

    const handleSelect = useCallback((id: string) => {
        if (readonly) return;

        setSelectedElementId(id);
    }, [readonly]);

    return (
        <div className={`w-full absolute inset-0 flex-1 relative ${readonly ? "pointer-events-none select-none" : ""}`}>
            <Element
                id={ID}
                isSelected={ID === selectedElementId}
                onSelect={handleSelect}
            />
        </div>
    );
}

export default memo(Ground);