// Xuất bó hoa (SVG) ra ảnh PNG khung 3:4 dọc rồi tải về.
export async function downloadBouquetPng(
  svgEl,
  { fileName = 'bo-hoa.png', caption = 'Tặng Mina 🌸', subtitle = '' } = {},
) {
  if (!svgEl) return

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
    /* bỏ qua nếu API không có */
  }

  const W = 1080
  const H = 1440 // khung 3:4
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // nền kem
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#f7f3ec')
  g.addColorStop(1, '#eee4d2')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // vẽ bó hoa vừa khung, chừa chỗ chữ phía dưới
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
  const dx = (W - dw) / 2
  const dy = padTop
  ctx.drawImage(img, dx, dy, dw, dh)

  // chữ
  ctx.textAlign = 'center'
  ctx.fillStyle = '#4a4a45'
  ctx.font = '700 58px "Quicksand", "Be Vietnam Pro", sans-serif'
  ctx.fillText(caption, W / 2, H - (subtitle ? 132 : 92))
  if (subtitle) {
    ctx.fillStyle = '#7d7a70'
    ctx.font = '400 31px "Be Vietnam Pro", sans-serif'
    ctx.fillText(subtitle, W / 2, H - 82)
  }

  // tải về
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
