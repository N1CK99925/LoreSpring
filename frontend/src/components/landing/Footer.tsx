export const Footer = () => (
  <footer className="border-t border-border-subtle py-9 px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 max-w-[1400px] mx-auto">
    <span className="text-[13px] text-[#a09c94] font-mono">lorespring // 2026</span>
    <ul className="flex gap-6 list-none">
      {['GitHub', 'Docs', 'Twitter'].map(item => (
        <li key={item}>
          <a href="#" className="text-[13px] text-[#a09c94] no-underline transition-colors hover:text-emerald-700">{item}</a>
        </li>
      ))}
    </ul>
  </footer>
)
