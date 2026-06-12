import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Manifesto from './Manifesto.tsx'
import AboutUs from './AboutUs.tsx'

const path = window.location.pathname
const Root = path === '/manifesto' ? Manifesto : path === '/about' ? AboutUs : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
