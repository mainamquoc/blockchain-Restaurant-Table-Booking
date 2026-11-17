# Thiết lập ví và frontend

Trang: <http://127.0.0.1:5173/>. Giao diện và thông báo dùng tiếng Anh theo yêu cầu.
Giữ Ganache Desktop mở, không reset workspace. Contract hiện tại:
`0xa504b217514805a4F51fc329D980445A3B0ec0Fe`.

## Thông tin mạng và tài khoản test

| Mục | Giá trị |
| --- | --- |
| RPC | `http://127.0.0.1:7545` |
| Chain ID | `1337` (`0x539`), không dùng network ID `5777` thay cho chain ID |
| Ký hiệu tiền | ETH, chỉ ETH test |
| Block explorer | Không cần |
| Owner | `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec` |
| Khách A | `0x810A640B6089B12ab3bb7Bde1697752129679828` |
| Khách B | `0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7` |

MetaMask đã được quan sát trong sidebar Edge, owner có nhãn Admin và A có nhãn
Producer trong phiên hiện tại. Tên mạng ví đang hiển thị Localhost 8545;
đây chỉ là nhãn, ứng dụng xác minh chain ID và contract qua provider. RPC Ganache
đã xác minh trực tiếp là cổng 7545. Không suy ra RPC từ tên mạng.
Không cần thiết lập lại owner/A đã dùng được. Nếu B chưa import, người dùng tự import
account 2 của chính workspace Ganache trực tiếp trong ví; không gửi khóa vào chat/log.
Chưa xác minh số phiên bản MetaMask hoặc tên menu thiết lập; làm theo UI đang có.

## Cách sử dụng

1. Nếu cần thêm mạng, nhập đúng RPC/chain ID ở trên trong chức năng mạng tùy chỉnh.
2. Chọn tài khoản test cần dùng; đối chiếu đầy đủ địa chỉ công khai.
3. Bấm **Connect MetaMask** và chấp thuận quyền truy cập tài khoản trong ví.
4. Trang kiểm tra đúng chain, bytecode, owner và receipt deploy trước khi cho thao tác.
5. Owner dùng **Restaurant management → Register table** với Table ID và Seats.
6. Chọn **Date**, **Start time**, **Refresh tables**. Nhãn slot dùng UTC+07:00,
   không phụ thuộc timezone máy. Chọn giờ nguyên, mỗi slot dài một giờ.
7. **Reserve table** đặt bàn trống; **Cancel booking** chỉ xuất hiện cho chủ booking.
8. Chấp thuận hoặc từ chối trong ví. Trang chờ receipt thành công rồi tải lại dữ liệu.
9. Đổi tài khoản/mạng làm xóa session và dữ liệu cũ rồi kiểm tra lại; sai mạng khóa
   thao tác ghi. Không có yêu cầu kết nối/ký tự động lúc tải trang.

Mã lỗi contract được dịch sang tiếng Anh trong `services/blockchain.js`.
Danh sách bàn có nút Refresh tables để nhận thay đổi từ tài khoản khác.

## Chạy và kiểm tra

```powershell
npm.cmd run dev
npm.cmd run test:frontend
npm.cmd run build
npm.cmd run verify:ganache
```

Server được khởi động nền trong phiên kiểm chứng, log ở `docs/logs/04-server*.log`.
Nếu máy khởi động lại hoặc server dừng, mở terminal tại root và chạy `npm.cmd run dev`.
Nếu báo port 5173 đã dùng, kiểm tra trang đang chạy trước; không mở server cạnh tranh.

## Kết quả quan sát

- Owner kết nối đúng mạng: AI quan sát qua accessibility Edge và ảnh người dùng.
- Owner đăng ký Table 1, 4 seats: người dùng thực hiện; RPC xác minh receipt status 1,
  block 27, tx `0xc10cf8b1a4ce19dfe35aa80a954406c4ea4d0b73e8963f4eee62aced336a3245`.
- Chuyển owner → A và A đặt Table 1 / slot 498587: ảnh người dùng và AI quan sát
  trực tiếp account A, Customer, Your booking, Cancel booking, Transaction confirmed;
  RPC xác minh tx `0xc2e8d449b6d3d340e25a6859671c98323a49a0215310b112a2febc08ea5a2160`, block 34.
- Reject yêu cầu ký: người dùng xác nhận đã kiểm tra; AI quan sát thông báo
  You rejected the wallet request, không báo thành công. Ảnh `screenshots/07-wallet-rejected.png`.
- Đổi sang mạng khác: người dùng xác nhận Wrong network và thao tác bị khóa,
  sau đó trở về Ganache; AI không trực tiếp quan sát thời điểm sai mạng.
- A hủy rồi B đặt lại/reload: người dùng thực hiện và xác nhận; RPC có receipt block
  35/36, AI quan sát B là chủ booking. Xem `ui-chain-evidence.json` và ảnh
  `screenshots/06-reserved-by-b.png`. Test wallet stub được tách khỏi bằng chứng này.
