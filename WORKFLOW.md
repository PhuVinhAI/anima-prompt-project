# Workflow — sản xuất prompt Anima

## Mục đích
Biến yêu cầu nhân vật/cảnh anime thành một dòng tag Anima, chỉ dùng tag từ `anima-tags.md` hoặc `tags/`.

## Đọc trước
- `anima-tags.md` — output contract; nguồn chân lý về format, thứ tự, quality, rating.
- `tags/README.md` — mục lục 95 nhóm tag Latent.

## Các bước

1. **Chốt yêu cầu**
   - Xác định: số người, nhân vật/series, ngoại hình, trang phục, pose, bối cảnh, ánh sáng, style, NSFW.
   - Xác định độ chi tiết để chọn số tag.
   - Thiếu thông tin quan trọng thì hỏi; không tự bịa.

2. **Tách slot**
   - count, character, series, artist, appearance, hair, eyes, body, clothing, undress, expression, pose, act, hands, framing, camera, place, lighting, style, effects.
   - Multi-character: tách riêng từng người, không trộn trait.

3. **Tra tag**
   - Tag cụ thể: đổi khoảng trắng → `_`, rồi `grep -rnx "tag_name" tags`.
   - Có và không `~` → dùng; xuất lại dạng khoảng trắng.
   - Không có → kiểm tra tag chung trong `anima-tags.md`.
   - Không có ở cả hai → đề xuất tag gần nhất trước khi viết; không tạo tag mới.
   - Tuổi/artist do user nêu: giữ đúng; `@artist` chỉ khi user nêu tên.

4. **Kiểm tra phù hợp**
   - Đúng nhân vật/ngoại hình; không gán tag của nhân vật khác.
   - Không mâu thuẫn: solo vs 2girls, 1girl vs 1boy, indoors vs outdoors, day vs night, tóc/mắt trái mô tả.
   - Tuổi, size, camera, POV theo Anima.
   - Rating khớp nội dung.
   - Không tag `~`.

5. **Dựng output**
   - Một dòng, chữ thường, phân cách `, `; không heading, giải thích, negative prompt hay `PROMPT:`.
   - Khoảng trắng thay `_`, trừ score tag.
   - Thứ tự, quality prefix, rating, weight, số tag: theo `anima-tags.md`.
   - Không thêm chủ thể/đạo cụ ngoài yêu cầu.

6. **Kiểm tra cuối**
   - Đổi tag về `_` (trừ score) và grep lại toàn bộ.
   - 100% tag thuộc `tags/` hoặc `anima-tags.md`; không `~`.
   - Không mâu thuẫn; đúng format.
   - Chỉ trả lời một dòng tag.

## Ngoại lệ
- Tag thiếu: đề xuất tag gần nhất; nếu user vẫn yêu cầu tag không có, nói rõ và đưa phương án.
- NSFW: theo mục NSFW của Anima; rating tương ứng.
- Reference image: text user thắng ảnh ở age, body, clothing, pose, act, camera.

## Checklist
- [ ] Đã đọc `anima-tags.md`.
- [ ] Đã tách slot và tra từng tag.
- [ ] 100% tag hợp lệ, không `~`.
- [ ] Không mâu thuẫn; đúng tuổi/size/camera.
- [ ] Một dòng, đúng format Anima.
