// Danh sách bài hát cho trình phát.
// CÁCH THÊM BÀI: bỏ file .mp3 vào thư mục "public/songs/" rồi thêm 1 dòng vào
// mảng dưới đây. src là đường dẫn bắt đầu bằng "/songs/..." (trỏ tới file đó).
// Lưu ý: đặt tên file KHÔNG dấu cách, không dấu tiếng Việt cho chắc ăn.

export const SONGS = [
  { title: 'love is', artist: 'drt', src: '/songs/love-is-drt.mp3' },
  { title: 'thế giới của anh', artist: 'drt', src: '/songs/the-gioi-cua-anh-drt.mp3' },
  { title: 'Best Part', artist: 'H.E.R. ft. Daniel Caesar', src: '/songs/best-part.mp3' },
]
