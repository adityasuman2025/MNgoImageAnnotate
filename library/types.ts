import type { ReactNode } from "react";

export interface Tool {
    name: string;
    btnIcon: ReactNode;
    elementIcon?: ReactNode;
}

export interface MNgoImageAnnotateProps {
    readonly?: boolean;
    imgSrc?: string;
    title?: ReactNode;
    tools?: Tool[];
}

export interface Coordinates {
    x: number;
    y: number;
}

export interface ScaleFactors {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export type FreeDrawPoints = number[];
export type AnnotationId = string;

export interface Annotation {
    id: string,
    name: string,
    zIndex: number,

    pos?: Coordinates,
    rotation?: number,
    dimensions?: Dimensions,

    points?: FreeDrawPoints[], // if name is pencil -> means its free draw -> only then we will have points
}

export interface AnnotationData {
    annotationIds: AnnotationId[],
    annotations: Record<AnnotationId, Annotation>,
    highestZIndex: number,
}