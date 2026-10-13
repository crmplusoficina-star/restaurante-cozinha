import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Operation from './Operation'
import './index.css'
createRoot(document.getElementById('root')!).render(<StrictMode><Operation /></StrictMode>)
