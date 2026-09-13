import type { Coordinates, Dimensions, ScaleFactors } from "../types";

/**
 * Clamps coordinates such that an element of given dimensions remains
 * completely within the background boundary.
 */
export interface BoundaryClampingOptions {
    targetPos: Coordinates;
    elementDimensions: Dimensions;
    bgBaseDimn?: Dimensions | null;
    bgElement?: HTMLElement | null;
    scaleFactor: ScaleFactors;
}
export function clampToBoundary({
    targetPos,
    elementDimensions,
    bgBaseDimn,
    bgElement,
    scaleFactor,
}: BoundaryClampingOptions): Coordinates {
    const bgWidth = bgBaseDimn?.width ?? (bgElement ? bgElement.clientWidth / scaleFactor.x : Infinity);
    const bgHeight = bgBaseDimn?.height ?? (bgElement ? bgElement.clientHeight / scaleFactor.y : Infinity);

    const maxX = Math.max(0, bgWidth - elementDimensions.width);
    const maxY = Math.max(0, bgHeight - elementDimensions.height);

    return {
        x: Math.max(0, Math.min(maxX, targetPos.x)),
        y: Math.max(0, Math.min(maxY, targetPos.y)),
    };
}
