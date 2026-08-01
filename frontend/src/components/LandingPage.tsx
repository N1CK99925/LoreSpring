import { useNavigate } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { IslandNav } from './landing/Navbar'
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
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-surface text-text-primary">
      <div className="grain-overlay" />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="anim-drift absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-200/25 blur-[120px] will-change-transform" />
        <div className="anim-drift-delayed absolute -left-44 bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-200/20 blur-[120px] will-change-transform" />
      </div>

      <IslandNav onNavigate={go} variant="full" />

      <Hero onNavigate={go} />
      <Marquee />
      <CircleDivider />
      <Features />
      <CtaSection onNavigate={go} />
      <Footer />
    </div>
  )
}
