import { useState } from 'react'

// Trình phát nhạc nổi ở góc trên phải.
// Desktop: thanh đầy đủ luôn hiển thị. Mobile: nút tròn, chạm để bung bảng điều khiển.
export default function MusicPlayer({ player, songs }) {
  const [open, setOpen] = useState(false) // bung bảng (mobile)
  const [listOpen, setListOpen] = useState(false) // danh sách bài
  const s = player.song
  const label = s.artist ? `${s.title} — ${s.artist}` : s.title
  const multi = songs.length > 1

  return (
    <div className={`music-player ${player.started ? 'shown' : ''}`}>
      <button
        className={`mp-fab ${player.playing ? 'playing' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Trình phát nhạc"
      >
        <span className="mp-fab-icon">♪</span>
      </button>

      <div className={`mp-panel ${open ? 'open' : ''}`}>
        <div className="mp-head">
          {multi && (
            <button className="mp-icon-btn" onClick={() => setListOpen((v) => !v)} aria-label="Danh sách bài">
              ☰
            </button>
          )}
          <div className="mp-title" title={label}>
            {label}
          </div>
        </div>

        <div className="mp-controls">
          {multi && (
            <button className="mp-icon-btn" onClick={player.prev} aria-label="Bài trước">
              ⏮
            </button>
          )}
          <button className="mp-play" onClick={player.toggle} aria-label={player.playing ? 'Dừng' : 'Phát'}>
            {player.playing ? '❚❚' : '►'}
          </button>
          {multi && (
            <button className="mp-icon-btn" onClick={player.next} aria-label="Bài sau">
              ⏭
            </button>
          )}
          <span className="mp-vol">
            <span className="mp-vol-icon">🔉</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={player.volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              aria-label="Âm lượng"
            />
          </span>
        </div>

        {multi && listOpen && (
          <ul className="mp-list">
            {songs.map((song, i) => (
              <li
                key={i}
                className={i === player.index ? 'active' : ''}
                onClick={() => {
                  player.select(i)
                  player.play()
                }}
              >
                {song.artist ? `${song.title} — ${song.artist}` : song.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
