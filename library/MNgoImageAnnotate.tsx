import { memo, useRef, useMemo } from "react";
import GlobalStaticDataContextWrapper from "./context/GlobalStaticDataContext";
import ScaleFactorProvider from "./context/ScaleFactorContext";
import useContainerScaling from "./hooks/useContainerScaling";
import Ground from "./components/Ground";
import './index.css';

export interface MNgoImageAnnotateProps {
    readonly?: boolean;
    imgSrc?: string;
}
function MNgoImageAnnotate({
    imgSrc,
    readonly,
}: MNgoImageAnnotateProps) {
    const compRootRef = useRef<HTMLDivElement | null>(null);
    const bgRef = useRef<HTMLElement | null>(null);

    const { toScale, bgBaseDimn, scaleFactorRef } = useContainerScaling({ bgRef, compRootRef, imgSrc });

    const staticData = useMemo(() => ({
        readonly,
        imgSrc,
        toScale,
        bgRef,
        bgBaseDimn,
    }), [readonly, imgSrc, toScale, bgRef, bgBaseDimn]);

    return (
        <GlobalStaticDataContextWrapper data={staticData}>
            <ScaleFactorProvider scaleFactorRef={scaleFactorRef}>
                <div
                    ref={compRootRef}
                    className="flex flex-col justify-between w-full h-full flex-1 overflow-y-auto min-h-96"
                >
                    <div>Title & Tool bar</div>

                    <div className="relative flex-1 flex">
                        {imgSrc ? (
                            <img
                                ref={(node) => {
                                    bgRef.current = node;
                                }}
                                className="w-full absolute inset-0 pointer-events-none select-none object-contain object-top"
                                src={imgSrc}
                                alt="Annotation image"
                            />
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