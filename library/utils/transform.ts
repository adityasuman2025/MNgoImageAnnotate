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

export interface TransformStyleOptions {
    pos: Coordinates;
    scale?: ScaleFactors;
    delta?: { x?: number; y?: number };
    applyScaleTransform?: boolean;
    useCssVariables?: boolean;
}
export function getTransformStyle({
    pos,
    scale = { x: 1, y: 1 },
    delta = {},
    applyScaleTransform = false,
    useCssVariables = false,
}: TransformStyleOptions): string {
    const dx = delta.x ?? 0;
    const dy = delta.y ?? 0;

    if (useCssVariables) {
        const xExpr = dx !== 0 ? `calc(${pos.x}px * var(--scale-x, 1) + ${dx}px)` : `calc(${pos.x}px * var(--scale-x, 1))`;
        const yExpr = dy !== 0 ? `calc(${pos.y}px * var(--scale-y, 1) + ${dy}px)` : `calc(${pos.y}px * var(--scale-y, 1))`;
        const translate = `translate3d(${xExpr}, ${yExpr}, 0)`;
        return applyScaleTransform ? `${translate} scale(var(--scale-x, 1), var(--scale-y, 1))` : translate;
    }

    const translate = `translate3d(${pos.x * scale.x + dx}px, ${pos.y * scale.y + dy}px, 0)`;
    return applyScaleTransform ? `${translate} scale(${scale.x}, ${scale.y})` : translate;
}
