'use client';

import React, { useEffect, useState } from "react";
import { MNgoImageAnnotate } from "../library/dist/index.js";
import UploadButton from "./UploadButton";

import squareShape from "./squareShape.svg";
import rectShape from "./rectShape.svg";
import circleShape from "./circleShape.svg";
import dbShape from "./dbShape.svg";
import cloudShape from "./cloudShape.svg";
import houseShape from "./houseShape.svg";
import tickShape from "./tickShape.svg";
import crossShape from "./crossShape.svg";
import qstnShape from "./qstnShape.svg";
import lightImg from "./img.jpg";
import darkImg from "./img2.jpg";

function getAssetSrc(asset: any): string {
    if (typeof asset === "string") return asset;
    if (asset && typeof asset === "object" && asset.src) return asset.src;
    return String(asset || "");
}

function blobToBase64(blob: any): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

const btnStyle = {
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 23,
    padding: "0px 10px",
    borderRadius: 5,
    cursor: "pointer",
    border: "0.5px solid #ccc",
    background: "white",
    minWidth: "fit-content"
};

const btnWrapperStyle = {
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
    overflow: "auto"
};

const COMP_IDX = 0, FRAME_ID = "frame";

export default function Page() {
    const [hasMounted, setHasMounted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [activeTabId, setActiveTabId] = useState<string>("");
    const [annotData, setAnnotData] = useState<{ [key: string]: any }>({});
    const [annotImg, setAnnotImg] = useState<string | null>(null);

    useEffect(() => {
        const ts = new Date().getTime();
        const storedIsDark = localStorage.getItem("isDark") === "true";
        const storedAnnotImg = localStorage.getItem("annotImg");
        const storedTabs = JSON.parse(localStorage.getItem("tabsAnnotData") || `{"${ts}":{}}`);
        const lastActiveTabId = localStorage.getItem("activeTabId") || Object.keys(storedTabs)[0];

        setIsDarkMode(storedIsDark);
        setAnnotImg(storedAnnotImg);
        setAnnotData(storedTabs);
        setActiveTabId(lastActiveTabId);
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;
        document.body.style.background = isDarkMode ? "rgb(15 23 42)" : "#f1f1f1";
        localStorage.setItem("isDark", String(isDarkMode));
    }, [isDarkMode, hasMounted]);

    useEffect(() => {
        if (!hasMounted || !activeTabId) return;
        setIsLoading(true);
        const timer = setTimeout(() => { setIsLoading(false) }, 100);
        localStorage.setItem("activeTabId", activeTabId);
        return () => clearTimeout(timer);
    }, [activeTabId, hasMounted]);

    function handleChange(annots: { [key: string]: any }) {
        const newAnnotData = { ...annotData, [activeTabId]: annots };
        setAnnotData(newAnnotData);
        localStorage.setItem("tabsAnnotData", JSON.stringify(newAnnotData));
    }

    function captureSS() {
        try {
            // @ts-ignore
            if (typeof window !== "undefined" && window.html2canvas) {
                // @ts-ignore
                window.html2canvas(document.getElementById(FRAME_ID + COMP_IDX) || document.body)
                    .then(function (canvas: any) {
                        const dataURL = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                        const link = document.createElement("a");
                        link.setAttribute('download', `MNgoImageAnnotate-${new Date().getTime()}.png`);
                        link.setAttribute('href', dataURL);
                        link.click();
                    })
                    .catch((e: any) => { console.log("failed to capture screenshot", e); });
            }
        } catch (e) { console.log("failed to capture screenshot", e); }
    }

    if (!hasMounted) {
        return null;
    }

    const currentImg = annotImg || (isDarkMode ? getAssetSrc(darkImg) : getAssetSrc(lightImg));
    const currentWidth = annotData[activeTabId]?.imgWidth || (typeof window !== "undefined" ? window.innerWidth - 20 : 900);
    const currentMaxHeight = typeof window !== "undefined" ? `${window.innerHeight - 65}px` : "calc(100vh)";

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
                            localStorage.setItem("annotImg", base64Img);
                            setAnnotImg(base64Img);
                        }
                    }}
                />

                <div role="button" style={{ ...btnStyle, margin: "0 50px" }} onClick={captureSS}>Save Image</div>

                <div role="button" style={btnStyle} onClick={() => setIsDarkMode(prev => !prev)}>{isDarkMode ? "Light" : "Dark"} Mode</div>
            </div>

            <div style={btnWrapperStyle}>
                {
                    Object.keys(annotData).map((tabId, idx) => (
                        <div
                            key={tabId} role="button"
                            style={{
                                ...btnStyle, marginRight: 10,
                                background: activeTabId === tabId ? "white" : "lightgrey", opacity: activeTabId === tabId ? 1 : 0.5
                            }}
                            onClick={() => setActiveTabId(tabId)}
                        >
                            <span style={{ fontSize: "90%" }}> {`tab ${idx + 1}`}</span>

                            {
                                idx > 0 && <div role="button"
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
                                            localStorage.setItem("tabsAnnotData", JSON.stringify(newAnnotData));

                                            if (tabId === activeTabId) setActiveTabId(prevTabId);

                                            return newAnnotData;
                                        });
                                    }}
                                ></div>
                            }
                        </div>
                    ))
                }

                <div style={btnStyle} role="button"
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
                        compMaxHeight={currentMaxHeight}
                        image={currentImg}
                        imgWidth={currentWidth}
                        shapes={{
                            square: { btnIcon: getAssetSrc(squareShape), img: getAssetSrc(squareShape) },
                            rect: { btnIcon: getAssetSrc(rectShape), img: getAssetSrc(rectShape) },
                            circle: { btnIcon: getAssetSrc(circleShape), img: getAssetSrc(circleShape) },
                            db: { btnIcon: getAssetSrc(dbShape), img: getAssetSrc(dbShape) },
                            cloudShape: { btnIcon: getAssetSrc(cloudShape), img: getAssetSrc(cloudShape) },
                            houseShape: { btnIcon: getAssetSrc(houseShape), img: getAssetSrc(houseShape) },
                            tick: { btnIcon: getAssetSrc(tickShape), img: getAssetSrc(tickShape) },
                            cross: { btnIcon: getAssetSrc(crossShape), img: getAssetSrc(crossShape) },
                            question: { btnIcon: getAssetSrc(qstnShape), img: getAssetSrc(qstnShape) },
                        }}
                        annotations={annotData[activeTabId]?.annotations || []}
                        onChange={handleChange}
                    />
            }
        </>
    );
}
