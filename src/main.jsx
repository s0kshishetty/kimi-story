import React from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.jsx'
import './styles/base.css'
import './styles/story.css'
import './styles/character.css'
import './styles/projects.css'
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
createRoot(document.getElementById('root')).render(<App />)
