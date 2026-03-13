export default function SmoothLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-[#0a0b0e]">
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
                    <img src="/dhruva-logo.svg" alt="Dhruva" className="w-16 h-16 relative z-10" />
                </div>

                {/* Brand name */}
                <div className="text-center">
                    <p className="font-bold text-lg tracking-wider text-amber-100">DHRUVA</p>
                    <p className="text-xs text-zinc-600">Track. Prepare. Excel.</p>
                </div>

                {/* Loader bar */}
                <div className="w-48 h-0.5 rounded-full overflow-hidden bg-zinc-800">
                    <div className="h-full rounded-full bg-amber-500"
                        style={{
                            animation: 'loader-slide 1.5s ease-in-out infinite',
                            width: '40%',
                        }} />
                </div>
            </div>

            <style>{`
        @keyframes loader-slide {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
        </div>
    )
}
