// Danh sách bài hát cho trình phát.
// CÁCH THÊM BÀI: bỏ file .mp3 vào thư mục "public/songs/" rồi thêm 1 dòng vào
// mảng dưới đây. src là đường dẫn bắt đầu bằng "/songs/..." (trỏ tới file đó).
// Ví dụ: { title: 'Tên bài', artist: 'Ca sĩ', src: '/songs/ten-file.mp3' }

export const SONGS = [
  { title: 'love is', artist: 'drt', src: '/songs/love-is-drt.mp3' },
  // { title: 'Bài hát 2', artist: '', src: '/songs/bai-2.mp3' },
  // { title: 'Bài hát 3', artist: '', src: '/songs/bai-3.mp3' },
]
