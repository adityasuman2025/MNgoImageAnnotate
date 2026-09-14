import { memo, type RefObject } from "react";
import type { Dimensions } from "../types";

interface ImageProps {
    src: string;
    bgRef: RefObject<HTMLElement | null>;
    isImgLoaded: boolean;
    onDimensionsReady: (dimensions: Dimensions) => void;
    onLoadError: () => void
}
function Image({ src, bgRef, isImgLoaded, onDimensionsReady, onLoadError }: ImageProps) {
    return (
        <>
            {!isImgLoaded && (
                <div className="flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-xs select-none">
                    <div
                        className="w-8 h-8 rounded-full border-3 border-teal-200 border-t-teal-600 animate-spin"
                        role="status"
                        aria-label="Loading image"
                    />
                    <span className="mt-2 text-xs font-medium text-gray-500">
                        Loading...
                    </span>
                </div>
            )}

            <img
                ref={(node) => {
                    bgRef.current = node;
                    if (node && node.complete && node.naturalWidth > 0) onDimensionsReady?.({ width: node.naturalWidth, height: node.naturalHeight });
                }}
                className={`w-full select-none object-contain object-top ${!isImgLoaded ? "opacity-0" : "opacity-100"}`}
                src={src}
                alt="Annotation image"
                onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) onDimensionsReady?.({ width: img.naturalWidth, height: img.naturalHeight });
                }}
                onError={() => onLoadError()}
            />
        </>
    );
}

export default memo(Image);
