// Sinh dữ liệu bó hoa cẩm tú cầu bằng thuật toán, có seed để ổn định giữa các lần render.
// Một bó = nhiều "đầu bông" (head), mỗi đầu bông = cụm nhiều bông nhỏ 4 cánh (floret).

// ----- RNG có seed (mulberry32) -----
export function mulberry32(seed) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ----- Tiện ích màu -----
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h
  const int = parseInt(n, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function rgbToHex({ r, g, b }) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function mixHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  })
}

export function shade(hex, amount) {
  // amount > 0 sáng dần về trắng, < 0 tối dần về đen
  const target = amount >= 0 ? '#ffffff' : '#000000'
  return mixHex(hex, target, Math.abs(amount))
}

// Lấy màu tại vị trí t (0..1) trên dải màu palette (loang giữa các màu)
export function sampleGradient(colors, t) {
  if (!colors || colors.length === 0) return '#9db4c9'
  if (colors.length === 1) return colors[0]
  const clamped = Math.max(0, Math.min(0.99999, t))
  const seg = clamped * (colors.length - 1)
  const i = Math.floor(seg)
  return mixHex(colors[i], colors[i + 1], seg - i)
}

// ----- Khung toạ độ (chân dung, hợp điện thoại) -----
export const CANVAS = { w: 400, h: 540 }
const CENTER_X = CANVAS.w / 2

// ----- Sinh vị trí các đầu bông theo từng template (phong cách) -----
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

function domePositions(n, cx, cy, rx, ry, rng) {
  // Phân bố đều trong hình elip (phyllotaxis) rồi kéo nhẹ lên trên tạo dáng vòm.
  const pts = []
  for (let i = 0; i < n; i++) {
    const frac = n === 1 ? 0 : i / (n - 0.5)
    const rad = Math.sqrt(frac)
    const ang = i * GOLDEN + rng() * 0.6
    const x = cx + Math.cos(ang) * rad * rx
    const y = cy + Math.sin(ang) * rad * ry * 0.9 - rad * 8
    pts.push({ x, y, depth: rad })
  }
  return pts
}

function heartPositions(n, cx, cy, scale, rng) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const shrink = 0.35 + 0.65 * Math.sqrt(rng())
    const t = rng() * Math.PI * 2
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push({
      x: cx + hx * scale * shrink,
      y: cy - hy * scale * shrink,
      depth: 1 - shrink,
    })
  }
  return pts
}

// Trả về danh sách đầu bông {x, y, r} theo template + tham số
function makeHeads(templateId, params, rng) {
  const { blooms, spread } = params
  const s = 0.75 + spread * 0.5 // 0.75 .. 1.25
  let raw = []

  switch (templateId) {
    case 'cascade': {
      const top = Math.max(1, Math.round(blooms * 0.6))
      const tail = blooms - top
      raw = domePositions(top, CENTER_X, 175, 118 * s, 92 * s, rng)
      for (let i = 0; i < tail; i++) {
        const p = (i + 1) / (tail + 1)
        raw.push({
          x: CENTER_X - 40 * s + (rng() - 0.5) * 70 * s + p * 30,
          y: 250 + p * 150 * s,
          depth: 0.5 + p * 0.4,
        })
      }
      break
    }
    case 'heart':
      raw = heartPositions(blooms, CENTER_X, 175, 8.5 * s, rng)
      break
    case 'asymmetric': {
      raw = domePositions(blooms, CENTER_X + 18 * s, 175, 132 * s, 86 * s, rng)
      raw = raw.map((p) => ({ ...p, x: p.x + (p.y - 175) * 0.18 }))
      break
    }
    case 'petite':
      raw = domePositions(blooms, CENTER_X, 195, 82 * s, 70 * s, rng)
      break
    case 'round':
    default:
      raw = domePositions(blooms, CENTER_X, 180, 120 * s, 108 * s, rng)
      break
  }

  const baseR = (templateId === 'petite' ? 46 : 52) * s
  return raw.map((p) => ({
    x: p.x,
    y: p.y,
    r: baseR * (0.82 + rng() * 0.32),
    depth: p.depth ?? 0.5,
  }))
}

// Sinh các bông nhỏ 4 cánh bên trong một đầu bông
function makeFlorets(head, density, palette, gradientDir, rng) {
  const florets = []
  const count = Math.max(6, Math.round(density * (head.r / 52)))
  const petalR = head.r * 0.235
  for (let i = 0; i < count; i++) {
    const frac = i / count
    const rad = Math.sqrt(frac) * head.r * 0.92
    const ang = i * GOLDEN + rng() * 0.4
    const fx = head.x + Math.cos(ang) * rad
    const fy = head.y + Math.sin(ang) * rad
    // t cho loang màu: theo hướng gradient + nhiễu nhẹ
    const proj = ((fx - head.x) * gradientDir.x + (fy - head.y) * gradientDir.y) / head.r
    const t = 0.5 + proj * 0.55 + (rng() - 0.5) * 0.4
    let color = sampleGradient(palette, t)
    color = shade(color, (rng() - 0.45) * 0.16) // sáng/tối nhẹ tạo chiều sâu
    florets.push({
      x: fx,
      y: fy,
      size: petalR * (0.82 + rng() * 0.4),
      rot: rng() * 90,
      color,
      center: shade(color, 0.32),
      depth: rad / head.r,
    })
  }
  // vẽ bông ở rìa trước, giữa sau cho tự nhiên
  return florets.sort((a, b) => b.depth - a.depth)
}

function makeLeaves(heads, rng) {
  // Vài chiếc lá xanh nhô sau các đầu bông (không phụ thuộc palette)
  const greens = ['#7f9b6e', '#6f8d63', '#8aa878']
  const leaves = []
  const n = Math.min(5, Math.max(2, Math.round(heads.length * 0.7)))
  for (let i = 0; i < n; i++) {
    const h = heads[Math.floor(rng() * heads.length)]
    const ang = rng() * Math.PI * 2
    leaves.push({
      x: h.x + Math.cos(ang) * h.r * 0.9,
      y: h.y + Math.sin(ang) * h.r * 0.7 + 6,
      rot: (ang * 180) / Math.PI + 90 + (rng() - 0.5) * 40,
      scale: 0.8 + rng() * 0.6,
      color: greens[i % greens.length],
    })
  }
  return leaves
}

export function buildBouquet({ templateId, palette, params, seed }) {
  const rng = mulberry32(seed || 1)
  const heads = makeHeads(templateId, params, rng)
  // hướng loang màu chung cho cả bó
  const gDir = (() => {
    const a = rng() * Math.PI * 2
    return { x: Math.cos(a), y: Math.sin(a) }
  })()
  // vẽ đầu bông xa (nhỏ/sâu) trước
  heads.sort((a, b) => a.r - b.r)
  const leaves = makeLeaves(heads, rng)
  const built = heads.map((h) => ({
    ...h,
    florets: makeFlorets(h, params.density, palette, gDir, rng),
  }))
  return { heads: built, leaves }
}

export const TEMPLATES = [
  { id: 'round', name: 'Bó tròn', hint: 'Cổ điển, đầy đặn' },
  { id: 'cascade', name: 'Bó thả', hint: 'Buông rủ mềm mại' },
  { id: 'heart', name: 'Bó tim', hint: 'Xếp thành trái tim' },
  { id: 'asymmetric', name: 'Bó lệch', hint: 'Nghệ thuật, phá cách' },
  { id: 'petite', name: 'Bó gọn', hint: 'Nhỏ xinh, tối giản' },
]

// Bảng màu gợi ý theo gu của cô ấy (xanh dương, xám, be, vàng nhạt)
export const PRESET_PALETTES = [
  { name: 'Xanh bình yên', colors: ['#7fa8d4', '#a9b7c0', '#e8d9a0'] },
  { name: 'Sương & be', colors: ['#9db4c9', '#c9c3b6', '#efe4c4'] },
  { name: 'Xanh xám', colors: ['#8fa9bd', '#b7bcbf', '#d9d2c2'] },
  { name: 'Nắng nhạt', colors: ['#e7d79c', '#cbb98f', '#9fb1c3'] },
  { name: 'Xanh dương đậm', colors: ['#5b86b5', '#7f9bbd', '#b9c4cf'] },
]

// Màu khởi tạo ban đầu
export const DEFAULT_PALETTE = ['#7fa8d4', '#a9b7c0', '#e8d9a0']
