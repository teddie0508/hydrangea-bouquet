import { useEffect, useRef, useState } from 'react'

// Quản lý 1 file nhạc loop. Trình duyệt chặn tự phát -> chỉ phát khi người dùng bấm nút.
export function useAudio(src) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.6
    audioRef.current = audio
    const onEnd = () => setPlaying(false)
    audio.addEventListener('pause', () => setPlaying(false))
    audio.addEventListener('play', () => setPlaying(true))
    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnd)
      audioRef.current = null
    }
  }, [src])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        /* người dùng chưa tương tác hoặc bị chặn */
      }
    } else {
      audio.pause()
    }
  }

  const play = async () => {
    const audio = audioRef.current
    if (audio && audio.paused) {
      try {
        await audio.play()
      } catch {
        /* bỏ qua */
      }
    }
  }

  return { playing, toggle, play }
}
