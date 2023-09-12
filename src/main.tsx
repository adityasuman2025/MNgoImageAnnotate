import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "./lib";

import squareShape from "./squareShape.svg";
import rectShape from "./rectShape.svg"; // ref: https://www.svgviewer.dev/s/500644/cloud
import circleShape from "./circleShape.svg";
import dbShape from "./dbShape.svg";
import cloudShape from "./cloudShape.svg";
import houseShape from "./houseShape.svg";
import tickShape from "./tickShape.svg";
import crossShape from "./crossShape.svg";
import qstnShape from "./qstnShape.svg";

import lightImg from "./img.jpg";
import darkImg from "./img2.jpg";


function blobToBase64(blob: any): any {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

const annotationData = JSON.parse(localStorage.getItem("annotData") || "{}");
const annotImg = localStorage.getItem("annotImg");
const isDark = localStorage.getItem("isDark");
const COMP_IDX = 0, FRAME_ID = "frame";

function Main() {
    const [isDarkMode, setIsDarkMode] = useState(isDark === "true" ? true : false);

    useEffect(() => {
        document.body.style.background = isDarkMode ? "rgb(15 23 42)" : "#f1f1f1";

        localStorage.setItem("isDark", String(isDarkMode)); //storing annotations in localStorage
    }, [isDarkMode]);

    function handleChange(annotData: { [key: string]: any }) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    function captureSS() {
        try {
            //@ts-ignore
            html2canvas(document.getElementById(FRAME_ID + COMP_IDX) || document.body)
                .then(function (canvas: any) {
                    const dataURL = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

                    var link = document.createElement("a");
                    link.setAttribute('download', `MNgoImageAnnotate-${new Date().getTime()}.png`);
                    link.setAttribute('href', dataURL);
                    link.click();
                })
                .catch((e: any) => { console.log("failed to capture screenshot", e) });
        } catch (e) { console.log("failed to capture screenshot", e); }
    }

    return (
        <>
            <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <label>
                    <span style={{ color: "grey" }}>Upload Image </span>
                    <input type="file" name="uploadImage"
                        accept="image/png, image/gif, image/jpeg"
                        onChange={async (e) => {
                            const file = e?.target?.files?.[0];
                            if (file) {
                                const base64Img = await blobToBase64(file);

                                localStorage.setItem("annotImg", base64Img); // storing image in localStorage
                                location.reload();
                            }
                        }}
                    />
                </label>

                <button onClick={captureSS}>Save Image</button>

                <div style={{ marginLeft: 100 }}>
                    <button onClick={() => setIsDarkMode(prev => !prev)}>
                        {isDarkMode ? "light" : "dark"} mode
                    </button>
                </div>
            </div>

            <MNgoImageAnnotate
                compIdx={COMP_IDX}
                compMaxHeight={(window.innerHeight - 50 + 'px') || "calc(100vh)"}
                image={annotImg || (isDarkMode ? darkImg : lightImg)} //"https://tinypng.com/images/social/website.jpg"
                // loc={[0, 857, 1620, 1825]}
                imgWidth={annotationData.imgWidth || window.innerWidth - 20}

                // isDarkMode={isDarkMode}

                shapes={{
                    square: { btnIcon: squareShape, img: squareShape },
                    rect: { btnIcon: rectShape, img: rectShape },
                    circle: { btnIcon: circleShape, img: circleShape },
                    db: { btnIcon: dbShape, img: dbShape },
                    cloudShape: { btnIcon: cloudShape, img: cloudShape },
                    houseShape: { btnIcon: houseShape, img: houseShape },
                    tick: { btnIcon: tickShape, img: tickShape },
                    cross: { btnIcon: crossShape, img: crossShape },
                    question: { btnIcon: qstnShape, img: qstnShape },

                }}
                annotations={annotationData.annotations}
                onChange={handleChange}
            />
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />)
