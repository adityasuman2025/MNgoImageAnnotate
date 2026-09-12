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
    delta?: Coordinates;
    rotation?: number;
}

export function getTransformStyle({
    pos,
    delta = { x: 0, y: 0 },
    rotation = 0,
}: TransformStyleOptions): string {
    const dx = delta.x ?? 0;
    const dy = delta.y ?? 0;

    const xExpr = dx !== 0 ? `calc(${pos.x}px * var(--scale-x, 1) + ${dx}px)` : `calc(${pos.x}px * var(--scale-x, 1))`;
    const yExpr = dy !== 0 ? `calc(${pos.y}px * var(--scale-y, 1) + ${dy}px)` : `calc(${pos.y}px * var(--scale-y, 1))`;
    const translate = `translate3d(${xExpr}, ${yExpr}, 0)`;

    // Shifts the pivot point to the center of the element (50%, 50%), rotates it,
    // and shifts it back (-50%, -50%) so rotation occurs around the middle while
    // preserving "transform-origin: top left" for position and scaling.
    const rotateTransform = rotation !== 0 ? `translate(50%, 50%) rotate(${rotation}deg) translate(-50%, -50%)` : "";

    return [translate, rotateTransform].filter(Boolean).join(" ");
}

