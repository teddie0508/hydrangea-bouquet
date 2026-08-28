import { useEffect, useRef, useState } from 'react'

// Quản lý 1 playlist: bài hiện tại, phát/dừng, âm lượng, next/prev.
// play() được gọi TRỰC TIẾP trong lúc người dùng bấm (không qua effect) để
// trình duyệt không chặn. `started` = đã bật nhạc lần đầu (dùng để fade-in UI).
export function useMusicPlayer(songs) {
  const audioRef = useRef(null)
  const indexRef = useRef(0)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [volume, setVolumeState] = useState(0.6)

  // tạo audio một lần
  useEffect(() => {
    const a = new Audio()
    a.volume = 0.6
    a.src = songs[0].src
    audioRef.current = a
    const onEnded = () => goTo((indexRef.current + 1) % songs.length, true) // hết bài -> bài kế
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('ended', onEnded)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.pause()
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = (a) => {
    a.play()
      .then(() => setStarted(true))
      .catch(() => {})
  }

  function goTo(i, shouldPlay) {
    const a = audioRef.current
    if (!a) return
    a.src = songs[i].src
    indexRef.current = i
    setIndex(i)
    if (shouldPlay) start(a)
  }

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) start(a)
    else a.pause()
  }

  const setVolume = (v) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  return {
    song: songs[index],
    index,
    playing,
    started,
    volume,
    setVolume,
    toggle,
    play: () => {
      const a = audioRef.current
      if (a && a.paused) start(a)
    },
    next: () => goTo((indexRef.current + 1) % songs.length, !audioRef.current?.paused),
    prev: () => goTo((indexRef.current - 1 + songs.length) % songs.length, !audioRef.current?.paused),
    select: (i) => goTo(i, true),
  }
}
