import type { Coordinates } from "../types";

/**
 * Standard CSS transform template used on all annotation elements.
 * Position and rotation are powered by CSS variables:
 * - `--el-x`: base X coordinate (px)
 * - `--el-y`: base Y coordinate (px)
 * - `--el-rot`: rotation angle (deg)
 * - `--scale-x` & `--scale-y`: container scale factors
 */
export const ELEMENT_TRANSFORM_TEMPLATE =
    "translate3d(calc(var(--el-x, 0px) * var(--scale-x, 1)), calc(var(--el-y, 0px) * var(--scale-y, 1)), 0) translate(50%, 50%) rotate(var(--el-rot, 0deg)) translate(-50%, -50%)";

export function getElementTransformVariables(pos?: Coordinates, rotation: number = 0): Record<string, string> {
    return {
        "--el-x": `${pos?.x ?? 0}px`,
        "--el-y": `${pos?.y ?? 0}px`,
        "--el-rot": `${rotation}deg`,
    };
}
