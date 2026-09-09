import { createRoot } from 'react-dom/client'
// @ts-ignore
import MNgoImageAnnotate from "../dist/index.es.js";
import "./index.css";

function App() {
  return (
    <MNgoImageAnnotate />
  )
}

createRoot(document.getElementById('root')!).render(<App />);
