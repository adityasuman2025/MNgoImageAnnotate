import React, { useEffect, useRef } from "react";

interface ResizableDivPropsType {
    [key: string]: any
}
export default function ResizableDiv({
    style: stl = {},
    className: cn = "",
    children = "",
    onResize,
}: ResizableDivPropsType) {
    const ref = useRef<any>(null);
    const isMounted = useRef<any>(null);

    useEffect(() => {
        const myObserver = new ResizeObserver(entries => handleResize(entries));
        myObserver?.observe(ref?.current);
    }, []);

    function handleResize(entries: any) {
        try {
            const entry = entries?.[0]?.contentRect || {};
            if (isMounted?.current && entry?.width && entry?.height) onResize({ width: entry.width, height: entry.height });

            isMounted.current = true;
        } catch { }
    }

    return <div ref={ref} className={cn} style={{ resize: "both", overflow: "hidden", ...stl }}>{children}</div>
} //ref: https://www.digitalocean.com/community/tutorials/js-resize-observer
