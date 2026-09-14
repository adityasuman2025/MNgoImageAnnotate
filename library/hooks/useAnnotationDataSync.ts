import { useRef, useEffect, useSyncExternalStore } from "react";
import type { AnnotationData } from "../types";
import globalStore from "../store";
import useSyncedRef from "./useSyncedRef";

interface UseAnnotationDataSyncOptions {
    annotationData?: AnnotationData;
    onAnnotationDataChange?: (newData: AnnotationData) => void;
}
export default function useAnnotationDataSync({
    annotationData,
    onAnnotationDataChange,
}: UseAnnotationDataSyncOptions) {
    const isPropSyncRef = useRef(false);
    const isFirstMountRef = useRef(true);
    const onChangeRef = useSyncedRef(onAnnotationDataChange);

    const storeAnnotationData = useSyncExternalStore(globalStore.subscribeToAnnotationData, globalStore.getAnnotationData);

    useEffect(() => {
        if (annotationData && annotationData !== globalStore.getAnnotationData()) {
            isPropSyncRef.current = true;
            globalStore.setAnnotationData(annotationData);
        }
    }, [annotationData]);

    useEffect(() => {
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            return;
        }

        if (isPropSyncRef.current) {
            isPropSyncRef.current = false;
            return;
        }

        onChangeRef.current?.(storeAnnotationData);
    }, [storeAnnotationData]);
}
