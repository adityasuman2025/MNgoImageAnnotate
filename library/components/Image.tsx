import { memo, useEffect, useState, type RefObject } from "react";

interface ImageProps {
    src: string;
    bgRef: RefObject<HTMLElement | null>;
    onLoad?: (el: HTMLImageElement) => void;
}
function Image({ src, bgRef, onLoad }: ImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const el = bgRef.current as HTMLImageElement | null;
        if (el?.complete && el?.naturalWidth > 0) {
            setIsLoading(false);
            onLoad?.(el);
        } else {
            setIsLoading(true);
        }
    }, [src, onLoad]);

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
                    if (node && node.complete) {
                        setIsLoading(false);
                        onLoad?.(node);
                    }
                }}
                className={`w-full absolute inset-0 pointer-events-none select-none object-contain object-top transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"
                    }`}
                src={src}
                alt="Annotation image"
                onLoad={(e) => {
                    setIsLoading(false);
                    onLoad?.(e.currentTarget);
                }}
                onError={() => setIsLoading(false)}
            />
        </>
    );
}

export default memo(Image);
