import { useMemo } from 'react'
import { buildBouquet, CANVAS, shade } from '../lib/bouquet'

const CX = CANVAS.w / 2
const CLUSTER_TOP = 298 // đáy cụm hoa (khớp CLUSTER_BOX.bottom trong lib)

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

// Cuống hoa: toả từ điểm tụ lên đáy cụm
function stemPaths(gatherY, n = 5, fan = 15) {
  const arr = []
  for (let i = 0; i < n; i++) {
    const tx = CX + (i - (n - 1) / 2) * fan
    arr.push(
      `M${CX} ${gatherY} C ${CX} ${gatherY - (gatherY - CLUSTER_TOP) * 0.5} ${tx} ${gatherY - (gatherY - CLUSTER_TOP) * 0.72} ${tx} ${CLUSTER_TOP}`,
    )
  }
  return arr
}

// Cấu hình từng kiểu bó: {gatherY, back, body, front}
function getWrap(wrapId) {
  switch (wrapId) {
    case 'tissue':
      return {
        gatherY: 388,
        body: (
          <g>
            <path d="M108 298 Q150 358 172 388 L228 388 Q250 358 292 298 Q200 346 108 298 Z" fill="#f4eee3" />
            <path d="M200 388 L182 512 Q200 520 218 512 Z" fill="#ece3d2" />
            <path d="M120 300 Q120 356 168 386 Q150 342 196 322 Q150 302 120 300 Z" fill="#ffffff" opacity="0.45" />
            <path d="M280 300 Q280 356 232 386 Q250 342 204 322 Q250 302 280 300 Z" fill="#ffffff" opacity="0.45" />
            <path d="M150 290 Q150 350 190 384 Q188 334 208 318 Q176 298 150 290 Z" fill="#ffffff" opacity="0.35" />
            <path d="M250 290 Q250 350 210 384 Q212 334 192 318 Q224 298 250 290 Z" fill="#ffffff" opacity="0.35" />
          </g>
        ),
        front: (
          <g>
            <path d="M193 392 C 189 424 187 442 182 466" stroke="#e0d3b7" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M207 392 C 211 424 213 442 218 466" stroke="#e0d3b7" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="200" cy="391" rx="7" ry="7" fill="#e7dcc4" />
          </g>
        ),
      }

    case 'box':
      // Hộp hoa nhỏ gọn, thanh lịch (có nơ ruy băng chữ thập)
      return {
        gatherY: 328,
        body: (
          <g>
            <path d="M144 320 L144 420 Q144 432 158 434 L242 434 Q256 432 256 420 L256 320 Z" fill="url(#gBox)" />
            <path d="M144 320 L144 420 Q144 430 150 432 L150 322 Z" fill="#ffffff" opacity="0.12" />
            <ellipse cx="200" cy="320" rx="58" ry="12" fill="#c9bda6" />
            <ellipse cx="200" cy="318" rx="50" ry="9" fill="#b7c0a6" />
          </g>
        ),
        front: (
          <g>
            <path d="M144 320 Q200 336 256 320" stroke="#bcac90" strokeWidth="2" fill="none" opacity="0.6" />
            <rect x="193" y="320" width="14" height="114" fill="#e7dcc4" />
            <rect x="144" y="366" width="112" height="14" fill="#e7dcc4" />
            <path d="M200 366 C 184 356 170 362 177 376 C 183 384 197 376 200 370 Z" fill="#efe6d1" />
            <path d="M200 366 C 216 356 230 362 223 376 C 217 384 203 376 200 370 Z" fill="#efe6d1" />
            <ellipse cx="200" cy="369" rx="6" ry="6" fill="#dccca9" />
          </g>
        ),
      }

    case 'vase':
      return {
        gatherY: 462,
        body: (
          <g>
            <path d="M151 432 Q156 494 200 499 Q244 494 249 432 Q200 448 151 432 Z" fill="#bcd2de" opacity="0.6" />
            <path
              d="M154 330 Q140 405 150 455 Q158 497 200 501 Q242 497 250 455 Q260 405 246 330 Q200 346 154 330 Z"
              fill="#e2edf2"
              opacity="0.45"
              stroke="#d0e0e8"
              strokeWidth="1.5"
            />
          </g>
        ),
        front: (
          <g>
            <ellipse cx="200" cy="330" rx="46" ry="10" fill="none" stroke="#d6e4ec" strokeWidth="2" />
            <path d="M170 348 Q162 408 174 452" stroke="#ffffff" strokeWidth="4" opacity="0.55" fill="none" strokeLinecap="round" />
          </g>
        ),
      }

    case 'basket':
      return {
        gatherY: 345,
        back: (
          <g>
            <path d="M120 322 Q200 210 280 322" fill="none" stroke="#c2a06e" strokeWidth="9" strokeLinecap="round" />
            <path d="M120 322 Q200 214 280 322" fill="none" stroke="#d8bd8f" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>
        ),
        body: (
          <g>
            <path d="M112 322 Q112 462 140 470 L260 470 Q288 462 288 322 Z" fill="url(#gBasket)" />
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M112 ${346 + i * 30} Q200 ${360 + i * 30} 288 ${346 + i * 30}`}
                fill="none"
                stroke="#a9895a"
                strokeWidth="1.2"
                opacity="0.5"
              />
            ))}
            <ellipse cx="200" cy="322" rx="90" ry="17" fill="#caa877" />
            <ellipse cx="200" cy="320" rx="80" ry="13" fill="#b7c0a6" />
          </g>
        ),
        front: <path d="M112 322 Q200 340 288 322" stroke="#a9895a" strokeWidth="2.5" fill="none" opacity="0.6" />,
      }

    case 'kraft':
    default:
      return {
        gatherY: 384,
        back: <path d="M92 286 Q140 348 172 384 L228 384 Q260 348 308 286 Q200 338 92 286 Z" fill="#ffffff" opacity="0.5" />,
        body: (
          <g>
            <path d="M118 300 Q150 350 170 384 L200 520 L230 384 Q250 350 282 300 Q200 340 118 300 Z" fill="url(#gKraft)" />
            <path d="M200 340 L200 520" stroke="#bb9e70" strokeWidth="1.2" opacity="0.5" fill="none" />
            <path d="M170 384 L150 350" stroke="#bb9e70" strokeWidth="1" opacity="0.4" fill="none" />
            <path d="M230 384 L250 350" stroke="#bb9e70" strokeWidth="1" opacity="0.4" fill="none" />
            <path d="M118 300 Q150 350 170 384 L200 452 L230 384 Q250 350 282 300 Q200 336 118 300 Z" fill="#ffffff" opacity="0.28" />
          </g>
        ),
        front: (
          <g>
            <path d="M194 392 C 188 430 184 452 176 480" stroke="#dfd0b0" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M206 392 C 212 430 216 452 224 480" stroke="#dfd0b0" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M200 388 C 176 376 158 384 166 400 C 172 410 190 402 200 394 Z" fill="#ecdfc2" />
            <path d="M200 388 C 224 376 242 384 234 400 C 228 410 210 402 200 394 Z" fill="#ecdfc2" />
            <ellipse cx="200" cy="391" rx="7" ry="8" fill="#d9c69c" />
          </g>
        ),
      }
  }
}

// Túi giấy có ô cửa sổ nhìn thấy bó hoa bên trong (kiểu ảnh mẫu)
function BagLayout({ heads, palette }) {
  // Bó hoa thu nhỏ, đặt trong ô cửa sổ
  const inner = 'translate(100 250) scale(0.5)'
  const wrapGreen = palette && palette.length ? shade('#c3d385', 0) : '#c3d385'
  return (
    <>
      {/* Tấm sau trong túi */}
      <path d="M74 172 L326 172 L318 526 Q200 540 82 526 Z" fill="#ece3d4" />

      {/* Giấy Hàn xanh + bó hoa nhỏ trong cửa sổ */}
      <path d="M156 356 Q160 420 200 456 Q240 420 244 356 Q200 392 156 356 Z" fill={wrapGreen} />
      <path d="M158 352 Q160 360 200 372 Q240 360 242 352 Q200 372 158 352 Z" fill="#d6e2a2" opacity="0.7" />
      <g transform={inner}>
        {heads.map((h, i) => (
          <g key={i}>
            {h.florets.map((f, j) => (
              <Floret key={j} f={f} />
            ))}
          </g>
        ))}
      </g>
      {/* nơ nhỏ ở cổ bó trong túi */}
      <path d="M200 452 C 186 444 174 450 180 462 C 185 469 196 462 200 457 Z" fill="#fbf7ef" />
      <path d="M200 452 C 214 444 226 450 220 462 C 215 469 204 462 200 457 Z" fill="#fbf7ef" />
      <ellipse cx="200" cy="454" rx="5" ry="5" fill="#eee7d8" />

      {/* Mặt trước túi (có khoét cửa sổ bằng mask) */}
      <g mask="url(#bagWindow)">
        <path d="M70 168 L330 168 L322 528 Q200 542 78 528 Z" fill="#f7f3ec" />
        <path d="M70 168 L96 150 L112 172 Z" fill="#eee6d8" />
        <path d="M330 168 L304 150 L288 172 Z" fill="#eee6d8" />
        <path d="M78 528 Q200 542 322 528 L322 512 Q200 526 78 512 Z" fill="#ece3d3" opacity="0.7" />
        <path d="M70 168 L78 528 Q70 520 68 500 L64 190 Z" fill="#ffffff" opacity="0.5" />
      </g>
      {/* viền cửa sổ */}
      <rect x="118" y="250" width="164" height="216" rx="16" fill="none" stroke="#e5ddce" strokeWidth="2" />

      {/* Quai dây xoắn */}
      {[[138, 198], [202, 262]].map(([x1, x2], i) => (
        <g key={i}>
          <path d={`M${x1} 168 C ${x1 + 8} 86 ${x2 - 8} 86 ${x2} 168`} fill="none" stroke="#93a6b8" strokeWidth="3.5" strokeLinecap="round" />
          <path d={`M${x1} 168 C ${x1 + 8} 86 ${x2 - 8} 86 ${x2} 168`} fill="none" stroke="#ffffff" strokeWidth="1.3" strokeDasharray="3 3.5" opacity="0.85" />
        </g>
      ))}

      {/* Thẻ tag */}
      <line x1="250" y1="176" x2="264" y2="210" stroke="#c9b184" strokeWidth="1" />
      <g transform="rotate(9 264 226)">
        <rect x="244" y="210" width="42" height="30" rx="4" fill="#fbf8f2" stroke="#e6ddcd" />
        <line x1="250" y1="220" x2="280" y2="220" stroke="#d8cdb8" strokeWidth="1.3" />
        <line x1="250" y1="226" x2="276" y2="226" stroke="#e0d7c4" strokeWidth="1.1" />
        <line x1="250" y1="232" x2="278" y2="232" stroke="#e0d7c4" strokeWidth="1.1" />
      </g>
    </>
  )
}

export default function Bouquet({ templateId, wrapId = 'kraft', palette, params, seed, className, style }) {
  const { heads, eucalyptus } = useMemo(
    () => buildBouquet({ templateId, palette, params, seed }),
    [templateId, palette, params, seed],
  )

  const commonDefs = (
    <defs>
      <radialGradient id="headGlow" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gKraft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e4d4b6" />
        <stop offset="100%" stopColor="#cdb489" />
      </linearGradient>
      <linearGradient id="gBox" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ddd0bb" />
        <stop offset="100%" stopColor="#c7b89f" />
      </linearGradient>
      <linearGradient id="gBasket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d6b783" />
        <stop offset="100%" stopColor="#bd9a63" />
      </linearGradient>
      <mask id="bagWindow">
        <rect x="0" y="0" width={CANVAS.w} height={CANVAS.h} fill="white" />
        <rect x="118" y="250" width="164" height="216" rx="16" fill="black" />
      </mask>
    </defs>
  )

  const svgProps = {
    viewBox: `0 0 ${CANVAS.w} ${CANVAS.h}`,
    className,
    style,
    xmlns: 'http://www.w3.org/2000/svg',
    role: 'img',
    'aria-label': 'Bó hoa cẩm tú cầu',
  }

  if (wrapId === 'bag') {
    return (
      <svg {...svgProps}>
        {commonDefs}
        <BagLayout heads={heads} palette={palette} />
      </svg>
    )
  }

  const wrap = getWrap(wrapId)
  const stems = stemPaths(wrap.gatherY, 5, wrapId === 'vase' ? 10 : 15)

  return (
    <svg {...svgProps}>
      {commonDefs}

      {wrap.back}

      {eucalyptus.sprigs.map((s, i) => (
        <Sprig key={`sprig-${i}`} s={s} />
      ))}

      {/* Cuống vẽ trước, thân bó phủ lên che gốc cuống */}
      <g stroke="#7f9b6e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
        {stems.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {wrap.body}

      {/* Các đầu bông */}
      {heads.map((h, i) => (
        <g key={`head-${i}`}>
          {h.florets.map((f, j) => (
            <Floret key={j} f={f} />
          ))}
          <circle cx={h.x} cy={h.y} r={h.r} fill="url(#headGlow)" />
        </g>
      ))}

      {wrap.front}
    </svg>
  )
}
