import { useMemo, isValidElement, cloneElement, type ReactNode } from "react";
import { useGlobalStaticData } from "../context/GlobalStaticDataContext";

export default function useToolIcon(name?: string): ReactNode {
    const { allTools } = useGlobalStaticData();

    return useMemo(() => {
        if (!name) return null;

        const elementToolData = allTools?.find(i => i.name === name);
        if (!elementToolData) return null;

        const rawToolIcon = elementToolData?.elementIcon || elementToolData?.btnIcon;

        // removing all previous classnames from the tool icon and adding new to make it fit in the available space of element
        return isValidElement<{ className?: string }>(rawToolIcon)
            ? cloneElement(rawToolIcon, { className: "w-full h-full object-contain pointer-events-none select-none" })
            : rawToolIcon;
    }, [allTools, name]);
}
