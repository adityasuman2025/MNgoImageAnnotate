import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// @ts-ignore
import MNgoImageAnnotate from "../dist/index.es.js";

function App() {
  return (
    <MNgoImageAnnotate />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
