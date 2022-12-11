import React from 'react';
import ReactDOM from 'react-dom';
import { MNgoImageAnnotate } from "./lib";

import img from "./img.png";
import tickImg from "./tick.png";
import crossImg from "./cross.png";

ReactDOM.render(
    <AnnotationWrapper />,
    document.getElementById('root')
);

function AnnotationWrapper({
    annotationData = JSON.parse(localStorage.getItem("annotData") || "{}"),
}) {
    function handleChange(annotData: { [key: string]: any }) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <MNgoImageAnnotate
            image={img} //"https://tinypng.com/images/social/website.jpg"
            width={annotationData.width || window.innerWidth - 100}
            loader={"loading"}
            error={"something went wrong"}
            shapes={{
                tick: tickImg,
                cross: crossImg,
            }}
            annotations={annotationData.annotations}
            onChange={handleChange}
        />
    )
}