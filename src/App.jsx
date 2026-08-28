import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Bouquet from './components/Bouquet'
import PetalBackground from './components/PetalBackground'
import MusicPlayer from './components/MusicPlayer'
import { useMusicPlayer } from './hooks/useMusicPlayer'
import { SONGS } from './lib/songs'
import { saveBouquetImage } from './lib/exportImage'
import {
  TEMPLATES,
  WRAPS,
  PRESET_PALETTES,
  DEFAULT_PALETTE,
} from './lib/bouquet'

const MAX_COLORS = 6
const MIN_COLORS = 2
const GRAY_PALETTE = ['#cfcabb', '#b7b3a6'] // template hiển thị không màu

const stepVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
}

export default function App() {
  // Chế độ xem lưới tạm để soi các kiểu bó: mở /?grid=wraps
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('grid')) {
    return <PreviewGrid />
  }
  return <MainApp />
}

function PreviewGrid() {
  const pal = DEFAULT_PALETTE
  const mode = new URLSearchParams(window.location.search).get('grid')
  if (mode === 'blooms') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16, background: '#f3efe6' }}>
        {[3, 5, 7, 9].map((b) => (
          <div key={b} style={{ width: 200, background: '#fff', borderRadius: 16, padding: 8, textAlign: 'center' }}>
            <Bouquet templateId="round" wrapId="kraft" palette={pal} params={{ blooms: b, density: 22, spread: 0.6 }} seed={7} style={{ height: 280 }} />
            <b>{b} bông</b>
          </div>
        ))}
      </div>
    )
  }
  const p = { blooms: 5, density: 20, spread: 0.6 }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16, background: '#f3efe6' }}>
      {WRAPS.map((w) => (
        <div key={w.id} style={{ width: 190, background: '#fff', borderRadius: 16, padding: 8, textAlign: 'center' }}>
          <Bouquet templateId="round" wrapId={w.id} palette={pal} params={p} seed={7} style={{ height: 260 }} />
          <b>{w.name}</b>
        </div>
      ))}
    </div>
  )
}

function MainApp() {
  const initialStep =
    typeof window !== 'undefined'
      ? Number(new URLSearchParams(window.location.search).get('step')) || 1
      : 1
  const [step, setStep] = useState(initialStep)
  const [palette, setPalette] = useState(DEFAULT_PALETTE)
  const [templateId, setTemplateId] = useState('round')
  const [wrapId, setWrapId] = useState('kraft')
  const [params, setParams] = useState({ blooms: 4, density: 26, spread: 0.6 })
  const [seed, setSeed] = useState(7)
  const player = useMusicPlayer(SONGS)

  const go = (n) => setStep(n)

  return (
    <div className="app">
      <PetalBackground palette={palette} />
      <MusicPlayer player={player} songs={SONGS} />
      <div className="stage">
        {step > 1 && step < 5 && (
          <div className="progress">
            {[2, 3, 4].map((s) => (
              <span key={s} className={s <= step ? 'active' : ''} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && <StepIntro player={player} onNext={() => go(2)} />}
            {step === 2 && (
              <StepColors
                palette={palette}
                setPalette={setPalette}
                onBack={() => go(1)}
                onNext={() => go(3)}
              />
            )}
            {step === 3 && (
              <StepDesign
                templateId={templateId}
                setTemplateId={setTemplateId}
                wrapId={wrapId}
                setWrapId={setWrapId}
                params={params}
                setParams={setParams}
                palette={palette}
                seed={seed}
                reroll={() => setSeed((s) => s + 1)}
                onBack={() => go(2)}
                onNext={() => go(4)}
              />
            )}
            {step === 4 && (
              <StepConfirm onReady={() => go(5)} onRedo={() => go(2)} />
            )}
            {step === 5 && (
              <StepReveal
                templateId={templateId}
                wrapId={wrapId}
                palette={palette}
                params={params}
                seed={seed}
                onRedo={() => go(2)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- Bước 1: Lời chào ---------- */
function StepIntro({ player, onNext }) {
  return (
    <div className="card center">
      <div className="sticker-slot" aria-hidden>
        (ảnh sticker
        <br />
        thêm sau 🌸)
      </div>
      <p className="lead">Xin chào Mina 👋</p>
      <p className="sub">
        Tớ thấy Mina rất thích hoa cẩm tú cầu, thế nên hôm nay tớ muốn tặng cho
        Mina một món quà nhỏ. Sang bước tiếp theo để biết đó là gì nhé!
      </p>

      <div className="btn-row">
        <button
          className={`music-toggle ${player.playing ? 'on' : ''}`}
          onClick={player.toggle}
        >
          <span className="dot" />
          {player.playing ? 'Đang phát nhạc' : 'Bật nhạc nghe nhé'}
        </button>
      </div>
      <p className="note">
        Nếu cậu muốn làm nó cùng một tâm trạng vui vẻ hơn, bấm nút trên để nghe
        nhạc nha 🎵
      </p>

      <div className="btn-row">
        <button className="btn" onClick={onNext}>
          Bước tiếp theo →
        </button>
      </div>
    </div>
  )
}

/* ---------- Bước 2: Chọn màu ---------- */
function StepColors({ palette, setPalette, onBack, onNext }) {
  const [maxNote, setMaxNote] = useState(false)
  const noteTimer = useRef(null)
  const setAt = (i, val) =>
    setPalette((p) => p.map((c, idx) => (idx === i ? val : c)))
  const add = () => {
    if (palette.length >= MAX_COLORS) {
      setMaxNote(true)
      clearTimeout(noteTimer.current)
      noteTimer.current = setTimeout(() => setMaxNote(false), 3200)
      return
    }
    setPalette((p) => [...p, '#c9c3b6'])
  }
  const remove = (i) =>
    palette.length > MIN_COLORS &&
    setPalette((p) => p.filter((_, idx) => idx !== i))

  return (
    <div className="card">
      <p className="step-title">Chọn màu cho bó hoa 🎨</p>
      <p className="step-desc">
        Chọn từ 2 đến {MAX_COLORS} màu — hoa sẽ loang các tông này với nhau.
      </p>

      <p className="section-label">Gợi ý sẵn</p>
      <div className="presets">
        {PRESET_PALETTES.map((pre) => (
          <button
            key={pre.name}
            className="preset"
            onClick={() => setPalette(pre.colors)}
          >
            <span className="strip">
              {pre.colors.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
            <small>{pre.name}</small>
          </button>
        ))}
      </div>

      <p className="section-label">Màu của cậu ({palette.length})</p>
      <div className="color-list">
        {palette.map((c, i) => (
          <div className="color-row" key={i}>
            <label className="swatch" style={{ background: c }}>
              <input
                type="color"
                value={c}
                onChange={(e) => setAt(i, e.target.value)}
              />
            </label>
            <span className="color-hex">{c.toUpperCase()}</span>
            <button
              className="icon-btn"
              onClick={() => remove(i)}
              disabled={palette.length <= MIN_COLORS}
              aria-label="Xoá màu"
            >
              −
            </button>
          </div>
        ))}
      </div>

      <div className="btn-row" style={{ justifyContent: 'flex-start', marginTop: 14, gap: 10 }}>
        <button className="btn secondary" onClick={add}>
          + Thêm màu
        </button>
        {maxNote && (
          <span className="max-note">khả năng của tớ chỉ dừng lại ở 6 màu thui =)))</span>
        )}
      </div>

      <div className="btn-row">
        <button className="btn ghost" onClick={onBack}>
          ← Quay lại
        </button>
        <button className="btn" onClick={onNext}>
          Tiếp tục →
        </button>
      </div>
    </div>
  )
}

/* ---------- Bước 3: Chọn template + tinh chỉnh ---------- */
function StepDesign({
  templateId,
  setTemplateId,
  wrapId,
  setWrapId,
  params,
  setParams,
  palette,
  seed,
  reroll,
  onBack,
  onNext,
}) {
  const setParam = (key, val) =>
    setParams((p) => ({ ...p, [key]: val }))

  return (
    <div className="card design">
      <div className="design-head">
        <p className="step-title">Thiết kế bó hoa 💐</p>
        <p className="step-desc">Chọn kiểu bó, dáng hoa, rồi tinh chỉnh cho vừa ý.</p>
      </div>

      <div className="design-preview">
        <div className="mini-preview">
          <Bouquet
            templateId={templateId}
            wrapId={wrapId}
            palette={palette}
            params={params}
            seed={seed}
          />
        </div>
      </div>

      <div className="design-controls">
      <p className="section-label">Kiểu bó</p>
      <div className="template-grid">
        {WRAPS.map((w) => (
          <button
            key={w.id}
            className={`template-card ${wrapId === w.id ? 'selected' : ''}`}
            onClick={() => setWrapId(w.id)}
          >
            <Bouquet
              templateId="round"
              wrapId={w.id}
              palette={GRAY_PALETTE}
              params={{ blooms: 4, density: 16, spread: 0.5 }}
              seed={3}
            />
            <b>{w.name}</b>
            <small>{w.hint}</small>
          </button>
        ))}
      </div>

      <p className="section-label">Dáng hoa</p>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`template-card ${templateId === t.id ? 'selected' : ''}`}
            onClick={() => setTemplateId(t.id)}
          >
            <Bouquet
              templateId={t.id}
              wrapId={wrapId}
              palette={GRAY_PALETTE}
              params={{ blooms: 4, density: 16, spread: 0.5 }}
              seed={3}
            />
            <b>{t.name}</b>
            <small>{t.hint}</small>
          </button>
        ))}
      </div>

      <p className="section-label">Tinh chỉnh</p>
      <div className="slider-row">
        <label>
          <span>Số bông</span>
          <span>{params.blooms}</span>
        </label>
        <input
          type="range"
          min="1"
          max="9"
          value={params.blooms}
          onChange={(e) => setParam('blooms', Number(e.target.value))}
        />
      </div>
      <div className="slider-row">
        <label>
          <span>Độ dày tán</span>
          <span>{params.density}</span>
        </label>
        <input
          type="range"
          min="12"
          max="42"
          value={params.density}
          onChange={(e) => setParam('density', Number(e.target.value))}
        />
      </div>
      <div className="slider-row">
        <label>
          <span>Độ xòe</span>
          <span>{Math.round(params.spread * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={params.spread}
          onChange={(e) => setParam('spread', Number(e.target.value))}
        />
      </div>

      <div className="btn-row design-actions">
        <button className="btn ghost" onClick={onBack}>
          ← Đổi màu
        </button>
        <button className="btn ghost" onClick={reroll}>
          ↻ Xáo hoa
        </button>
        <button className="btn" onClick={onNext}>
          Xong! →
        </button>
      </div>
      </div>
    </div>
  )
}

/* ---------- Bước 4: Xác nhận ---------- */
function StepConfirm({ onReady, onRedo }) {
  return (
    <div className="card center">
      <div className="sticker-slot" aria-hidden>
        (ảnh sticker
        <br />
        thêm sau 💕)
      </div>
      <p className="lead">Mina iu đã sẵn sàng để đón nhận món quà này chưa?</p>
      <div className="btn-row">
        <button className="btn block" onClick={onReady}>
          Sẵn sàng!!! 🎁
        </button>
        <button className="btn secondary block" onClick={onRedo}>
          Mina muốn chọn lại màu và thiết kế
        </button>
      </div>
    </div>
  )
}

/* ---------- Bước 5: Hé lộ bó hoa ---------- */
function StepReveal({ templateId, wrapId, palette, params, seed, onRedo }) {
  const bouquetRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const saveImage = async () => {
    const svg = bouquetRef.current?.querySelector('svg')
    if (!svg || saving) return
    setSaving(true)
    try {
      await saveBouquetImage(svg, {
        fileName: 'bo-hoa-tang-mina.png',
        caption: 'Tặng Mina 🌸',
        subtitle: 'Mong Mina luôn vui và bình yên 💙',
      })
    } catch (e) {
      console.error('Không xuất được ảnh:', e)
    }
    setSaving(false)
  }

  const burst = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -Math.random() * 260 - 40,
        rot: Math.random() * 360,
        color: palette[i % palette.length],
        delay: 0.3 + Math.random() * 0.5,
      })),
    [palette],
  )

  return (
    <div className="card reveal-wrap">
      <motion.div
        className="reveal-bouquet"
        ref={bouquetRef}
        initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.15 }}
      >
        <Bouquet
          templateId={templateId}
          wrapId={wrapId}
          palette={palette}
          params={params}
          seed={seed}
        />
      </motion.div>

      {/* Cánh hoa bay ra */}
      {burst.map((b) => (
        <motion.span
          key={b.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '55%',
            width: 12,
            height: 12,
            borderRadius: '50% 50% 50% 0',
            background: b.color,
            pointerEvents: 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: b.x, y: b.y, opacity: [0, 1, 0], scale: 1, rotate: b.rot }}
          transition={{ duration: 1.8, delay: b.delay, ease: 'easeOut' }}
        />
      ))}

      <motion.p
        className="reveal-caption"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        Tặng Mina 🌸
      </motion.p>
      <motion.p
        className="reveal-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Mong Mina luôn vui và bình yên như những đóa hoa này 💙
      </motion.p>

      <motion.div
        className="btn-row reveal-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <button className="btn block" onClick={saveImage} disabled={saving}>
          {saving ? 'Đang lưu…' : '📷 Tải ảnh bó hoa về'}
        </button>
        <button className="btn secondary block" onClick={onRedo}>
          Làm lại bó khác
        </button>
      </motion.div>
    </div>
  )
}
