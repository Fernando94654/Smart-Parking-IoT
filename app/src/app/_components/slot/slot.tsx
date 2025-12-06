import * as React from "react";
import { useState, useEffect } from "react";
import type { ParkingSlot } from "@prisma/client";

const Slot = ({ slot }: { slot: ParkingSlot }) => {
  const isAvailable = Boolean(slot.available);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 1200);
    return () => clearTimeout(t);
  }, [active]);

  const handleActivate = () => setActive(true);

  return (
    <article
      aria-live="polite"
      aria-pressed={active}
      onClick={handleActivate}
      onTouchStart={handleActivate}
      className={`relative isolate w-full max-w-full overflow-hidden rounded-xl p-3 transition-all duration-300 ${
        isAvailable
          ? "card-dark border border-white/6"
          : "card-dark border border-white/6"
      } ${active ? "z-10 scale-[1.03] shadow-2xl" : "shadow-sm"}`}
    >
      <div className="flex h-56 flex-col items-center justify-center gap-2">
        <div
          className={`group relative flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md text-xs font-medium tracking-wide text-slate-700 shadow-inner sm:text-sm`}
          style={{
            background: isAvailable
              ? "linear-gradient(180deg, rgba(16,185,129,0.06), rgba(255,255,255,0.02))"
              : "linear-gradient(180deg, rgba(239,68,68,0.06), rgba(255,255,255,0.02))",
          }}
          title={isAvailable ? "Slot disponible" : "Slot ocupado"}
        >
          {/* playful confetti when active (SMIL) */}
          {active && (
            <svg
              className="pointer-events-none absolute -top-8 left-0 h-12 w-40"
              viewBox="0 0 160 48"
              fill="none"
            >
              <g>
                <rect x="8" y="14" width="4" height="4" rx="1" fill="#f97316">
                  <animate
                    attributeName="y"
                    values="14;2;14"
                    dur="0.9s"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;0"
                    dur="0.9s"
                    repeatCount="1"
                  />
                </rect>
                <rect
                  x="36"
                  y="12"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="#06b6d4"
                >
                  <animate
                    attributeName="y"
                    values="12;0;12"
                    dur="1s"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;0"
                    dur="1s"
                    repeatCount="1"
                  />
                </rect>
                <rect x="68" y="10" width="4" height="4" rx="1" fill="#34d399">
                  <animate
                    attributeName="y"
                    values="10;-6;10"
                    dur="0.8s"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;0"
                    dur="0.8s"
                    repeatCount="1"
                  />
                </rect>
                <rect
                  x="104"
                  y="14"
                  width="3"
                  height="3"
                  rx="0.5"
                  fill="#7c3aed"
                >
                  <animate
                    attributeName="y"
                    values="14;4;14"
                    dur="1.1s"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;0"
                    dur="1.1s"
                    repeatCount="1"
                  />
                </rect>
              </g>
            </svg>
          )}

          {/* 3D-like car (isometric feel) - kept compact so it doesn't overflow neighbours */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 40"
            className={`h-8 w-20 transform transition-transform duration-700 sm:h-10 sm:w-28 ${
              active
                ? "translate-x-4 -translate-y-1 scale-[1.02]"
                : "group-hover:translate-x-2"
            }`}
          >
            <defs>
              <linearGradient id={`car3-top-${slot.id}`} x1="0" x2="1">
                <stop
                  offset="0%"
                  stopColor={isAvailable ? "#34d399" : "#ef4444"}
                />
                <stop
                  offset="100%"
                  stopColor={isAvailable ? "#10b981" : "#b91c1c"}
                />
              </linearGradient>
              <linearGradient id={`car3-side-${slot.id}`} x1="0" x2="1">
                <stop
                  offset="0%"
                  stopColor={isAvailable ? "#059669" : "#dc2626"}
                />
                <stop
                  offset="100%"
                  stopColor={isAvailable ? "#065f46" : "#7f1d1d"}
                />
              </linearGradient>
            </defs>

            {/* shadow */}
            <ellipse
              cx="40"
              cy="36"
              rx="20"
              ry="3"
              fill="rgba(2,6,23,0.12)"
              style={{ transition: "opacity 300ms ease, transform 300ms ease" }}
            />

            {/* car top (roof) - lighter */}
            <rect
              x="18"
              y="8"
              rx="3"
              ry="3"
              width="44"
              height="10"
              fill={`url(#car3-top-${slot.id})`}
            />

            {/* car side to give '3D' effect */}
            <polygon
              points="18,18 62,18 70,24 10,24"
              fill={`url(#car3-side-${slot.id})`}
            />

            {/* windows */}
            <rect
              x="26"
              y="10"
              width="18"
              height="6"
              rx="1"
              fill="rgba(255,255,255,0.75)"
            />

            {/* wheels */}
            <g>
              <g transform="translate(26,30)">
                <circle r="3" fill="#0b1220" />
                {active && (
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                )}
              </g>
              <g transform="translate(54,30)">
                <circle r="3" fill="#0b1220" />
                {active && (
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                )}
              </g>
            </g>
          </svg>
        </div>

        <div className="w-full text-center">
          <div className="text-sm font-semibold text-white sm:text-base">
            Slot
          </div>
          <div
            className="mt-1 inline-block rounded-md px-2 py-0.5 text-sm font-bold sm:text-base"
            style={{
              background: isAvailable
                ? "rgba(16,185,129,0.06)"
                : "rgba(239,68,68,0.06)",
              color: isAvailable ? "#8ef3c5" : "#ffb4b4",
            }}
          >
            #{slot.id}
          </div>
        </div>
      </div>

      {/* Status and meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isAvailable ? "bg-white/6 text-white" : "bg-white/6 text-white"}`}
          >
            {isAvailable ? (
              <svg
                className="text-accent mr-1 h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="text-accent mr-1 h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {isAvailable ? "Disponible" : "Ocupado"}
          </span>
        </div>
      </div>

      {/* Occupied pulse ring (different color/animation) */}
      {!isAvailable ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            boxShadow: "0 0 18px rgba(255,45,149,0.08)",
            border: "1px solid rgba(255,45,149,0.04)",
            animation: "pulse 1.8s infinite",
          }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute -top-2 -right-2 h-3 w-3 rounded-full"
          style={{
            boxShadow: "0 0 12px rgba(124,58,237,0.16)",
            background: "var(--accent-3)",
          }}
        />
      )}

      <style>{`@keyframes pulse{0%{box-shadow:0 0 6px rgba(239,68,68,0.12)}50%{box-shadow:0 0 18px rgba(239,68,68,0.22)}100%{box-shadow:0 0 6px rgba(239,68,68,0.12)}}`}</style>
    </article>
  );
};

export default Slot;
