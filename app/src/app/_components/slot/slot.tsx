import * as React from "react"
import { useState, useEffect } from "react"
import type { ParkingSlot } from "@prisma/client"

const Slot = ({ slot }: { slot: ParkingSlot }) => {
  const isAvailable = Boolean(slot.available)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setActive(false), 1200)
    return () => clearTimeout(t)
  }, [active])

  const handleActivate = () => setActive(true)

  return (
    <article
      aria-live="polite"
      aria-pressed={active}
      onClick={handleActivate}
      onTouchStart={handleActivate}
      className={`relative min-w-[180px] sm:min-w-[220px] p-3 rounded-xl transition-all duration-300 overflow-hidden isolate ${
        isAvailable ? 'bg-linear-to-b from-green-50 to-white border border-green-200' : 'bg-linear-to-b from-red-50 to-white border border-red-200'
      } ${active ? 'scale-[1.03] shadow-2xl z-10' : 'shadow-sm'}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-full h-16 rounded-md flex items-center justify-center text-xs font-medium tracking-wide text-slate-700 shadow-inner group cursor-pointer relative overflow-hidden`
          }
          style={{
            background: isAvailable ? 'linear-gradient(180deg,#ecfdf5,#ffffff)' : 'linear-gradient(180deg,#fff1f2,#ffffff)'
          }}
          title={isAvailable ? 'Slot disponible' : 'Slot ocupado'}
        >
          {/* playful confetti when active (SMIL) */}
          {active && (
            <svg className="absolute -top-8 left-0 w-40 h-12 pointer-events-none" viewBox="0 0 160 48" fill="none">
              <g>
                <rect x="8" y="14" width="4" height="4" rx="1" fill="#f97316">
                  <animate attributeName="y" values="14;2;14" dur="0.9s" repeatCount="1" />
                  <animate attributeName="opacity" values="1;0;0" dur="0.9s" repeatCount="1" />
                </rect>
                <rect x="36" y="12" width="3" height="3" rx="0.5" fill="#06b6d4">
                  <animate attributeName="y" values="12;0;12" dur="1s" repeatCount="1" />
                  <animate attributeName="opacity" values="1;0;0" dur="1s" repeatCount="1" />
                </rect>
                <rect x="68" y="10" width="4" height="4" rx="1" fill="#34d399">
                  <animate attributeName="y" values="10;-6;10" dur="0.8s" repeatCount="1" />
                  <animate attributeName="opacity" values="1;0;0" dur="0.8s" repeatCount="1" />
                </rect>
                <rect x="104" y="14" width="3" height="3" rx="0.5" fill="#7c3aed">
                  <animate attributeName="y" values="14;4;14" dur="1.1s" repeatCount="1" />
                  <animate attributeName="opacity" values="1;0;0" dur="1.1s" repeatCount="1" />
                </rect>
              </g>
            </svg>
          )}

          {/* 3D-like car (isometric feel) - kept compact so it doesn't overflow neighbours */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40" className={`w-28 h-10 transform transition-transform duration-700 ${active ? 'translate-x-4 -translate-y-1 scale-[1.02]' : 'group-hover:translate-x-2'}`}>
            <defs>
              <linearGradient id={`car3-top-${slot.id}`} x1="0" x2="1">
                <stop offset="0%" stopColor={isAvailable ? '#34d399' : '#ef4444'} />
                <stop offset="100%" stopColor={isAvailable ? '#10b981' : '#b91c1c'} />
              </linearGradient>
              <linearGradient id={`car3-side-${slot.id}`} x1="0" x2="1">
                <stop offset="0%" stopColor={isAvailable ? '#059669' : '#dc2626'} />
                <stop offset="100%" stopColor={isAvailable ? '#065f46' : '#7f1d1d'} />
              </linearGradient>
            </defs>

            {/* shadow */}
            <ellipse cx="40" cy="36" rx="20" ry="3" fill="rgba(2,6,23,0.12)" style={{ transition: 'opacity 300ms ease, transform 300ms ease' }} />

            {/* car top (roof) - lighter */}
            <rect x="18" y="8" rx="3" ry="3" width="44" height="10" fill={`url(#car3-top-${slot.id})`} />

            {/* car side to give '3D' effect */}
            <polygon points="18,18 62,18 70,24 10,24" fill={`url(#car3-side-${slot.id})`} />

            {/* windows */}
            <rect x="26" y="10" width="18" height="6" rx="1" fill="rgba(255,255,255,0.75)" />

            {/* wheels */}
            <g>
              <g transform="translate(26,30)">
                <circle r="3" fill="#0b1220" />
                {active && <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 0 0" to="360 0 0" dur="0.6s" repeatCount="indefinite" />}
              </g>
              <g transform="translate(54,30)">
                <circle r="3" fill="#0b1220" />
                {active && <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 0 0" to="360 0 0" dur="0.6s" repeatCount="indefinite" />}
              </g>
            </g>
          </svg>
        </div>

        <div className="w-full text-center">
          <div className="text-sm font-semibold text-slate-800">Slot</div>
          <div className="mt-1 inline-block px-2 py-0.5 rounded-md text-sm font-bold" style={{ background: isAvailable ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.12)', color: isAvailable ? '#065f46' : '#7f1d1d' }}>#{slot.id}</div>
        </div>
      </div>

      {/* Status and meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {isAvailable ? (
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {isAvailable ? 'Disponible' : 'Ocupado'}
          </span>
        </div>
      </div>

        {/* Occupied pulse ring (different color/animation) */}
        {!isAvailable ? (
          <span aria-hidden className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 18px rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.08)', animation: 'pulse 1.8s infinite' }} />
        ) : (
          <span aria-hidden className="absolute -top-2 -right-2 w-3 h-3 rounded-full" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.28)', background: '#10b981' }} />
        )}

        <style>{`@keyframes pulse{0%{box-shadow:0 0 6px rgba(239,68,68,0.12)}50%{box-shadow:0 0 18px rgba(239,68,68,0.22)}100%{box-shadow:0 0 6px rgba(239,68,68,0.12)}}`}</style>
    </article>
  )
}

export default Slot