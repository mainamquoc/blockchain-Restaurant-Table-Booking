# Bước 02 — Viết smart contract và kiểm thử logic

## Nhiệm vụ giao cho AI

Đọc hướng dẫn chung, kế hoạch chính mục 2/4/7 và `docs/implementation-status.md`. Hãy viết source, chạy test và sửa cho đạt; không chỉ xuất code vào chat. Hoàn thành bước này chưa cần mở Ganache hoặc MetaMask.

## Điều kiện đầu vào

Bước 01 có môi trường compile/test dùng được. Nếu thiếu, sửa đúng phần công cụ trước và cập nhật trạng thái; không cài lại tùy tiện cả project.

## AI tự thực hiện

1. Tạo `contracts/RestaurantBooking.sol` với owner là địa chỉ deploy và không đổi trong phiên bản cơ bản.
2. Dùng `Table { bool exists; uint256 capacity; }`, mapping bàn, danh sách ID và mapping hai cấp `bookings[tableId][slotId]` trả địa chỉ khách.
3. Hiện thực API:

```solidity
registerTable(uint256 tableId, uint256 capacity)
reserve(uint256 tableId, uint256 slotId)
cancel(uint256 tableId, uint256 slotId)
getTableIds()
// Getter công khai: owner(), tables(tableId), bookings(tableId, slotId)
```

4. Chỉ owner đăng ký bàn; ID/số chỗ phải dương, ID không trùng. Đặt yêu cầu bàn tồn tại, slot dương, cặp bàn/slot trống. Hủy yêu cầu booking tồn tại và `msg.sender` là người đang giữ, kể cả owner cũng không được hủy thay.
5. `reserve` luôn lấy chủ booking từ `msg.sender`; không thêm tham số địa chỉ khách hoặc dùng `tx.origin`.
6. Phát event đúng tên/tham số theo kế hoạch: `TableRegistered`, `TableReserved`, `BookingCancelled`; không phát event thành công trước khi kiểm tra điều kiện.
7. Chọn thông báo lỗi/custom error nhất quán, có thể giải mã trên frontend. Không thêm thanh toán, đặt cọc, backend hoặc logic cấm giờ quá khứ.
8. Viết test tương ứng T01–T16 trong kế hoạch. Các test ghép nhiều lỗi như ID 0/số chỗ 0 phải tách assertion để biết điều kiện nào được kiểm tra.
9. Kiểm tra event cùng tham số, trạng thái sau thành công, trạng thái không đổi và không có event thành công sau revert. Kiểm tra độc lập giữa bàn/slot và luồng đặt → hủy → đặt lại bằng hai khách.
10. Chạy compile/test, sửa lỗi thật; lưu kết quả cùng phiên bản và lệnh vào `docs/test-results.md`. Nếu có log từ bước trước, giữ hoặc phân mục rõ.
11. Viết `docs/contract-design.md` ngắn, giải thích cấu trúc, quyền, slot và giới hạn; cập nhật trạng thái bàn giao.

## Quy ước slot phải giữ nhất quán

- Slot là một giờ, `slotId = timestamp bắt đầu tính bằng giây / 3600` tại đúng đầu giờ.
- Mỗi số nguyên dương là một khung giờ riêng, không phải mã tùy ý trỏ tới khoảng thời gian tự do.
- Contract chỉ cần kiểm tra slot dương trong phạm vi này; không nhận start/end tùy ý.
- Số chỗ của bàn chỉ để hiển thị, không có số lượng thực khách trong booking cơ bản.

## Phần thủ công

Không có thao tác thủ công bắt buộc cho code/test nếu AI có terminal. Người dùng chỉ cần đọc giải thích để hiểu `msg.sender`, mapping, address zero, event và revert phục vụ trình bày cá nhân. Không yêu cầu người dùng compile hoặc chép ABI thay AI.

Nếu compiler cần tải qua mạng nhưng mạng lỗi, lưu đúng lỗi và phần đã làm; không tự ghi “test pass”.

## File bàn giao

- Contract hoàn chỉnh và file test phù hợp bộ công cụ đã chọn.
- `docs/contract-design.md`, `docs/test-results.md`.
- `docs/implementation-status.md`: API/errors đã chốt, compiler/EVM target, lệnh và kết quả.

## Điều kiện hoàn thành

- [ ] Compile và toàn bộ test logic đạt bằng lệnh thực tế.
- [ ] Kiểm tra cả A, B và owner trong các trường hợp hủy.
- [ ] Tham số event và dữ liệu sau revert được xác minh.
- [ ] Chưa đánh đồng test trên mạng thử của Hardhat với deploy thật trên Ganache.
- [ ] Bàn giao bước 03, không có địa chỉ contract giả.
