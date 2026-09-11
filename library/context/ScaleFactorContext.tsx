import { useContext, createContext, useMemo, type ReactNode, type RefObject } from "react";
import type { MNgoImageAnnotateProps } from "../MNgoImageAnnotate";
import type { ScaleFactors } from "../utils/transform";

interface ScaleFactorType extends MNgoImageAnnotateProps {
    scaleFactorRef: RefObject<ScaleFactors>;
}
const ScaleFactorContext = createContext<ScaleFactorType | null>(null);

interface ScaleFactorProviderProps {
    children?: ReactNode;
    scaleFactorRef: RefObject<ScaleFactors>;
}
export default function ScaleFactorProvider({
    children,
    scaleFactorRef,
}: ScaleFactorProviderProps) {
    const value = useMemo(() => ({ scaleFactorRef }), [scaleFactorRef]);

    return (
        <ScaleFactorContext.Provider value={value}>
            {children}
        </ScaleFactorContext.Provider>
    );
}

export function useScaleFactor(): ScaleFactorType {
    const ctx = useContext(ScaleFactorContext);
    if (!ctx) throw new Error("useScaleFactor must be used inside ScaleFactorProvider");

    return ctx;
}