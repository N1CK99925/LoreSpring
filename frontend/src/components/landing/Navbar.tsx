interface NavbarProps {
  onNavigate?: (path: string) => void
}

export const Navbar = ({ onNavigate }: NavbarProps) => (
  <nav className="flex items-center justify-between px-6 md:px-12 py-6 relative z-10 border-b border-border-subtle max-w-[1400px] mx-auto">
    <a href="#" className="flex items-center gap-3 no-underline" onClick={(e) => { e.preventDefault(); onNavigate?.('/dashboard') }}>
      <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-8 h-8 md:w-10 md:h-10 object-contain anim-float" />
      <span className="font-serif text-[22px] md:text-[26px] font-bold text-emerald-800 tracking-[0.06em]">LoreSpring</span>
    </a>
    <ul className="desktop-only flex gap-2 list-none">
      {['Features', 'Docs'].map(item => (
        <li key={item}>
          <a href={`#${item.toLowerCase()}`} className="text-text-secondary no-underline text-sm font-normal px-4 py-2 rounded-md transition-all duration-250 hover:text-emerald-700 hover:bg-emerald-700/6">
            {item}
          </a>
        </li>
      ))}
      <li>
        <a href="/pipeline"
          onClick={(e) => { e.preventDefault(); onNavigate?.('/pipeline') }}
          className="text-text-secondary no-underline text-sm font-normal px-4 py-2 rounded-md transition-all duration-250 hover:text-emerald-700 hover:bg-emerald-700/6">
          Pipeline
        </a>
      </li>
    </ul>
    <button className="bg-emerald-700 text-white border-none px-5 md:px-6 py-2.5 rounded-md text-xs md:text-sm font-medium cursor-pointer transition-all duration-250 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(5,150,105,0.2)]"
      onClick={() => onNavigate?.('/login')}>
      Get Started
    </button>
  </nav>
)
