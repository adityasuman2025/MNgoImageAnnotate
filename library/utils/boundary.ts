import type { Coordinates, Dimensions } from "../types";

/**
 * Clamps coordinates such that an element of given dimensions remains
 * completely within the background boundary.
 */
export interface BoundaryClampingOptions {
    targetPos: Coordinates;
    elementDimensions?: Dimensions;
    bgBaseDimn?: Dimensions | null;
}
export function clampToBoundary({
    targetPos,
    elementDimensions = { width: 0, height: 0 },
    bgBaseDimn,
}: BoundaryClampingOptions): Coordinates {
    const bgWidth = bgBaseDimn?.width ?? Infinity;
    const bgHeight = bgBaseDimn?.height ?? Infinity;

    const maxX = Math.max(0, bgWidth - elementDimensions.width);
    const maxY = Math.max(0, bgHeight - elementDimensions.height);

    return {
        x: Math.max(0, Math.min(maxX, targetPos.x)),
        y: Math.max(0, Math.min(maxY, targetPos.y)),
    };
}
