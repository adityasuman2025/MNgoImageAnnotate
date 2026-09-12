import { useRef, useLayoutEffect, type RefObject } from "react";

export default function useSyncedRef<T>(value: T): RefObject<T> {
    const ref = useRef<T>(value);

    useLayoutEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
}
