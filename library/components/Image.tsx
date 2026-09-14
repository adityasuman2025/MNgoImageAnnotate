import { memo, useEffect, useState, type RefObject } from "react";
import type { Dimensions } from "../types";

interface ImageProps {
    src: string;
    bgRef: RefObject<HTMLElement | null>;
    onDimensionsReady?: (dimensions: Dimensions) => void;
}
function Image({ src, bgRef, onDimensionsReady }: ImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [src]);

    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 z-1 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-xs transition-opacity duration-200">
                    <div
                        className="w-8 h-8 rounded-full border-3 border-teal-200 border-t-teal-600 animate-spin"
                        role="status"
                        aria-label="Loading image"
                    />
                    <span className="mt-2 text-xs font-medium text-gray-500 select-none">
                        Loading...
                    </span>
                </div>
            )}

            <img
                ref={(node) => {
                    bgRef.current = node;
                    if (node && node.complete && node.naturalWidth > 0) {
                        setIsLoading(false);
                        onDimensionsReady?.({ width: node.naturalWidth, height: node.naturalHeight });
                    }
                }}
                className={`w-full absolute inset-0 pointer-events-none select-none object-contain object-top transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
                src={src}
                alt="Annotation image"
                onLoad={(e) => {
                    setIsLoading(false);
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                        onDimensionsReady?.({ width: img.naturalWidth, height: img.naturalHeight });
                    }
                }}
                onError={() => setIsLoading(false)}
            />
        </>
    );
}

export default memo(Image);
