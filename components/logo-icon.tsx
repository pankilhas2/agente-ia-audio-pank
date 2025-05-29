export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gradiente mais forte */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Círculo principal com preenchimento */}
        <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="4" fill="url(#fillGradient)" />

        {/* Cabeça do agente */}
        <circle cx="50" cy="40" r="18" stroke="#06b6d4" strokeWidth="3" fill="rgba(6, 182, 212, 0.2)" />

        {/* Olhos mais visíveis */}
        <circle cx="44" cy="37" r="3" fill="#06b6d4" />
        <circle cx="56" cy="37" r="3" fill="#06b6d4" />

        {/* Boca */}
        <path d="M 42 45 Q 50 50 58 45" stroke="#06b6d4" strokeWidth="2" fill="none" />

        {/* Fones de ouvido mais grossos */}
        <path d="M 25 40 Q 32 25 50 25 Q 68 25 75 40" stroke="#a855f7" strokeWidth="4" fill="none" />
        <circle cx="27" cy="40" r="6" fill="#a855f7" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="73" cy="40" r="6" fill="#a855f7" stroke="#06b6d4" strokeWidth="2" />

        {/* Ondas sonoras mais visíveis */}
        <path d="M 10 30 Q 18 40 10 50" stroke="#a855f7" strokeWidth="3" fill="none" />
        <path d="M 5 25 Q 15 40 5 55" stroke="#8b5cf6" strokeWidth="2" fill="none" />

        <path d="M 90 30 Q 82 40 90 50" stroke="#a855f7" strokeWidth="3" fill="none" />
        <path d="M 95 25 Q 85 40 95 55" stroke="#8b5cf6" strokeWidth="2" fill="none" />

        {/* Elementos de IA mais visíveis */}
        <circle cx="75" cy="20" r="2" fill="#06b6d4" />
        <circle cx="82" cy="25" r="2" fill="#a855f7" />
        <circle cx="78" cy="30" r="2" fill="#06b6d4" />

        {/* Linhas de conexão */}
        <path d="M 75 20 L 78 25 L 82 25" stroke="#06b6d4" strokeWidth="2" />
        <path d="M 78 27 L 78 30" stroke="#a855f7" strokeWidth="2" />

        {/* Corpo */}
        <path d="M 30 70 Q 50 80 70 70" stroke="#06b6d4" strokeWidth="3" fill="none" />
      </svg>
    </div>
  )
}
