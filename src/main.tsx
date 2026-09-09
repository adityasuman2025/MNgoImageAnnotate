import { createRoot } from 'react-dom/client';
import "./index.css";

// @ts-ignore
// import MNgoImageAnnotate from "../dist/index.es.js";
import MNgoImageAnnotate from "../library/MNgoImageAnnotate";

function App() {
  return (
    <MNgoImageAnnotate />
  )
}

createRoot(document.getElementById('root')!).render(<App />);
