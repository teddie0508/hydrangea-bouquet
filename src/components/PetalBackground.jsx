import { useMemo } from 'react'

// Vài cánh hoa nhỏ trôi nhẹ ở nền cho sinh động (dùng CSS, nhẹ máy).
export default function PetalBackground({ palette }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 16,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  )

  return (
    <div className="petal-bg" aria-hidden>
      {petals.map((p) => (
        <span
          key={p.id}
          className="float-petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: palette[p.id % palette.length],
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
