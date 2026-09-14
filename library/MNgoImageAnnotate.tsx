import { memo, useRef, useMemo } from "react";
import GlobalStaticDataContextWrapper from "./context/GlobalStaticDataContext";
import ScaleFactorProvider from "./context/ScaleFactorContext";
import useContainerScaling from "./hooks/useContainerScaling";
import useAnnotationDataSync from "./hooks/useAnnotationDataSync";
import Toolbar from "./components/Toolbar";
import Ground from "./components/Ground";
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

    const { toScale, bgBaseDimnRef, bgCurrDimnRef, scaleFactorRef, updateBgBaseDimn } = useContainerScaling({ bgRef, compRootRef, imgSrc });
    const staticData = useMemo(() => ({
        readonly,
        imgSrc,
        toScale,
        bgRef,
        bgBaseDimnRef,
        bgCurrDimnRef,
        compRootRef,
        tools,
    }), [readonly, imgSrc, toScale, tools]);

    return (
        <GlobalStaticDataContextWrapper data={staticData}>
            <ScaleFactorProvider scaleFactorRef={scaleFactorRef}>
                <div
                    ref={compRootRef}
                    className="bg-gray-100 w-full h-full overflow-y-auto select-none"
                >
                    <Toolbar />
                    <Ground key={imgSrc ?? "default"} onImageDimensionsReady={updateBgBaseDimn} />
                </div>
            </ScaleFactorProvider>
        </GlobalStaticDataContextWrapper>
    );
}

export default memo(MNgoImageAnnotate);