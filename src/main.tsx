import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { toPng } from 'html-to-image';
import { createRoot } from 'react-dom/client';
import "./index.css";
import rectIcon from "./assets/rectShape.svg";
import circleIcon from "./assets/circleShape.svg";
import squareIcon from "./assets/squareShape.svg";
import cloudIcon from "./assets/cloudShape.svg";
import crossIcon from "./assets/crossShape.svg";
import tickIcon from "./assets/tickShape.svg";
import qstnIcon from "./assets/qstnShape.svg";
import houseIcon from "./assets/houseShape.svg";
import dbIcon from "./assets/dbShape.svg";
import arrowIcon from "./assets/arrowShape.svg";
import starIcon from "./assets/starShape.svg";
import alertIcon from "./assets/alertShape.svg";
import pinIcon from "./assets/pinShape.svg";
import commentIcon from "./assets/commentShape.svg";
import serverIcon from "./assets/serverShape.svg";
import loadBalancerIcon from "./assets/loadBalancerShape.svg";
import queueIcon from "./assets/queueShape.svg";
import cacheIcon from "./assets/cacheShape.svg";
import gatewayIcon from "./assets/gatewayShape.svg";

// @ts-ignore
// import MNgoImageAnnotate from "../dist/index.es.js";
// import type { Tool, AnnotationData } from "../dist/types";

import MNgoImageAnnotate from "../library/MNgoImageAnnotate";
import type { Tool, AnnotationData } from "../library/types";

// indexedDB helper for image storage
const DB_NAME = "mngo_annotate_db";
const STORE_NAME = "images";
const IMAGE_KEY = "uploaded_background";

function openImageDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveImageToDB(dataUrl: string): Promise<void> {
    const db = await openImageDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(dataUrl, IMAGE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getImageFromDB(): Promise<string | null> {
    const db = await openImageDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(IMAGE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}


// hooks, utils
function useLocalStorage<T>(key: string, defaultData: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        let stateData: T;
        try {
            const storageData = localStorage.getItem(key);
            stateData = storageData ? JSON.parse(storageData) : defaultData;
        } catch (e) {
            stateData = defaultData;
        }

        return stateData
    });

    const isInitalMountRef = useRef(true);
    useEffect(() => {
        if (isInitalMountRef.current) {
            isInitalMountRef.current = false;
            return;
        }

        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch { }
    }, [state, key]);

    return [state, setState];
}


// constants
const CUSTOM_TOOLS: Tool[] = [
    // 1. Geometric Shapes
    {
        name: "rectangle",
        btnIcon: <img src={rectIcon} alt="Rectangle" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "square",
        btnIcon: <img src={squareIcon} alt="Square" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "circle",
        btnIcon: <img src={circleIcon} alt="Circle" className="w-4 h-4" draggable={false} />,
    },

    // 2. Pointers, Markers & Status Indicators
    {
        name: "arrow",
        btnIcon: <img src={arrowIcon} alt="Arrow" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "pin",
        btnIcon: <img src={pinIcon} alt="Pin" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "comment",
        btnIcon: <img src={commentIcon} alt="Comment" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "star",
        btnIcon: <img src={starIcon} alt="Star" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "alert",
        btnIcon: <img src={alertIcon} alt="Alert" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "tick",
        btnIcon: <img src={tickIcon} alt="Tick" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "cross",
        btnIcon: <img src={crossIcon} alt="Cross" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "question",
        btnIcon: <img src={qstnIcon} alt="Question" className="w-4 h-4" draggable={false} />,
    },

    // 3. System Design & Infrastructure
    {
        name: "cloud",
        btnIcon: <img src={cloudIcon} alt="Cloud" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "gateway",
        btnIcon: <img src={gatewayIcon} alt="API Gateway" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "load-balancer",
        btnIcon: <img src={loadBalancerIcon} alt="Load Balancer" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "server",
        btnIcon: <img src={serverIcon} alt="Server" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "queue",
        btnIcon: <img src={queueIcon} alt="Message Queue" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "cache",
        btnIcon: <img src={cacheIcon} alt="Cache" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "database",
        btnIcon: <img src={dbIcon} alt="Database" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "house",
        btnIcon: <img src={houseIcon} alt="House" className="w-4 h-4" draggable={false} />,
    },
];
const DUMMY_ANNOTATION_DATA: AnnotationData = {
    "annotationIds": [
        "1d9bce18-c35f-4f02-9ca5-b170c3815c6d",
        "67235752-cad1-4919-847f-b3b8edd58fcd",
        "4c3c0de6-c879-473c-92ab-5c16cf851dc0"
    ],
    "annotations": {
        "1d9bce18-c35f-4f02-9ca5-b170c3815c6d": {
            "id": "1d9bce18-c35f-4f02-9ca5-b170c3815c6d",
            "name": "cross",
            "zIndex": 1,
            "pos": {
                "x": 550.3807692307693,
                "y": 410.6071196593534
            },
            "dimensions": {
                "width": 100,
                "height": 100
            },
            "rotation": 13
        },
        "67235752-cad1-4919-847f-b3b8edd58fcd": {
            "id": "67235752-cad1-4919-847f-b3b8edd58fcd",
            "name": "database",
            "zIndex": 2,
            "pos": {
                "x": 1014.1730769230769,
                "y": 703.7587417003465
            },
            "dimensions": {
                "width": 40,
                "height": 40
            },
            "rotation": 0
        },
        "4c3c0de6-c879-473c-92ab-5c16cf851dc0": {
            "id": "4c3c0de6-c879-473c-92ab-5c16cf851dc0",
            "name": "house",
            "zIndex": 3,
            "pos": {
                "x": 27.873076923076923,
                "y": 511.1165469832564
            },
            "dimensions": {
                "width": 40,
                "height": 40
            },
            "rotation": 0
        }
    },
    "highestZIndex": 3
};
const EMPTY_ANNOTATION_DATA: AnnotationData = { annotationIds: [], annotations: {}, highestZIndex: 0 };
const ANNOTATION_DATA_KEY = "mngo_annotation_data";


// component
function App() {
    const [isDBChecked, setIsDBChecked] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
    const [annotationData, setAnnotationData] = useLocalStorage<AnnotationData>(ANNOTATION_DATA_KEY, { ...EMPTY_ANNOTATION_DATA });
    const [isDownloading, setIsDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        getImageFromDB()
            .then((saved) => {
                if (saved) setImgSrc(saved);
            })
            .finally(() => setIsDBChecked(true));
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            setImgSrc(dataUrl);
            await saveImageToDB(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleAnnotationDataChange = useCallback((newData: AnnotationData) => {
        setAnnotationData(newData);
    }, []);

    const handleDownloadImage = async () => {
        const groundEl = document.querySelector('[data-ground]') as HTMLElement | null;
        if (!groundEl) return;

        setIsDownloading(true);
        try {
            const bgImgEl = groundEl.querySelector('img[alt="Annotation image"]') as HTMLImageElement | null;
            const width = bgImgEl?.naturalWidth || groundEl.clientWidth;
            const height = bgImgEl?.naturalHeight || groundEl.clientHeight;
            if (!width || !height) return;

            // 1. Render live ground annotations to an image using html-to-image
            const groundDataUrl = await toPng(groundEl, {
                pixelRatio: width / groundEl.clientWidth,
                cacheBust: false,
                filter: (node) => {
                    // Exclude selection handles/overlay
                    if (node instanceof HTMLElement && node.dataset.selectionOverlay !== undefined) {
                        return false;
                    }
                    // If no bg image, exclude the grid background div so export stays transparent
                    if (!bgImgEl && node instanceof HTMLElement && node.classList.contains('flex-1')) {
                        return false;
                    }
                    return true;
                },
            });

            const freeDrawCanvas = groundEl.querySelector('canvas[data-free-draw-canvas]') as HTMLCanvasElement | null;

            // 2. Draw background image first onto canvas (if available; otherwise transparent)
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = width;
            exportCanvas.height = height;
            const ctx = exportCanvas.getContext('2d');
            if (!ctx) return;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (bgImgEl?.complete) {
                ctx.drawImage(bgImgEl, 0, 0, width, height);
            }

            // Draw freehand strokes directly
            if (freeDrawCanvas) {
                ctx.drawImage(freeDrawCanvas, 0, 0, width, height);
            }

            // Draw annotations on top
            const annotationsImg = new Image();
            await new Promise<void>((resolve, reject) => {
                annotationsImg.onload = () => {
                    ctx.drawImage(annotationsImg, 0, 0, width, height);
                    resolve();
                };
                annotationsImg.onerror = reject;
                annotationsImg.src = groundDataUrl;
            });

            const link = document.createElement('a');
            link.download = `annotated-image-${Date.now()}.png`;
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to download annotated image', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shadow-xs z-10">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-800 tracking-tight">MNgo Image Annotator</span>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                        Upload Image
                    </button>
                    <button
                        type="button"
                        disabled={isDownloading}
                        onClick={handleDownloadImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-300 rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? 'Exporting...' : 'Download Image'}
                    </button>
                </div>
            </header>

            <main className="flex flex-col mt-8 mx-8 rounded-xl overflow-hidden" style={{ height: `calc(100dvh - 80px)` }}>
                {isDBChecked && (
                    <MNgoImageAnnotate
                        imgSrc={imgSrc}
                        tools={CUSTOM_TOOLS}
                        annotationData={annotationData}
                        onAnnotationDataChange={handleAnnotationDataChange}
                    />
                )}
            </main>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
