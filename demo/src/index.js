import React from 'react';
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "react-image-annotate-mngo";

import crossImg from "./cross.png";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnnotationWrapper />);


function AnnotationWrapper({
    annotationData = JSON.parse(localStorage.getItem("annotData") || "{}"),
}) {
    function handleChange(annotData) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <MNgoImageAnnotate
            image={"https://tinypng.com/images/social/website.jpg"}
            width={annotationData.width}
            shapes={{
                cross: { crossImg: crossShape, img: crossImg }
            }}
            annotations={annotationData.annotations}
            onChange={handleChange}
        />
    )
}