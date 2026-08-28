// Xuất bó hoa (SVG) ra ảnh PNG khung 3:4 dọc.
// - iPhone/di động: mở Share sheet (bấm "Lưu ảnh" vào Ảnh).
// - Macbook/desktop: tải thẳng file .png.

async function renderBouquetBlob(svgEl, { subtitle = '', caption = '' } = {}) {
  // clone + gắn width/height để trình duyệt (nhất là Firefox) có kích thước nội tại
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('width', '400')
  clone.setAttribute('height', '560')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const xml = new XMLSerializer().serializeToString(clone)
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)

  const img = new Image()
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = svgUrl
  })
  try {
    await document.fonts.ready
  } catch {
    /* bỏ qua */
  }

  const W = 1080
  const H = 1440 // khung 3:4
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#f7f3ec')
  g.addColorStop(1, '#eee4d2')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const reserve = subtitle ? 210 : 150
  const padX = 80
  const padTop = 64
  const availW = W - 2 * padX
  const availH = H - padTop - reserve
  const aspect = 400 / 560
  let dw = availW
  let dh = dw / aspect
  if (dh > availH) {
    dh = availH
    dw = dh * aspect
  }
  ctx.drawImage(img, (W - dw) / 2, padTop, dw, dh)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#4a4a45'
  ctx.font = '700 58px "Quicksand", "Be Vietnam Pro", sans-serif'
  ctx.fillText(caption, W / 2, H - (subtitle ? 132 : 92))
  if (subtitle) {
    ctx.fillStyle = '#7d7a70'
    ctx.font = '400 31px "Be Vietnam Pro", sans-serif'
    ctx.fillText(subtitle, W / 2, H - 82)
  }

  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Trả về: 'shared' | 'downloaded' | 'cancelled'
export async function saveBouquetImage(
  svgEl,
  { fileName = 'bo-hoa.png', caption = 'Tặng Mina 🌸', subtitle = '' } = {},
) {
  if (!svgEl) return 'cancelled'
  const blob = await renderBouquetBlob(svgEl, { caption, subtitle })
  const file = new File([blob], fileName, { type: 'image/png' })

  // Thiết bị cảm ứng (iPhone/iPad/Android) + hỗ trợ chia sẻ file -> dùng Share sheet
  const isTouch =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (isTouch && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: caption })
      return 'shared'
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled'
      // lỗi khác -> rơi xuống tải trực tiếp
    }
  }

  // Desktop / không hỗ trợ chia sẻ -> tải thẳng
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
