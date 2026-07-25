import { useCallback } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Features } from './Features';
import { Marquee } from './Marquee';
import { CtaSection } from './CtaSection';
import { Footer } from './Footer';

export const LandingPage = () => {
  const handleNavigate = useCallback((path: string) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = path;
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar onNavigate={handleNavigate} />

      <main className="flex-1">
        <Hero onNavigate={handleNavigate} />
        <Marquee />
        <Features />
        <CtaSection onNavigate={handleNavigate} />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;