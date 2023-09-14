import React, { useRef } from "react";

export default function UploadButton({
    btnText = "Upload",
    btnStyle = {},
    accept = "*",
    onUpload,
}: {
    btnText?: string,
    btnStyle?: { [key: string]: any },
    accept?: string,
    onUpload?: (e: any) => void,
}) {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <>
            <div role="button" style={{ ...btnStyle }} onClick={() => ref.current?.click()}>{btnText}</div>
            <input type="file" accept={accept}
                ref={ref}
                style={{ display: "none" }}
                onChange={(e) => onUpload && onUpload(e?.target?.files)}
            />
        </>
    )
}