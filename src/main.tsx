import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MNgoImageAnnotate from '../library/MNgoImageAnnotate'

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
