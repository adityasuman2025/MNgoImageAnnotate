import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { AnnotationId, Coordinates, Dimensions } from "../types";
import { DEFAULT_ELEMENT_DIMENSIONS, DEFAULT_ELEMENT_POS, DEFAULT_ELEMENT_ROTATION } from "../constants";
import globalStore from "../store";
import useSyncedRef from "./useSyncedRef";

export default function useAnnotation(id: AnnotationId) {
    const subscribe = useCallback((cb: () => void) => globalStore.subscribeToAnnotationById(id, cb), [id]);
    const getSnapshot = useCallback(() => globalStore.getAnnotationById(id), [id]);

    const data = useSyncExternalStore(subscribe, getSnapshot);

    const pos = data?.pos ?? DEFAULT_ELEMENT_POS;
    const rotation = data?.rotation ?? DEFAULT_ELEMENT_ROTATION;
    const dimensions = data?.dimensions ?? DEFAULT_ELEMENT_DIMENSIONS;

    const posRef = useSyncedRef<Coordinates>(pos);
    const rotationRef = useSyncedRef<number>(rotation);
    const dimensionsRef = useSyncedRef<Dimensions>(dimensions);

    return useMemo(() => ({
        ...data,
        pos,
        rotation,
        dimensions,
        posRef,
        rotationRef,
        dimensionsRef,
    }), [data, pos, rotation, dimensions, posRef, rotationRef, dimensionsRef]);
}
