import React from "react";
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "./lib";

import tickShape from "./tickShape.svg";
import crossShape from "./crossShape.svg";
import qstnShape from "./qstnShape.svg";

import img from "./img.png";
const img2 = "https://s3.ap-south-1.amazonaws.com/blc-assessed-prd-ap-south-1/results/615aafe617b0c97a6adcecbb/21-22/CBSE/Homework/Homework-CBSE-IX-Mathematics-B10-05-07-2022-360090/IX/Mathematics/B10/input/img_aligned/cef8fabfe264aa58b7c95a36e2f56acf_68604_0049.jpg"

const annotationData = JSON.parse(localStorage.getItem("annotData") || "{}");
function Main() {
    function handleChange(annotData: { [key: string]: any }) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <MNgoImageAnnotate
            image={img} //"https://tinypng.com/images/social/website.jpg"
            width={annotationData.width}
            shapes={{
                tick: { btnIcon: tickShape, img: tickShape },
                cross: { btnIcon: crossShape, img: crossShape },
                question: { btnIcon: qstnShape, img: qstnShape },
            }}
            annotations={annotationData.annotations}
            onChange={handleChange}
        />
    )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />)
