/* ──────────────────────────────────────────────
   1. Constellation — scattered stars + connecting lines
   Use in: Hero only
   ────────────────────────────────────────────── */
export function Constellation({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M40 44L112 82M112 82L72 150M112 82L182 118M182 118L224 208M182 118L300 68M224 208L282 240M300 68L342 158M342 158L282 240" className="text-amber-900/25" />
      <path d="M96 60L182 118M182 118L336 96" className="text-emerald-800/25" />
      <circle cx="40" cy="44" r="3" className="fill-amber-800/40" />
      <circle cx="112" cy="82" r="3" className="fill-amber-800/50" />
      <circle cx="72" cy="150" r="2" className="fill-amber-800/40" />
      <circle cx="182" cy="118" r="3.5" className="fill-emerald-700/50" />
      <circle cx="224" cy="208" r="2.5" className="fill-emerald-700/40" />
      <circle cx="300" cy="68" r="3" className="fill-amber-800/40" />
      <circle cx="342" cy="158" r="2.5" className="fill-amber-800/40" />
      <circle cx="282" cy="240" r="2" className="fill-emerald-700/40" />
      <circle cx="96" cy="60" r="1.5" className="fill-emerald-700/40" />
      <circle cx="336" cy="96" r="1.5" className="fill-amber-800/30" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   2. RootedBranch — organic branching root/vine system
   Use in: Features section (grounds the "pipeline" narrative —
   a tree of connected agents)
   ────────────────────────────────────────────── */
export function RootedBranch({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M150 400C150 400 148 320 152 260C156 200 140 160 150 100" className="text-emerald-800/25" />
      <path d="M150 320C150 320 100 300 70 250" className="text-emerald-800/20" />
      <path d="M152 260C152 260 90 230 55 175" className="text-amber-900/20" />
      <path d="M150 180C150 180 105 150 85 95" className="text-emerald-800/20" />
      <path d="M150 300C150 300 195 275 220 215" className="text-amber-900/20" />
      <path d="M154 220C154 220 205 195 235 140" className="text-emerald-800/20" />
      <path d="M148 130C148 130 190 100 205 55" className="text-amber-900/20" />
      <circle cx="70" cy="250" r="3" className="fill-emerald-700/40" />
      <circle cx="55" cy="175" r="2.5" className="fill-amber-800/40" />
      <circle cx="85" cy="95" r="2" className="fill-emerald-700/35" />
      <circle cx="220" cy="215" r="3" className="fill-amber-800/40" />
      <circle cx="235" cy="140" r="2.5" className="fill-emerald-700/40" />
      <circle cx="205" cy="55" r="2" className="fill-amber-800/35" />
      <circle cx="150" cy="100" r="3.5" className="fill-emerald-700/50" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   3. ContourLines — topographic-style layered contours
   Use in: CtaSection (calmer, grounding close before conversion —
   contrasts with the busier star/branch motifs)
   ────────────────────────────────────────────── */
export function ContourLines({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M10 200C60 180 100 210 150 190C200 170 240 200 290 180C320 168 350 178 390 165" className="text-amber-900/20" />
      <path d="M10 160C70 145 110 170 165 150C215 132 255 158 300 142C335 130 360 138 390 128" className="text-emerald-800/20" />
      <path d="M10 120C65 108 115 128 170 112C220 97 260 118 305 105C338 95 362 102 390 93" className="text-emerald-800/15" />
      <path d="M10 80C60 70 105 88 155 75C200 63 245 80 285 70C320 62 355 68 390 60" className="text-amber-900/15" />
      <circle cx="150" cy="190" r="2" className="fill-emerald-700/30" />
      <circle cx="220" cy="97" r="2" className="fill-amber-800/30" />
      <circle cx="300" cy="142" r="1.5" className="fill-emerald-700/25" />
    </svg>
  )
}
