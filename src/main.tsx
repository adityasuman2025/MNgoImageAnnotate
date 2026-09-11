import { createRoot } from 'react-dom/client';
import "./index.css";

// @ts-ignore
// import MNgoImageAnnotate from "../dist/index.es.js";
import MNgoImageAnnotate from "../library/MNgoImageAnnotate";

function App() {
    return (
        <div className="bg-gray-100 min-h-dvh flex flex-col w-full">
            <MNgoImageAnnotate
                imgSrc='https://camo.githubusercontent.com/5e45bc648dba68520ce949a53690af6bcef2880f84a1d46cbb1636649afd6d84/68747470733a2f2f796176757a63656c696b65722e6769746875622e696f2f73616d706c652d696d616765732f696d6167652d313032312e6a7067'
            />
        </div>
    )
}

createRoot(document.getElementById('root')!).render(<App />);
