import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import { MNgoImageAnnotate } from "./lib";
import UploadButton from "./UploadButton";

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

const ts = new Date().getTime();
const lastActiveTabId = localStorage.getItem("activeTabId");
const tabsAnnotationData = JSON.parse(localStorage.getItem("tabsAnnotData") || "{\"" + ts + "\":{}}");
const annotImg = localStorage.getItem("annotImg");
const isDark = localStorage.getItem("isDark");

const btnStyle = { display: "flex", alignItems: "center", justifyContent: "center", height: 23, padding: "0px 10px", borderRadius: 5, cursor: "pointer", border: "0.5px solid #ccc", background: "white", minWidth: "fit-content" };
const btnWrapperStyle = { height: 30, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100%", overflow: "auto" };
const COMP_IDX = 0, FRAME_ID = "frame";

function Main() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(isDark === "true" ? true : false);
    const [activeTabId, setActiveTabId] = useState<string>(lastActiveTabId || Object.keys(tabsAnnotationData)[0]);
    const [annotData, setAnnotData] = useState<{ [key: string]: any }>(tabsAnnotationData);

    useEffect(() => {
        document.body.style.background = isDarkMode ? "rgb(15 23 42)" : "#f1f1f1";

        localStorage.setItem("isDark", String(isDarkMode)); //storing isDark in localStorage
    }, [isDarkMode]);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false) }, 100);

        localStorage.setItem("activeTabId", activeTabId); //storing activeTabId in localStorage
    }, [activeTabId]);

    function handleChange(annots: { [key: string]: any }) {
        const newAnnotData = { ...annotData, [activeTabId]: annots };
        setAnnotData(newAnnotData);
        localStorage.setItem("tabsAnnotData", JSON.stringify(newAnnotData)); //storing annotations in localStorage
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
            <div style={btnWrapperStyle}>
                <UploadButton
                    btnText={"Upload Image"}
                    accept={"image/png, image/gif, image/jpeg"}
                    btnStyle={btnStyle}
                    onUpload={async (files = []) => {
                        const file = files?.[0];
                        if (file) {
                            const base64Img = await blobToBase64(file);

                            localStorage.setItem("annotImg", base64Img); // storing image in localStorage
                            location.reload();
                        }
                    }}
                />

                <button style={{ ...btnStyle, margin: "0 50px" }} onClick={captureSS}>Save Image</button>

                <button style={btnStyle} onClick={() => setIsDarkMode(prev => !prev)}>{isDarkMode ? "Light" : "Dark"} Mode</button>
            </div>

            <div style={btnWrapperStyle}>
                {
                    Object.keys(annotData).map((tabId, idx) => (
                        <div
                            key={tabId}
                            style={{
                                ...btnStyle, marginRight: 10,
                                background: activeTabId === tabId ? "white" : "lightgrey", opacity: activeTabId === tabId ? 1 : 0.5
                            }}
                            onClick={() => setActiveTabId(tabId)}
                        >
                            <span style={{ fontSize: "90%" }}> {`tab ${idx + 1}`}</span>

                            {
                                idx > 0 && <div
                                    style={{ cursor: "pointer", marginLeft: 10, borderRadius: "100%", width: 11, height: 11, background: "rgb(236, 104, 94)" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAnnotData(prevAnnotData => {
                                            let prevTabId: string = "", hasBeenFound = false;
                                            const newAnnotData = Object.keys(prevAnnotData).reduce((acc: any, key) => {
                                                if (key !== tabId) acc[key] = prevAnnotData[key];
                                                else hasBeenFound = true;

                                                if (!hasBeenFound) prevTabId = key;
                                                return acc;
                                            }, {});
                                            localStorage.setItem("tabsAnnotData", JSON.stringify(newAnnotData)); //storing annotations in localStorage

                                            if (tabId === activeTabId) setActiveTabId(prevTabId); // if deleting the active tab

                                            return newAnnotData;
                                        });
                                    }}
                                ></div>
                            }
                        </div>
                    ))
                }

                <div style={btnStyle}
                    onClick={() => {
                        const newTabId = String(new Date().getTime());
                        setAnnotData(prevAnnotData => ({ ...prevAnnotData, [newTabId]: {} }));
                        setActiveTabId(newTabId);
                    }}>+</div>
            </div>

            {
                isLoading ? "loading..." :
                    <MNgoImageAnnotate
                        isDarkMode={isDarkMode}

                        compIdx={COMP_IDX}
                        compMaxHeight={(window.innerHeight - 65 + 'px') || "calc(100vh)"}
                        // compMaxWidth={window.innerWidth}

                        image={annotImg || (isDarkMode ? darkImg : lightImg)} //"https://tinypng.com/images/social/website.jpg"
                        imgWidth={annotData[activeTabId]?.imgWidth || window.innerWidth - 20}
                        // loc={[0, 857, 1620, 1825]}

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
                        annotations={annotData[activeTabId]?.annotations || []}
                        onChange={handleChange}
                    />
            }
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />)
