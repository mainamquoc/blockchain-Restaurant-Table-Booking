# Kịch bản demo Restaurant Table Booking

Giao diện tiếng Anh: <http://127.0.0.1:5173/>. Ganache chain `1337`, RPC
`http://127.0.0.1:7545`, contract `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`.
Không deploy hoặc reset chain trước khi demo bằng chứng đã lưu.

| Vai trò | Địa chỉ |
| --- | --- |
| Owner | `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec` |
| A | `0x810A640B6089B12ab3bb7Bde1697752129679828` |
| B | `0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7` |

## Bàn và slot

- UI: **Table 1**, 4 seats; **2026-11-17**, **18:00–19:00 UTC+07:00**, slot **498587**.
- Đây là bàn owner đã đăng ký qua UI; không đăng ký lại để tránh lỗi ID trùng.
- Tự động RPC: Table **1001**, ngày 18/11/2026 18:00, slot **498611**.
  Không dùng bàn này để thay bằng chứng UI. Table 1000 thuộc lần chạy script lỗi ban đầu.
- Sau khi demo đã xong, nếu cần quay lại từ đầu, chọn bàn demo mới bằng owner hoặc
  một slot trống khác; không hủy booking của tài khoản khác bằng script để dàn dựng.

## Luồng trình bày và ảnh

| Bước | Thao tác | Giải thích / bằng chứng |
| --- | --- | --- |
| 1 | Owner kết nối và đăng ký bàn 1, 4 chỗ | Chỉ owner được registerTable; đã có receipt block 27 và ảnh người dùng |
| 2 | A chọn slot 498587, Reserve table và Confirm | Booking thuộc msg.sender, thấy Your booking; đã có receipt block 34 và ảnh người dùng |
| 3 | Kiểm tra B đặt trùng và hủy sai | `npm.cmd run demo:rejections` trong lúc A còn giữ booking; đã chạy đạt, chỉ estimateGas, không có tx hash |
| 4 | A bấm Cancel booking và Confirm | Booking trở về address zero; ảnh đề xuất `05-cancelled.png` |
| 5 | Chuyển B, Reserve table và Confirm | Booking mới thuộc B; ảnh `06-reserved-by-b.png` |
| 6 | Reload, Connect MetaMask, giữ slot 498587 | Booking vẫn thuộc B vì đọc từ blockchain, không lưu giả trên trang |
| 7 | Thử Reject một yêu cầu và chuyển tạm sai mạng | Không báo thành công khi từ chối, Wrong network và khóa thao tác khi sai chain; trở lại Ganache |

UI không cho B bấm đặt/hủy booking A. Bước 3 gọi contract trực tiếp bằng signer B
để chứng minh quyền nằm trong contract; không thêm nút sai quyền vào giao diện.
File `docs/demo-rejections.json` là bằng chứng thật của hai lỗi này tại cùng bàn/slot UI.
Lệnh sẽ dừng nếu A không còn giữ booking; không làm yếu assertion để chạy lại PASS.

## Câu giải thích khi bảo vệ

| Tình huống | Vì sao |
| --- | --- |
| Đặt thành công | Bàn tồn tại, slot dương, bookings[tableId][slotId] đang là address zero |
| Đặt trùng bị từ chối | Cặp bàn/slot đã có địa chỉ giữ, SlotAlreadyBooked; không thay người đặt |
| B hủy booking A | msg.sender khác địa chỉ giữ booking, NotBookingOwner; owner cũng không hủy thay |
| A hủy rồi B đặt lại | delete đưa mapping về zero; lần reserve mới lưu địa chỉ B |
| Không có tx hash cho thao tác sai | estimateGas phát hiện revert trước gửi, không phải giao dịch đã vào block |
| Gas và phí đặt bàn | Contract không nhận tiền đặt bàn; giao dịch ghi vẫn dùng gas bằng ETH test |

## Bằng chứng và lệnh

`docs/integration-results.json` và `docs/integration-runs/` lưu RPC integration riêng.
`docs/ui-chain-evidence.json` chứa receipt/event cho các giao dịch bàn 1, cập nhật bằng:

```powershell
npm.cmd run inspect:demo
```

Lưu ảnh thực tế vào `docs/screenshots/`; ảnh phải hiện ví/chain, bàn/slot, chủ booking
và trạng thái. Không quay khóa/mnemonic. Ảnh người dùng gửi trong chat được ghi nhận
với nguồn người dùng; không coi đó là file PNG đã có trong repository.

## Kết quả buổi demo 17/11/2026

Đã hoàn thành cả luồng UI và RPC. A hủy ở block 35, B đặt lại ở block 36;
người dùng xác nhận reload vẫn giữ booking, AI quan sát trực tiếp địa chỉ B và
Your booking trên trang. Reject đã quan sát qua AX và ảnh thật. Sai mạng/khóa ghi
do người dùng xác nhận. Ảnh đã lưu: `screenshots/06-reserved-by-b.png` và
`screenshots/07-wallet-rejected.png`. Chi tiết tx và nguồn tại `test-results.md`.
