# Bước 05 — Kiểm thử tích hợp Ganache, demo và thu bằng chứng

## Nhiệm vụ giao cho AI

Đọc hướng dẫn chung, kế hoạch mục 7/8, kết quả contract/frontend và trạng thái deployment hiện tại. Hãy chạy test tích hợp thật, chuẩn bị và hỗ trợ demo UI, thu bằng chứng có nguồn rõ ràng. Không kết luận project đã hoàn thành nếu chỉ có unit test.

## Điều kiện đầu vào

Ganache đang chạy, deployment còn bytecode, cấu hình frontend đúng. Tài khoản test có Ether test. UI và MetaMask có thể dùng; nếu chưa thì hoàn thành phần RPC độc lập trước, giữ mục UI đang chờ.

## AI tự thực hiện — test RPC

1. Đọc lại chain ID, bytecode và owner; không dựa riêng file deployment cũ, vì Ganache có thể đã reset.
2. Viết `scripts/integration-ganache.ts` hoặc file phù hợp bộ công cụ, có npm script rõ ràng.
3. Chạy với ba account Ganache đã unlock qua RPC, không cần lấy private key. Chọn ID bàn dành riêng cho test, chưa tồn tại; không reset chain và không thay booking người dùng đang demo.
4. Thực hiện đăng ký bàn → A đặt → B đặt trùng bị từ chối → B hủy sai quyền bị từ chối → A hủy → B đặt lại. Đọc trạng thái và kiểm tra event sau các bước thành công, trạng thái không đổi sau từ chối.
5. Script phải thất bại nếu hành động dự kiến bị từ chối lại thành công; không catch mọi lỗi rồi in PASS. Phân biệt lỗi RPC/cấu hình với revert theo quy tắc mong đợi.
6. Ghi account/chain/address/bàn/slot, tx hash/receipt cho giao dịch thật. Với `eth_call`/estimate gas thất bại, ghi bị từ chối trước gửi và không có tx hash; không ép gửi giao dịch revert chỉ để có hash.
7. Nếu script được chạy lại, dùng ID test mới hoặc dừng rõ ràng với state cũ; không bỏ qua assertion để làm test có vẻ idempotent.
8. Lưu log công khai vào `docs/` và cập nhật `docs/test-results.md`, chia rõ unit test, slot test, Ganache RPC integration và UI manual.

## AI chuẩn bị demo giao diện

- Tạo `docs/demo-script.md` có địa chỉ owner/A/B, URL, địa chỉ contract, slot cụ thể và ID bàn demo chưa bị dùng bởi script test.
- Demo đúng luồng: owner đăng ký → A đặt → B thử đặt trùng/hủy sai → A hủy → B đặt lại → reload và kiểm tra chủ booking.
- Nếu UI khóa thao tác sai, dùng script RPC có signer B để chứng minh contract từ chối; không sửa kiểm tra quyền hoặc thêm nút hủy trái phép vào sản phẩm chỉ để demo.
- Chuẩn bị bảng lời giải thích: tại sao thành công, tại sao revert, trạng thái giữ nguyên thế nào, khác biệt giữa phí gas và phí đặt bàn.
- Nếu có công cụ browser/computer-use, kiểm tra giao diện thật và chụp ảnh phù hợp. Nếu không có, chỉ dẫn người dùng chính xác màn hình cần chụp; không tạo ảnh minh họa rồi ghi là screenshot thực tế.

## Người dùng thực hiện

1. Giữ Ganache và server đang chạy; mở UI bằng trình duyệt có ví đã setup.
2. Chọn đúng owner/A/B theo kịch bản, kết nối và chấp thuận giao dịch ở ví.
3. Khi AI thiếu công cụ quan sát, gửi kết quả hoặc lưu ảnh/video thật vào `docs/screenshots/` / `docs/demo.mp4`.
4. Không quay màn hình đang hiện khóa cá nhân/mnemonic. Chỉ cần account công khai và các màn hình giao dịch.
5. Xác nhận bước đổi mạng và từ chối ký nếu chưa hoàn thành ở bước 04.

AI không bắt người dùng chạy lại thao tác đã có bằng chứng hợp lệ chỉ vì sang chat mới; đọc metadata/log trước. Nếu deployment đổi hoặc chain reset, xác định bằng chứng cũ thuộc lần chạy nào và chạy lại đúng phần bị ảnh hưởng.

## Danh sách bằng chứng đề xuất

| File gợi ý | Nội dung cần có |
| --- | --- |
| `01-connected.png` | Account, chain ID và contract đang dùng |
| `02-reserved-by-a.png` | Booking bàn/slot thuộc A và trạng thái giao dịch |
| `03-duplicate-rejected.png` | Thao tác đặt trùng bị từ chối, hoặc log RPC thật |
| `04-unauthorized-cancel.png` | B hủy của A bị từ chối, chủ booking vẫn A |
| `05-cancelled.png` | A hủy xong bàn trống |
| `06-reserved-by-b.png` | B đặt lại, reload vẫn thuộc B |

Tên trên là gợi ý, không phải các file đã tồn tại. Đề cho phép ảnh hoặc video; không bắt người dùng làm cả hai nếu một loại đã đủ rõ.

## Điều kiện hoàn thành

- [ ] Test tự động có kết quả thật và lỗi được kiểm tra đúng loại.
- [ ] Luồng tích hợp chạy trên Ganache, với ít nhất hai khách khác nhau.
- [ ] Có một giao dịch thành công và thao tác không hợp lệ/không có quyền bị từ chối, được giải thích.
- [ ] UI MetaMask được dùng thật; có ảnh/video đáp ứng đề.
- [ ] Mọi kết quả có nguồn và được ghi đúng môi trường, không có PASS giả.
- [ ] Cập nhật trạng thái để bước 06 biết phần nào đã được xác minh.
