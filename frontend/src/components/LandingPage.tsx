import { useNavigate } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { Navbar } from './landing/Navbar'
import { Hero } from './landing/Hero'
import { Marquee } from './landing/Marquee'
import { CircleDivider } from './landing/CircleDivider'
import { Features } from './landing/Features'
import { CtaSection } from './landing/CtaSection'
import { Footer } from './landing/Footer'

export default function LandingPage() {
  const navigate = useNavigate()
  useReveal()

  const go = (path: string) => navigate(path)

  return (
    <div className="bg-surface text-text-primary min-h-screen relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute top-[-15%] right-[-10%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(5,150,105,0.07)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(176,137,71,0.05)_0%,transparent_55%)] pointer-events-none z-0" />

      <Navbar onNavigate={go} />
      <Hero onNavigate={go} />
      <Marquee />
      <CircleDivider />
      <Features />
      <CtaSection onNavigate={go} />
      <Footer />
    </div>
  )
}
