import { ReactElement, Dispatch, SetStateAction } from "react";

export interface MNgoImageAnnotatePropsType {
    isViewMode?: boolean;
    isDarkMode?: boolean;

    compIdx?: number;
    compMaxHeight?: string;
    compMaxWidth?: number;

    image?: string;
    imgWidth?: number;
    loc?: number[];

    loadingRenderer?: string | ReactElement;
    errorRenderer?: string | ReactElement;

    textInputField?: (textInputVal: string, setTextInputVal: Dispatch<SetStateAction<string>>) => ReactElement;
    shapes?: { [key: string]: any };
    annotations?: any[];
    onChange?: (data: { [key: string]: any }) => void;
}

export interface AnnotationItemType {
    type?: string;
    pos?: { x: number; y: number };
    size?: { height: number; width: number };
    pts?: [number, number][];
    text?: string;
    [key: string]: any;
}
