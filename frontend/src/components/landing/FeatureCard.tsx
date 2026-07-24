interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  featured?: boolean
  featuredImage?: string
  delay?: number
}

export const FeatureCard = ({ title, description, icon, featured, featuredImage, delay = 0 }: FeatureCardProps) => (
  <div className={`bg-surface-card border border-border-subtle rounded-xl p-10 transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group reveal ${featured ? 'col-span-2 grid grid-cols-[auto_1fr] gap-8 items-center bg-surface-muted border-emerald-700/15' : ''} ${delay ? `reveal-delay-${delay}` : ''}`}>
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" />
    <div className="absolute inset-0 opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" style={{ boxShadow: '0 12px 40px rgba(5,150,105,0.08)' }} />
    <div className="hover:border-border-hover hover:-translate-y-1 relative z-[1]">
      {featured && featuredImage && (
        <img src={featuredImage} alt={title} className="w-[100px] h-[100px] object-contain" />
      )}
      {icon && (
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5 bg-emerald-700/8 transition-all duration-300 group-hover:bg-emerald-700 group-hover:scale-105">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-[22px] font-bold text-text-primary mb-2.5">{title}</h3>
      <p className="text-sm leading-[1.6] text-text-secondary">{description}</p>
    </div>
  </div>
)
