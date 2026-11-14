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

3. **Tra tag đa dạng**
   - Tag cụ thể: đổi khoảng trắng → `_`, tra exact: `grep -rnx "tag_name" tags`.
   - Không thấy exact: mở `tags/README.md` chọn nhóm, đọc cả file nhóm và grep substring: `grep -rn "ponytail" tags`.
   - Thử synonym/biến thể: `silver_hair` → `grey_hair`/`white_hair`; `hallway` → `school`/`window`/`classroom`; `nắng xiên` → `sunlight`/`sidelighting`/`backlighting`/`light_rays`.
   - So sánh 2–3 ứng viên theo nghĩa, độ cụ thể, thứ hạng phổ biến và deprecated; chọn tag đúng nhất, không chọn generic nếu có tag chính xác.
   - Có và không `~` → dùng; xuất lại dạng khoảng trắng.
   - Không có ở cả Latent và Anima Tags → đề xuất tag gần nhất trước khi viết; không tạo tag mới.
   - Tuổi/artist do user nêu: giữ đúng; `@artist` chỉ khi user nêu tên.

4. **Lập bảng nghĩa + kiểm tra xung đột**
   - Lập bảng nội bộ (không xuất ra prompt), cột: `Tag | Nghĩa | Nguồn | Slot | Xung đột/ghi chú`.
   - Mỗi tag ghi nghĩa ngắn, file nguồn, slot và cảnh báo.
   - Ví dụ một dòng: `grey hair | tóc xám/bạc | tags/appearance/hair_color.md | hair | không dùng thêm white hair`.
   - Kiểm tra chéo:
     - count: `1girl`/`1boy`/`solo`/`2girls`/`multiple girls`.
     - setting: `indoors`/`outdoors`, `day`/`night`/`sunset`.
     - hair/eyes: 2 màu trừ `heterochromia`, dài/ngắn, kiểu tóc.
     - clothing: mặc/khoả thân, các mảnh áo xung đột.
     - expression: cười/khóc/`expressionless`/`serious`…
     - pose/act: đứng/ngồi/nằm/chạy…
     - framing/camera: `full body` vs `close-up`, `from above` vs `from below`, POV.
     - rating vs nội dung; tuổi/size đúng.
     - trùng lặp/implication: tag này đã bao hàm tag kia → bỏ tag thừa.
   - Nếu xung đột: bỏ tag sai hoặc hỏi user; không giữ cả hai.

5. **Dựng output**
   - Một dòng, chữ thường, phân cách `, `; không heading, giải thích, negative prompt hay `PROMPT:`.
   - Khoảng trắng thay `_`, trừ score tag.
   - Thứ tự, quality prefix, rating, weight, số tag: theo `anima-tags.md`.
   - Không thêm chủ thể/đạo cụ ngoài yêu cầu.

6. **Kiểm tra cuối**
   - Đổi tag về `_` (trừ score) và grep lại toàn bộ.
   - 100% tag thuộc `tags/` hoặc `anima-tags.md`; không `~`.
   - Không trùng/mâu thuẫn; đúng format.
   - Chỉ trả lời một dòng tag.

## Ngoại lệ
- Tag thiếu: đề xuất tag gần nhất; nếu user vẫn yêu cầu tag không có, nói rõ và đưa phương án.
- NSFW: theo mục NSFW của Anima; rating tương ứng.
- Reference image: text user thắng ảnh ở age, body, clothing, pose, act, camera.

## Checklist
- [ ] Đã đọc `anima-tags.md`.
- [ ] Đã tra exact + biến thể/synonym, không chỉ một grep.
- [ ] Đã lập bảng tag → nghĩa → nguồn → xung đột.
- [ ] 100% tag hợp lệ, không `~`, không trùng/mâu thuẫn.
- [ ] Một dòng, đúng format Anima.
