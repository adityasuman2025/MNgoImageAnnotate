import { createRoot } from 'react-dom/client'
// import './index.css'
import MNgoImageAnnotate from './MNgoImageAnnotate';

function App() {
    return (
        <MNgoImageAnnotate />
    )
}

createRoot(document.getElementById('root')!).render(<App />)