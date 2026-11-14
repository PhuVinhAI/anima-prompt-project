# Agent rules — tạo nhân vật anime

## Kích hoạt
Khi user yêu cầu tạo nhân vật anime hoặc viết prompt ảnh anime.

## Bắt buộc
- Đọc `anima-tags.md` và làm theo toàn bộ quy tắc trong đó (format, thứ tự, quality, rating, cách viết).
- Chỉ dùng tag có trong `anima-tags.md` hoặc `tags/` (Latent). Không bịa tag ngoài hai nguồn.
- Nếu concept/tag không có trong cả hai: đề xuất tag gần nhất trước khi viết.
- Không sửa `tags/`, `anima-tags.md`, `pipeline/`.

## Quy trình
1. Đọc yêu cầu và Anima Tags.
2. Tra tag cụ thể trong `tags/` bằng `grep -rnx "tag_name" tags` (dạng underscore); tránh tag deprecated (`~`).
3. Kiểm tra tag đúng nhân vật/mô tả và không mâu thuẫn.
4. Xuất output đúng định dạng Anima Tags.

## Kiểm tra
- [ ] Đã đọc Anima Tags.
- [ ] Mọi tag thuộc Anima Tags hoặc Latent.
- [ ] Không tag deprecated; không mâu thuẫn; đúng nhân vật/mô tả.
- [ ] Đúng format Anima Tags.
