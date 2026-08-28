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
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
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
  const target = amount >= 0 ? '#ffffff' : '#000000'
  return mixHex(hex, target, Math.abs(amount))
}

export function sampleGradient(colors, t) {
  if (!colors || colors.length === 0) return '#9db4c9'
  if (colors.length === 1) return colors[0]
  const clamped = Math.max(0, Math.min(0.99999, t))
  const seg = clamped * (colors.length - 1)
  const i = Math.floor(seg)
  return mixHex(colors[i], colors[i + 1], seg - i)
}

// ----- Khung toạ độ (chân dung, hợp điện thoại) -----
export const CANVAS = { w: 400, h: 560 }
const CENTER_X = CANVAS.w / 2

// Điểm cuống tụ lại (cổ bó) và khung an toàn cho cụm hoa
export const NECK = { x: CENTER_X, y: 384 }
const CLUSTER_BOX = { cx: CENTER_X, w: 300, top: 74, bottom: 300 } // đáy cụm hoa neo vào đây

// ----- Sinh vị trí các đầu bông theo từng template (phong cách) -----
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

function domePositions(n, rx, ry, rng) {
  // Phân bố đều trong hình elip (phyllotaxis) quanh gốc (0,0)
  const pts = []
  for (let i = 0; i < n; i++) {
    const frac = n === 1 ? 0 : i / (n - 0.5)
    const rad = Math.sqrt(frac)
    const ang = i * GOLDEN + rng() * 0.6
    pts.push({
      x: Math.cos(ang) * rad * rx,
      y: Math.sin(ang) * rad * ry * 0.92 - rad * 6,
      depth: rad,
    })
  }
  return pts
}

function heartPositions(n, scale, rng) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const shrink = 0.35 + 0.65 * Math.sqrt(rng())
    const t = rng() * Math.PI * 2
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push({ x: hx * scale * shrink, y: -hy * scale * shrink, depth: 1 - shrink })
  }
  return pts
}

// Trả về danh sách đầu bông quanh gốc (0,0). Sẽ được fit vào khung sau.
// Độ xòe (spread) điều khiển ĐỘ THƯA giữa các bông (kích thước bông giữ cố định),
// nhờ đó xòe nhỏ = cụm dày khít, xòe lớn = cụm thoáng, rời.
function makeHeads(templateId, params, rng) {
  const { blooms, spread } = params
  const R = templateId === 'petite' ? 42 : 48 // bán kính đầu bông (cố định)
  const sp = R * (0.95 + spread * 1.7) // bán kính giãn cách của cụm
  let raw = []

  switch (templateId) {
    case 'cascade': {
      const top = Math.max(1, Math.round(blooms * 0.62))
      const tail = blooms - top
      raw = domePositions(top, sp, sp * 0.82, rng)
      for (let i = 0; i < tail; i++) {
        const p = (i + 1) / (tail + 1)
        raw.push({
          x: -sp * 0.32 + (rng() - 0.5) * sp * 0.55,
          y: sp * 0.7 + p * sp * 1.6,
          depth: 0.5 + p * 0.4,
        })
      }
      break
    }
    case 'heart':
      raw = heartPositions(blooms, sp / 14, rng)
      break
    case 'asymmetric':
      raw = domePositions(blooms, sp * 1.05, sp * 0.72, rng).map((p) => ({
        ...p,
        x: p.x + p.y * 0.22 + R * 0.2,
      }))
      break
    case 'petite':
      raw = domePositions(blooms, sp * 0.74, sp * 0.66, rng)
      break
    case 'round':
    default:
      raw = domePositions(blooms, sp, sp * 0.92, rng)
      break
  }

  return raw.map((p) => ({
    x: p.x,
    y: p.y,
    r: R * (0.82 + rng() * 0.3),
    depth: p.depth ?? 0.5,
  }))
}

// Co giãn + dời cụm hoa cho vừa khung, neo đáy cụm vào chỗ cuống.
// Độ xòe quyết định cụm chiếm bao nhiêu phần khung (fill), fit chỉ để chống tràn.
function fitHeads(heads, spread) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const h of heads) {
    minX = Math.min(minX, h.x - h.r)
    maxX = Math.max(maxX, h.x + h.r)
    minY = Math.min(minY, h.y - h.r)
    maxY = Math.max(maxY, h.y + h.r)
  }
  const w = Math.max(1, maxX - minX)
  const hgt = Math.max(1, maxY - minY)
  const boxH = CLUSTER_BOX.bottom - CLUSTER_BOX.top
  const fill = 0.56 + 0.44 * spread // xòe nhỏ -> 56% khung, xòe lớn -> đầy khung
  let scale = Math.min((CLUSTER_BOX.w * fill) / w, (boxH * fill) / hgt)
  scale = Math.min(scale, CLUSTER_BOX.w / w, boxH / hgt) // không bao giờ vượt khung
  const cx = (minX + maxX) / 2
  return heads.map((h) => ({
    ...h,
    x: CLUSTER_BOX.cx + (h.x - cx) * scale,
    y: CLUSTER_BOX.bottom - (maxY - h.y) * scale, // điểm thấp nhất -> đáy khung
    r: h.r * scale,
  }))
}

// Sinh các bông nhỏ 4 cánh bên trong một đầu bông
function makeFlorets(head, density, palette, gradientDir, rng) {
  const florets = []
  const count = Math.max(8, Math.round(density * (head.r / 46)))
  const petalR = head.r * 0.235
  for (let i = 0; i < count; i++) {
    const frac = i / count
    const rad = Math.sqrt(frac) * head.r * 0.94
    const ang = i * GOLDEN + rng() * 0.4
    const fx = head.x + Math.cos(ang) * rad
    const fy = head.y + Math.sin(ang) * rad
    const proj = ((fx - head.x) * gradientDir.x + (fy - head.y) * gradientDir.y) / head.r
    const t = 0.5 + proj * 0.55 + (rng() - 0.5) * 0.4
    let color = sampleGradient(palette, t)
    color = shade(color, (rng() - 0.45) * 0.16)
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
  return florets.sort((a, b) => b.depth - a.depth)
}

// Nhánh khuynh diệp (eucalyptus) nhô ra sau/quanh cụm hoa cho giống bó thật
function makeEucalyptus(heads, rng) {
  const greens = ['#9db79a', '#8aa886', '#b3c4a6']
  // cụm hoa nằm trong khoảng nào
  let minX = Infinity, maxX = -Infinity, minY = Infinity
  for (const h of heads) {
    minX = Math.min(minX, h.x)
    maxX = Math.max(maxX, h.x)
    minY = Math.min(minY, h.y - h.r)
  }
  const clusterTop = Math.max(52, minY)
  // các hướng nhô ra: trên-trái, trên, trên-phải, trái, phải
  const dirs = [
    { a: -125, len: 96 },
    { a: -95, len: 108 },
    { a: -60, len: 96 },
    { a: -160, len: 78 },
    { a: -20, len: 78 },
  ]
  const sprigs = []
  const baseY = 296
  for (let d = 0; d < dirs.length; d++) {
    if (rng() < 0.18) continue
    const dir = dirs[d]
    const rad = (dir.a * Math.PI) / 180
    const len = dir.len * (0.85 + rng() * 0.3)
    const bx = CENTER_X + (rng() - 0.5) * 30
    const ex = clamp(bx + Math.cos(rad) * len, 22, CANVAS.w - 22)
    const ey = clamp(baseY + Math.sin(rad) * len, 46, baseY)
    // điểm điều khiển cong nhẹ
    const mx = (bx + ex) / 2 + (rng() - 0.5) * 26
    const my = (baseY + ey) / 2 - 10
    const color = greens[d % greens.length]
    const leaves = []
    const N = 5 + Math.floor(rng() * 3)
    for (let i = 1; i <= N; i++) {
      const p = i / (N + 1)
      // điểm trên đường bezier bậc 2
      const qx = (1 - p) * (1 - p) * bx + 2 * (1 - p) * p * mx + p * p * ex
      const qy = (1 - p) * (1 - p) * baseY + 2 * (1 - p) * p * my + p * p * ey
      const side = i % 2 === 0 ? 1 : -1
      const tang = Math.atan2(ey - baseY, ex - bx)
      const nrm = tang + (Math.PI / 2) * side
      leaves.push({
        x: qx + Math.cos(nrm) * 5,
        y: qy + Math.sin(nrm) * 5,
        rot: (nrm * 180) / Math.PI,
        rx: 7 + rng() * 3,
        ry: 4.5 + rng() * 1.5,
        color: shade(color, (rng() - 0.5) * 0.12),
      })
    }
    sprigs.push({ path: `M${bx.toFixed(1)} ${baseY} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, color, leaves })
  }
  return { sprigs, clusterTop }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

export function buildBouquet({ templateId, palette, params, seed }) {
  const rng = mulberry32(seed || 1)
  let heads = makeHeads(templateId, params, rng)
  heads = fitHeads(heads, params.spread)
  const gDir = (() => {
    const a = rng() * Math.PI * 2
    return { x: Math.cos(a), y: Math.sin(a) }
  })()
  const eucalyptus = makeEucalyptus(heads, rng)
  // vẽ đầu bông nhỏ (xa) trước
  heads.sort((a, b) => a.r - b.r)
  const built = heads.map((h) => ({
    ...h,
    florets: makeFlorets(h, params.density, palette, gDir, rng),
  }))
  return { heads: built, eucalyptus }
}

// Dáng hoa = hình dáng cụm hoa
export const TEMPLATES = [
  { id: 'round', name: 'Tròn', hint: 'Cổ điển, đầy đặn' },
  { id: 'cascade', name: 'Thả', hint: 'Buông rủ mềm mại' },
  { id: 'heart', name: 'Tim', hint: 'Xếp thành trái tim' },
  { id: 'asymmetric', name: 'Lệch', hint: 'Nghệ thuật, phá cách' },
  { id: 'petite', name: 'Gọn', hint: 'Nhỏ xinh, tối giản' },
]

// Kiểu bó = cách gói / đựng hoa
export const WRAPS = [
  { id: 'kraft', name: 'Giấy kraft', hint: 'Mộc, ấm' },
  { id: 'tissue', name: 'Giấy lụa Hàn', hint: 'Bồng bềnh, sang' },
  { id: 'box', name: 'Hộp hoa', hint: 'Thanh lịch' },
  { id: 'vase', name: 'Bình thủy tinh', hint: 'Nhẹ nhàng' },
  { id: 'basket', name: 'Giỏ mây', hint: 'Mộc mạc' },
  { id: 'bag', name: 'Túi giấy', hint: 'Trẻ trung' },
]

// Bảng màu gợi ý theo gu của cô ấy (xanh dương, xám, be, vàng nhạt)
export const PRESET_PALETTES = [
  { name: 'Xanh bình yên', colors: ['#7fa8d4', '#a9b7c0', '#e8d9a0'] },
  { name: 'Sương & be', colors: ['#9db4c9', '#c9c3b6', '#efe4c4'] },
  { name: 'Xanh xám', colors: ['#8fa9bd', '#b7bcbf', '#d9d2c2'] },
  { name: 'Nắng nhạt', colors: ['#e7d79c', '#cbb98f', '#9fb1c3'] },
  { name: 'Xanh dương đậm', colors: ['#5b86b5', '#7f9bbd', '#b9c4cf'] },
]

export const DEFAULT_PALETTE = ['#7fa8d4', '#a9b7c0', '#e8d9a0']
