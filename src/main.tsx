import React from "react";
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "./lib";

import tickShape from "./tickShape.svg";
import crossShape from "./crossShape.svg";
import qstnShape from "./qstnShape.svg";
import img from "./img.jpg";

function blobToBase64(blob: any): any {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

const annotationData = JSON.parse(localStorage.getItem("annotData") || "{}");
const annotImg = localStorage.getItem("annotImg");

function Main() {
    function handleChange(annotData: { [key: string]: any }) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <>
            <div style={{ background: "#f1f1f1", height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <label>Upload Image
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
            </div>
            <br />

            <MNgoImageAnnotate
                // compMaxHeight={"calc(100vh)"}
                image={annotImg || img} //"https://tinypng.com/images/social/website.jpg"
                // loc={[0, 857, 1620, 1825]}
                imgWidth={annotationData.imgWidth || window.innerWidth - 20}
                textInputField={(textInputVal, setTextInputVal) => {
                    return (
                        <textarea
                            autoFocus
                            className="sa-h-[50px] sa-w-[95%] sa-resize-none sa-border-[lightgrey] sa-shadow-md sa-rounded-md"
                            value={textInputVal}
                            onChange={(e) => setTextInputVal(e.target.value)}
                        />
                    )
                }}
                shapes={{
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
