import { memo, useCallback, useSyncExternalStore } from "react";
import Element from "./Element";
import globalStore from "../store";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";
import { DEFAULT_TOOL_NAMES } from "../constants";

interface StageProps {
    selectedElementId: string | null;
    onSelectElement: (id: string | null) => void;
}
function Stage({ selectedElementId, onSelectElement }: StageProps) {
    const { readonly } = useGlobalStaticData();
    const annotationIds = useSyncExternalStore(globalStore.subscribeToAnnotationIds, globalStore.getAllAnnotationIds);

    const handleSelect = useCallback((id: string) => {
        if (readonly) return;
        onSelectElement(id);
    }, [readonly, onSelectElement]);

    return (
        <>
            {annotationIds.map((id) => {
                if (globalStore.getAnnotationById(id)?.name === DEFAULT_TOOL_NAMES.PENCIL) return null; // pencil annotation elements are handled in FreeDrawCanvas

                return (
                    <Element
                        key={id}
                        id={id}
                        isSelected={id === selectedElementId}
                        onSelect={handleSelect}
                    />
                );
            })}
        </>
    );
}

export default memo(Stage);
