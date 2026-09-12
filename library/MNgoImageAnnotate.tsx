import { memo, useRef, useMemo, type ReactNode } from "react";
import GlobalStaticDataContextWrapper from "./context/GlobalStaticDataContext";
import ScaleFactorProvider from "./context/ScaleFactorContext";
import useContainerScaling from "./hooks/useContainerScaling";
import Image from "./components/Image";
import Ground from "./components/Ground";
import Toolbar from "./components/Toolbar";
import type { MNgoImageAnnotateProps } from "./types";
import './index.css';

function MNgoImageAnnotate({
    imgSrc,
    readonly = false,
    title,
    tools,
}: MNgoImageAnnotateProps) {
    const compRootRef = useRef<HTMLDivElement | null>(null);
    const bgRef = useRef<HTMLElement | null>(null);

    const { toScale, bgBaseDimn, scaleFactorRef, updateBaseDimensions } = useContainerScaling({ bgRef, compRootRef, imgSrc });

    const staticData = useMemo(() => ({
        readonly,
        imgSrc,
        toScale,
        bgRef,
        bgBaseDimn,
        compRootRef,
        tools,
        title,
    }), [readonly, imgSrc, toScale, bgBaseDimn, tools, title]);

    return (
        <GlobalStaticDataContextWrapper data={staticData}>
            <ScaleFactorProvider scaleFactorRef={scaleFactorRef}>
                <div
                    ref={compRootRef}
                    className="flex flex-col justify-between w-full h-full flex-1 overflow-y-auto min-h-96"
                >
                    <Toolbar title={title} tools={tools} />

                    <div className="relative flex-1 flex">
                        {imgSrc ? (
                            <Image src={imgSrc} bgRef={bgRef} onLoad={updateBaseDimensions} />
                        ) : (
                            <div
                                ref={(node) => {
                                    bgRef.current = node;
                                    updateBaseDimensions(node);
                                }}
                                className="w-full absolute inset-0 pointer-events-none select-none flex-1"
                                style={{
                                    backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
                                    backgroundSize: "20px 20px",
                                }}
                            />
                        )}

                        <Ground />
                    </div>
                </div>
            </ScaleFactorProvider>
        </GlobalStaticDataContextWrapper>
    );
}
export default memo(MNgoImageAnnotate);