import React from 'react';
//@ts-ignore
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "./lib";

import img from "./img.png";
import tickImg from "./tick.png";
import crossImg from "./cross.png";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnnotationWrapper />);

function AnnotationWrapper({
    annotationData = JSON.parse(localStorage.getItem("annotData") || "{}"),
}) {
    function handleChange(annotData: { [key: string]: any }) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <MNgoImageAnnotate
            image={"https://tinypng.com/images/social/website.jpg"} //"https://tinypng.com/images/social/website.jpg"
            width={annotationData.width}
            loader={"loading"}
            error={"something went wrong"}
            shapes={{
                tick: tickImg,
                cross: crossImg,
            }}
            annotationData={annotationData.annotations}
            onChange={handleChange}
        />
    )
}