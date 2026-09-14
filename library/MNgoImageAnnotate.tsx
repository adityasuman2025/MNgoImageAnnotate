import { memo, useRef, useMemo } from "react";
import GlobalStaticDataContextWrapper from "./context/GlobalStaticDataContext";
import ScaleFactorProvider from "./context/ScaleFactorContext";
import useContainerScaling from "./hooks/useContainerScaling";
import useAnnotationDataSync from "./hooks/useAnnotationDataSync";
import Image from "./components/Image";
import Ground from "./components/Ground";
import Toolbar from "./components/Toolbar";
import type { MNgoImageAnnotateProps } from "./types";
import './index.css';

function MNgoImageAnnotate({
    imgSrc,
    readonly = false,
    tools,
    annotationData,
    onAnnotationDataChange,
}: MNgoImageAnnotateProps) {
    const compRootRef = useRef<HTMLDivElement | null>(null);
    const bgRef = useRef<HTMLElement | null>(null);

    useAnnotationDataSync({ annotationData, onAnnotationDataChange });

    const { toScale, bgBaseDimn, scaleFactorRef, updateBaseDimensions } = useContainerScaling({ bgRef, compRootRef, imgSrc });
    const staticData = useMemo(() => ({
        readonly,
        imgSrc,
        toScale,
        bgRef,
        bgBaseDimn,
        compRootRef,
        tools,
    }), [readonly, imgSrc, toScale, bgBaseDimn, tools]);

    return (
        <GlobalStaticDataContextWrapper data={staticData}>
            <ScaleFactorProvider scaleFactorRef={scaleFactorRef}>
                <div
                    ref={compRootRef}
                    className="bg-gray-100 flex flex-col justify-between w-full h-full flex-1 min-h-96 overlfow-y-auto overflow-x-hidden"
                >
                    <Toolbar />

                    <div className="relative flex-1 flex">
                        {imgSrc ? (
                            <Image src={imgSrc} bgRef={bgRef} onDimensionsReady={updateBaseDimensions} />
                        ) : (
                            <div
                                ref={(node) => {
                                    bgRef.current = node;
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