import type { Annotation, AnnotationData, AnnotationId } from "../types";
import globalStore from "../store";

export default function updateAnnotationById(id: AnnotationId, updaterFunc: (prev: Annotation) => Annotation) {
    const oldData = globalStore.getAnnotationById(id);
    if (!oldData) return;

    const updatedData = updaterFunc(oldData)
    globalStore.updateAnnotationById(id, updatedData)
}

export function getAnnotationSnapshot(data: AnnotationData): AnnotationData {
    return {
        highestZIndex: data.highestZIndex,
        annotations: { ...data.annotations },
        annotationIds: [...data.annotationIds],
    };
}