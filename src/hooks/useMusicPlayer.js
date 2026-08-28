import { useEffect, useRef, useState } from 'react'

// Quản lý 1 playlist: bài hiện tại, phát/dừng, âm lượng, next/prev.
// Trình duyệt chặn tự phát -> chỉ phát sau khi người dùng bấm nút.
export function useMusicPlayer(songs) {
  const audioRef = useRef(null)
  const loadedIndex = useRef(-1)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)

  // tạo audio một lần
  useEffect(() => {
    const a = new Audio()
    a.volume = 0.6
    audioRef.current = a
    const onEnded = () => setIndex((i) => (i + 1) % songs.length) // hết bài -> bài kế (lặp playlist)
    a.addEventListener('ended', onEnded)
    return () => {
      a.pause()
      a.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [songs.length])

  // đồng bộ audio theo bài + trạng thái phát
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (loadedIndex.current !== index) {
      a.src = songs[index].src
      loadedIndex.current = index
    }
    if (playing) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [index, playing, songs])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return {
    song: songs[index],
    index,
    playing,
    volume,
    setVolume,
    toggle: () => setPlaying((p) => !p),
    play: () => setPlaying(true),
    next: () => setIndex((i) => (i + 1) % songs.length),
    prev: () => setIndex((i) => (i - 1 + songs.length) % songs.length),
    select: (i) => setIndex(i),
  }
}
