import React, { useEffect, useRef } from "react";

//ref: https://www.digitalocean.com/community/tutorials/js-resize-observer
function ResizableDiv({
    style = {},
    className = "",
    children = "",
    onResize,
}: { [key: string]: any }) {
    const ref = useRef<any>(null);

    useEffect(() => {
        const element = ref.current;

        const myObserver = new ResizeObserver(entries => {
            try {
                const entry = entries[0].contentRect || {};
                onResize({ width: entry.width, height: entry.height });
            } catch { }
        });

        myObserver.observe(element);
    }, []);

    return (
        <div
            ref={ref} className={className}
            style={{ resize: "both", overflow: "hidden", ...style }}
        >
            {children}
        </div>
    )
}

export default ResizableDiv;