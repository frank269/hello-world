# FAQ

## Repo này là gì?

Đây là ứng dụng demo hello-world viết bằng Node.js, dùng Express để phục vụ trang web và Socket.IO để chat cũng như chơi game trực tiếp giữa hai người dùng.

## Cách chạy dự án như thế nào?

Cài dependencies bằng `npm install`, sau đó chạy `node server.js`. Server lắng nghe ở cổng `process.env.PORT` (mặc định 3000), truy cập `http://localhost:3000` để xem trang chủ.

## Các route chính có gì?

- `/` và `/index`: trả về trang `views/index.html`
- `/home`: trả về trang `views/home.html`
- `/game`: mở trang chơi game (render bằng EJS) kèm kết nối Socket.IO
