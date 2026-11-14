# Anima Prompt Project

Sản xuất prompt ảnh anime một dòng tag cho model Anima (CircleStone Labs), chỉ dùng tag từ `anima-tags.md` và dữ liệu Latent trong `tags/`.

## Cấu trúc
- `anima-tags.md` — output contract Anima (byte-identical với preset gốc).
- `AGENTS.md` — rule cho agent khi tạo prompt anime.
- `WORKFLOW.md` — quy trình sản xuất prompt từng bước.
- `tags/` — 95 nhóm tag Latent; mỗi dòng một tag, sắp theo độ phổ biến, `~tag` = deprecated.
- `pipeline/` — script crawl, rebuild và validate dữ liệu tag.

## Dữ liệu
- Latent snapshot 2026-08-16: 95/95 nhóm, 16.801 dòng tag, 14.738 tag unique, 0 lệch.
- Anima Tags: 4.629 byte, SHA-256 `743192346aa039d5b46267009a2f0b24ddef9094fe91d17ed8a103f1890fbe37`.
- Nguồn tag: https://tags.latent.moe (tag data © Danbooru contributors). Anima Tags: GenorTG/ComfyUI-PromptForge.
- Third-party notices: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Lệnh
```bash
node pipeline/build.js      # rebuild tags/ từ results.json
node pipeline/validate.js   # kiểm tra đầy đủ
cd pipeline && node scrape.js   # crawl lại; xóa cache/ để fetch mới
```
