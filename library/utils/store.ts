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

export function createAnnotationElement(
    data: Omit<Annotation, "id" | "zIndex">,
    prefix = "anno"
): Annotation {
    const nextZIndex = globalStore.getHighestZIndex() + 1;
    globalStore.setHighestZIndex(nextZIndex);

    const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return { ...data, id, zIndex: nextZIndex };
}

export function undo() {
    globalStore.setActiveToolName(null);
    globalStore.undo();
}

export function redo() {
    globalStore.setActiveToolName(null);
    globalStore.redo();
}