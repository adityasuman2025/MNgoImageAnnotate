import React from "react";

interface LoaderPropsType {
    [key: string]: any
}
export default function Loader({
    className = "",
    loaderClassName = ""
}: LoaderPropsType) {
    return (
        <div className={className} style={{ display: "flex", justifyContent: "center", margin: "auto" }}>
            <div className={`sa-loadingAnimation ${loaderClassName}`} />
        </div>
    )
}