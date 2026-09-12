import { createRoot } from 'react-dom/client';
import "./index.css";

// @ts-ignore
import MNgoImageAnnotate from "../library/MNgoImageAnnotate";
import type { Tool } from "../library/types";

import rectIcon from "./assets/rectShape.svg";
import circleIcon from "./assets/circleShape.svg";
import squareIcon from "./assets/squareShape.svg";
import cloudIcon from "./assets/cloudShape.svg";
import crossIcon from "./assets/crossShape.svg";
import tickIcon from "./assets/tickShape.svg";
import qstnIcon from "./assets/qstnShape.svg";
import houseIcon from "./assets/houseShape.svg";
import dbIcon from "./assets/dbShape.svg";

const customTools: Tool[] = [
    {
        name: "rectangle",
        btnIcon: <img src={rectIcon} alt="Rectangle" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "circle",
        btnIcon: <img src={circleIcon} alt="Circle" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "square",
        btnIcon: <img src={squareIcon} alt="Square" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "cloud",
        btnIcon: <img src={cloudIcon} alt="Cloud" className="w-4 h-4" draggable={false} />,
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
    {
        name: "house",
        btnIcon: <img src={houseIcon} alt="House" className="w-4 h-4" draggable={false} />,
    },
    {
        name: "database",
        btnIcon: <img src={dbIcon} alt="Database" className="w-4 h-4" draggable={false} />,
    },
];

function App() {
    return (
        <div className="bg-gray-100 min-h-dvh flex flex-col w-full">
            <MNgoImageAnnotate
                title="MNgo Image Annotator"
                imgSrc='https://camo.githubusercontent.com/5e45bc648dba68520ce949a53690af6bcef2880f84a1d46cbb1636649afd6d84/68747470733a2f2f796176757a63656c696b65722e6769746875622e696f2f73616d706c652d696d616765732f696d6167652d313032312e6a7067'
                tools={customTools}
            />
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
