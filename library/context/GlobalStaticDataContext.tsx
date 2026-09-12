import { useContext, createContext, type ReactNode, type RefObject } from "react";
import type { MNgoImageAnnotateProps, Dimensions } from "../types";

interface StaticDataType extends MNgoImageAnnotateProps {
    toScale: boolean;
    bgRef?: RefObject<HTMLElement | null>;
    bgBaseDimn?: Dimensions | null;
    compRootRef?: RefObject<HTMLDivElement | null>;
}
const GlobalStaticDataContext = createContext<StaticDataType | null>(null);

interface GlobalStaticDataContextWrapperProps {
    children?: ReactNode;
    data: StaticDataType
}
export default function GlobalStaticDataContextWrapper({
    children,
    data,
}: GlobalStaticDataContextWrapperProps) {
    return (
        <GlobalStaticDataContext.Provider value={data}>
            {children}
        </GlobalStaticDataContext.Provider>
    )
}

export function useGlobalStaticData(): StaticDataType {
    const ctx = useContext(GlobalStaticDataContext);
    if (!ctx) throw new Error("useGlobalStaticData must be used inside GlobalPropsContextWrapper");

    return ctx;
}