import { useMemo } from 'react'
import { buildBouquet, CANVAS, shade } from '../lib/bouquet'

// Một bông nhỏ 4 cánh (floret)
function Floret({ f }) {
  const petals = [0, 90, 180, 270]
  return (
    <g transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`}>
      {petals.map((a) => (
        <ellipse
          key={a}
          cx={0}
          cy={-f.size * 0.62}
          rx={f.size * 0.62}
          ry={f.size * 0.82}
          fill={f.color}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={f.size * 0.34} fill={f.center} />
    </g>
  )
}

// Chiếc lá
function Leaf({ l }) {
  return (
    <g transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.scale})`}>
      <path
        d="M0 0 C 14 -10 14 -34 0 -48 C -14 -34 -14 -10 0 0 Z"
        fill={l.color}
      />
      <path d="M0 -3 L0 -44" stroke={shade(l.color, -0.25)} strokeWidth="1.4" fill="none" />
    </g>
  )
}

export default function Bouquet({ templateId, palette, params, seed, className, style }) {
  const { heads, leaves } = useMemo(
    () => buildBouquet({ templateId, palette, params, seed }),
    [templateId, palette, params, seed],
  )

  const wrapColor = '#efe7d6'
  const wrapShadow = '#ddd2bb'

  return (
    <svg
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bó hoa cẩm tú cầu"
    >
      <defs>
        <radialGradient id="headGlow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cuống hoa */}
      <g stroke="#7f9b6e" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
        <path d="M170 300 C 175 380 190 420 200 470" fill="none" />
        <path d="M200 300 C 200 380 200 420 200 472" fill="none" />
        <path d="M232 300 C 226 380 212 420 202 470" fill="none" />
      </g>

      {/* Giấy gói */}
      <g>
        <path
          d={`M132 452 L200 476 L268 452 L246 520 Q200 536 154 520 Z`}
          fill={wrapColor}
        />
        <path d="M200 476 L246 520 Q200 536 154 520 L200 476 Z" fill={wrapShadow} opacity="0.5" />
        <path
          d={`M132 452 L200 476 L268 452`}
          fill="none"
          stroke={wrapShadow}
          strokeWidth="1.2"
          opacity="0.7"
        />
      </g>

      {/* Lá */}
      {leaves.map((l, i) => (
        <Leaf key={`leaf-${i}`} l={l} />
      ))}

      {/* Các đầu bông */}
      {heads.map((h, i) => (
        <g key={`head-${i}`}>
          {h.florets.map((f, j) => (
            <Floret key={j} f={f} />
          ))}
          <circle cx={h.x} cy={h.y} r={h.r} fill="url(#headGlow)" />
        </g>
      ))}

      {/* Nơ buộc */}
      <g>
        <rect x="188" y="466" width="24" height="16" rx="6" fill="#d9c9a6" />
        <path d="M200 474 C 184 462 168 470 176 484 C 184 492 196 484 200 478 Z" fill="#e4d6b6" />
        <path d="M200 474 C 216 462 232 470 224 484 C 216 492 204 484 200 478 Z" fill="#e4d6b6" />
      </g>
    </svg>
  )
}
