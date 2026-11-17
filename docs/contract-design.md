# Thiết kế RestaurantBooking

Đã hiện thực bước 02 ngày 17/11/2026 trong `contracts/RestaurantBooking.sol`.
Solidity 0.8.28, optimizer 200 runs, EVM paris; không thêm dependency.

## Dữ liệu và quyền

- `owner` là `msg.sender` lúc deploy và `immutable`: không đổi owner.
- `tables[id]` chứa `exists` và `capacity`. Capacity chỉ hiển thị số chỗ.
- `tableIds` lưu thứ tự đăng ký; `getTableIds()` trả danh sách để UI liệt kê mapping.
- `bookings[tableId][slotId]` là địa chỉ giữ booking. `address(0)` nghĩa là trống;
  muốn phân biệt bàn chưa tồn tại phải đọc `tables`.
- `msg.sender` là người gọi trực tiếp contract. Không nhận địa chỉ khách từ form,
  không dùng `tx.origin`. Mọi địa chỉ, kể cả owner, có thể đặt bàn.

## API và lỗi

Các kiểm tra trong mỗi hàng chạy theo thứ tự ghi dưới đây. Lỗi là custom error,
được đưa vào ABI và có thể giải mã bằng ethers `Interface.parseError(data)`.

| API | Điều kiện / lỗi | Thay đổi khi thành công |
| --- | --- | --- |
| `registerTable(tableId, capacity)` | `NotOwner()`, `InvalidTableId()`, `InvalidCapacity()`, `TableAlreadyExists(tableId)` | Lưu bàn, thêm ID, phát `TableRegistered(tableId, capacity)` |
| `reserve(tableId, slotId)` | `TableNotFound(tableId)`, `InvalidSlotId()`, `SlotAlreadyBooked(tableId, slotId)` | Gán booking bằng msg.sender, phát `TableReserved(tableId, slotId, customer)` |
| `cancel(tableId, slotId)` | `TableNotFound(tableId)`, `InvalidSlotId()`, `BookingNotFound(tableId, slotId)`, `NotBookingOwner()` | Xóa booking, phát `BookingCancelled(tableId, slotId, customer)` |
| `getTableIds()` | Đọc công khai | Trả ID theo thứ tự đăng ký |
| `owner()`, `tables(id)`, `bookings(id, slot)` | Getter công khai | Không gửi giao dịch |

`tableId`, `capacity`, `slotId` hợp lệ phải lớn hơn 0. Chỉ người giữ booking
được hủy; owner không có quyền hủy thay khách. Sau khi A hủy, B có thể đặt lại;
A không còn quyền hủy booking mới của B.

Event đăng ký có tableId indexed. Hai event booking có tableId, slotId, customer
indexed đúng kế hoạch. Event phát sau kiểm tra và cập nhật dữ liệu.
`revert` hủy thay đổi và logs của toàn giao dịch; event lịch sử trước đó vẫn giữ nguyên.

## Slot và giới hạn

`slotId = timestamp bắt đầu (giây) / 3600`, tại đầu giờ; khoảng thời gian là
`[slotId * 3600, (slotId + 1) * 3600)`. Ví dụ 18/11/2026 18:00 UTC+07:00 là
slot `498611`. UI bước 04 sẽ chuyển đổi ngày giờ với UTC+07:00 tường minh.
Contract chỉ kiểm tra slot dương; không cấm giờ quá khứ, không giới hạn giờ mở cửa.

Một nhà hàng, slot một giờ, không thanh toán/đặt cọc/backend/thông tin cá nhân.
Không xóa bàn, sửa capacity hoặc đặt nhiều slot trong một giao dịch.
Các hàm ghi không payable và không gọi contract bên ngoài.
Danh sách bàn chưa phân trang, phù hợp quy mô demo.

## Kiểm chứng và bước tiếp theo

Xem [test-results.md](test-results.md): 24 test đạt trên mạng mô phỏng Hardhat.
Test sử dụng owner và hai khách; kiểm tra custom error, event, state và receipt revert.
Đã deploy và xác minh Ganache ở bước 03; xem `deployment.json` và
`frontend/src/generated/contract.json` để lấy metadata/ABI/address/chainId thực tế.
Chưa thực hiện kiểm thử toàn bộ nghiệp vụ trên Ganache hoặc demo MetaMask.
