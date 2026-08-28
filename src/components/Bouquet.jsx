import { useMemo } from 'react'
import { buildBouquet, CANVAS, NECK, shade } from '../lib/bouquet'

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

// Nhánh khuynh diệp
function Sprig({ s }) {
  return (
    <g>
      <path d={s.path} fill="none" stroke={shade(s.color, -0.2)} strokeWidth="1.6" strokeLinecap="round" />
      {s.leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={l.rx}
          ry={l.ry}
          fill={l.color}
          transform={`rotate(${l.rot} ${l.x} ${l.y})`}
        />
      ))}
    </g>
  )
}

export default function Bouquet({ templateId, palette, params, seed, className, style }) {
  const { heads, eucalyptus } = useMemo(
    () => buildBouquet({ templateId, palette, params, seed }),
    [templateId, palette, params, seed],
  )

  // Cuống tỏa ra từ cổ bó lên đáy cụm hoa
  const stems = []
  const stemCount = 5
  for (let i = 0; i < stemCount; i++) {
    const tx = NECK.x + (i - (stemCount - 1) / 2) * 15
    stems.push(`M${NECK.x} ${NECK.y} C ${NECK.x} ${NECK.y - 34} ${tx} ${NECK.y - 60} ${tx} 298`)
  }

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
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kraft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4d4b6" />
          <stop offset="100%" stopColor="#cdb489" />
        </linearGradient>
      </defs>

      {/* Voan trắng phía sau (mềm, trong suốt) */}
      <path
        d="M92 286 Q140 348 172 384 L228 384 Q260 348 308 286 Q200 338 92 286 Z"
        fill="#ffffff"
        opacity="0.5"
      />

      {/* Cuống hoa */}
      <g stroke="#7f9b6e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
        {stems.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Khuynh diệp (sau hoa) */}
      {eucalyptus.sprigs.map((s, i) => (
        <Sprig key={`sprig-${i}`} s={s} />
      ))}

      {/* Giấy gói kraft dạng phễu */}
      <g>
        <path
          d="M118 300 Q150 350 170 384 L200 520 L230 384 Q250 350 282 300 Q200 340 118 300 Z"
          fill="url(#kraft)"
        />
        {/* nếp gấp tạo khối */}
        <path d="M200 340 L200 520" stroke="#bb9e70" strokeWidth="1.2" opacity="0.5" fill="none" />
        <path d="M170 384 L150 350" stroke="#bb9e70" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M230 384 L250 350" stroke="#bb9e70" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M170 384 L200 520" stroke="#d8c39c" strokeWidth="1" opacity="0.5" fill="none" />
        <path d="M230 384 L200 520" stroke="#d8c39c" strokeWidth="1" opacity="0.5" fill="none" />
        {/* voan trắng phủ trước giấy */}
        <path
          d="M118 300 Q150 350 170 384 L200 452 L230 384 Q250 350 282 300 Q200 336 118 300 Z"
          fill="#ffffff"
          opacity="0.28"
        />
      </g>

      {/* Các đầu bông */}
      {heads.map((h, i) => (
        <g key={`head-${i}`}>
          {h.florets.map((f, j) => (
            <Floret key={j} f={f} />
          ))}
          <circle cx={h.x} cy={h.y} r={h.r} fill="url(#headGlow)" />
        </g>
      ))}

      {/* Nơ ruy băng ở cổ bó */}
      <g>
        {/* đuôi nơ */}
        <path d="M194 392 C 188 430 184 452 176 480" stroke="#dfd0b0" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M206 392 C 212 430 216 452 224 480" stroke="#dfd0b0" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* hai cánh nơ */}
        <path d="M200 388 C 176 376 158 384 166 400 C 172 410 190 402 200 394 Z" fill="#ecdfc2" />
        <path d="M200 388 C 224 376 242 384 234 400 C 228 410 210 402 200 394 Z" fill="#ecdfc2" />
        {/* nút nơ */}
        <ellipse cx="200" cy="391" rx="7" ry="8" fill="#d9c69c" />
      </g>
    </svg>
  )
}
