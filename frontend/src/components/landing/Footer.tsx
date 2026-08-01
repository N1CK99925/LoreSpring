export const Footer = () => (
  <footer className="border-t border-border-subtle py-9 px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 max-w-[1180px] mx-auto">
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">lorespring // 2026</span>
    <ul className="flex gap-6 list-none">
      {['GitHub', 'Docs', 'Twitter'].map(item => (
        <li key={item}>
          <a href="#" className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted no-underline transition-colors hover:text-emerald-700">{item}</a>
        </li>
      ))}
    </ul>
  </footer>
)
