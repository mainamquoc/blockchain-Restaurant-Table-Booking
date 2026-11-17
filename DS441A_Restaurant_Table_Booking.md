# INDIVIDUAL MINI PROJECT — RESTAURANT TABLE BOOKING

**Môn học:** DS 441 A — Blockchain: Theory & Practices  
**Sinh viên:** Mai Nam Quốc  
**MSSV:** 29211145181  
**Đề tài:** Đặt bàn nhà hàng theo mã khung giờ  
**Ngày lập tài liệu:** 17/11/2026  
**Trạng thái:** Thiết kế dự kiến, chưa triển khai và chưa có kết quả kiểm thử.

## Giới thiệu

Xây dựng một ứng dụng web cho phép nhà hàng đăng ký bàn, khách hàng chọn bàn và khung giờ để đặt, sau đó hủy booking bằng chính tài khoản đã đặt. Smart contract lưu trạng thái đặt bàn trên Ganache, từ chối đặt trùng và kiểm tra quyền hủy theo địa chỉ ví.

Tài liệu này là bản định hướng triển khai cho bài tập cá nhân. Bố cục tham khảo file mẫu do sinh viên cung cấp; yêu cầu nghiệp vụ và sản phẩm cần nộp được lấy từ PDF của đề Restaurant Table Booking. Các tên file, hàm, công nghệ phụ trợ và quy ước khung giờ dưới đây là đề xuất thiết kế.

## Mục lục

1. Tóm tắt đề bài và sản phẩm cần nộp
2. Phạm vi, vai trò và quy tắc nghiệp vụ
3. Kiến trúc hệ thống và cấu trúc thư mục
4. Thiết kế smart contract
5. Thiết kế giao diện
6. Kế hoạch triển khai từng bước
7. Kế hoạch kiểm thử
8. Kịch bản demo
9. README và bằng chứng nộp bài
10. Lỗi thường gặp
11. Checklist hoàn thành
12. Tài liệu tham khảo

## 1. Tóm tắt đề bài và sản phẩm cần nộp

### 1.1. Yêu cầu bắt buộc trong PDF

| Yêu cầu | Cách đáp ứng dự kiến |
| --- | --- |
| Nhà hàng đăng ký bàn | Chỉ ví nhà hàng được gọi `registerTable` |
| Khách đặt bàn còn trống theo mã khung giờ | `reserve(tableId, slotId)` lưu địa chỉ người đặt |
| Từ chối đặt trùng cùng bàn và cùng khung giờ | Kiểm tra booking hiện có ngay trong contract |
| Chỉ khách đã đặt được hủy | So sánh `msg.sender` với địa chỉ đang giữ booking |
| Viết Solidity và deploy lên Ganache cục bộ | Contract cùng cấu hình và script deploy |
| Giao diện HTML/JavaScript dùng ethers.js hoặc web3.js | Website HTML/CSS/JavaScript dùng ethers.js |
| Kết nối ví, hiện tài khoản, dữ liệu, trạng thái giao dịch và lỗi | MetaMask, bảng trạng thái bàn và vùng thông báo giao dịch |
| Quy tắc và quyền phải nằm trong contract | Gọi trực tiếp contract bằng tài khoản sai vẫn bị từ chối |
| Phát event cho thay đổi quan trọng | Event đăng ký bàn, đặt bàn, hủy booking |
| Demo ít nhất hai tài khoản Ganache | Khách A và khách B; đề xuất thêm một ví riêng cho nhà hàng |
| Demo đặt → từ chối đặt trùng → hủy → đặt lại | Kịch bản cố định tại mục 8 |
| Có giao dịch thành công và thao tác sai bị từ chối, giải thích kết quả | Receipt của giao dịch thành công và thông báo lỗi kèm trạng thái sau lỗi |
| Chỉ dùng tài khoản Ganache và Ether test | Toàn bộ demo chạy trên mạng cục bộ |

### 1.2. Sản phẩm cần nộp

- Source Solidity, source giao diện và các script deploy/test được sử dụng.
- README ngắn: yêu cầu môi trường, cấu hình Ganache, cách deploy, cách chạy và kết quả test.
- Ảnh chụp hoặc video demo ngắn.
- Ghi rõ nguồn code bên ngoài và hỗ trợ đã sử dụng.

**Phân biệt với đề xuất:** PDF không quy định báo cáo 4–6 trang, demo đúng 10 phút, số lượng tối thiểu ba test lỗi, phân công nhóm hay bảng gas trước/sau. Bộ test tự động trong tài liệu này là đề xuất để kiểm chứng quy tắc, không phải một yêu cầu số lượng được ghi trong PDF.

### 1.3. Thang điểm của đề

| Hạng mục | Điểm |
| --- | ---: |
| Logic contract và quy tắc riêng của đề | 35 |
| Deploy Ganache và tương tác Web3 | 25 |
| Giao diện và tính dễ sử dụng | 15 |
| Kiểm thử và demo | 15 |
| README và giải thích cá nhân | 10 |
| **Tổng** | **100** |

## 2. Phạm vi, vai trò và quy tắc nghiệp vụ

### 2.1. Phạm vi phiên bản nộp bài

Một nhà hàng, nhiều bàn, các khung giờ cố định dài một giờ. Người dùng được nhận diện bằng địa chỉ ví. Không cần backend hoặc cơ sở dữ liệu riêng cho phiên bản này: contract là nguồn dữ liệu chính; giao diện đọc dữ liệu qua Web3.

Không bổ sung thanh toán, đặt cọc, hoàn tiền, tài khoản đăng nhập bằng mật khẩu, email hay số điện thoại vào phạm vi cơ bản. Giao dịch đặt/hủy vẫn tiêu thụ gas bằng Ether test, dù không có phí đặt bàn chuyển vào contract.

### 2.2. Vai trò và tài khoản demo

| Tài khoản | Vai trò | Quyền |
| --- | --- | --- |
| Ganache account 0 | Nhà hàng / owner | Deploy contract và đăng ký bàn |
| Ganache account 1 | Khách A | Đặt bàn trống, hủy booking của mình |
| Ganache account 2 | Khách B | Đặt bàn trống, hủy booking của mình; thử các hành động bị từ chối |

Đề chỉ yêu cầu ít nhất hai tài khoản. Dùng ba tài khoản giúp thể hiện quyền nhà hàng và hai khách rõ ràng hơn. Khách không cần được nhà hàng đăng ký vai trò trước; mọi địa chỉ đều có thể đặt bàn khi điều kiện hợp lệ.

### 2.3. Quy tắc nghiệp vụ

1. Chỉ owner được đăng ký bàn; mã bàn phải lớn hơn 0 và không trùng.
2. Bàn phải tồn tại trước khi được đặt.
3. Một cặp `(tableId, slotId)` chỉ có tối đa một địa chỉ giữ booking tại một thời điểm.
4. Cùng bàn nhưng khác khung giờ có thể được đặt độc lập.
5. Cùng khung giờ nhưng khác bàn có thể được đặt độc lập.
6. Chỉ địa chỉ đang giữ booking được hủy; owner cũng không được hủy thay khách trong thiết kế cơ bản.
7. Hủy booking trả cặp bàn/khung giờ về trạng thái trống, cho phép đặt lại.
8. Đặt trùng bị từ chối kể cả khi người gọi chính là người đã đặt trước đó.
9. Mỗi lần đăng ký, đặt hoặc hủy thành công phải phát event tương ứng.

### 2.4. Quy ước mã khung giờ — đề xuất thiết kế

Để tránh hai mã khác nhau mô tả các khoảng thời gian chồng lấn, sử dụng các khung một giờ liên tiếp trên cùng trục thời gian:

```text
slotId = Unix timestamp của thời điểm bắt đầu / 3600
Thời điểm bắt đầu phải đúng đầu giờ.
Khoảng thời gian của slot = [slotId × 3600, (slotId + 1) × 3600)
```

- `slotId` là số nguyên dương; contract kiểm tra `slotId > 0`.
- Giao diện cho chọn ngày và giờ nguyên, ví dụ 18:00–19:00 ngày 18/11/2026.
- Khi chuyển ngày giờ thành timestamp, dùng múi giờ Việt Nam `UTC+07:00` một cách tường minh; không phụ thuộc múi giờ của máy người dùng.
- Hai khung 18:00–19:00 và 19:00–20:00 là hai slot riêng, không chồng nhau vì đầu cuối là khoảng nửa kín `[start, end)`.
- Contract lưu và so sánh mã slot; giao diện chuyển mã thành nhãn ngày giờ để người dùng dễ đọc.
- Quy tắc này không hỗ trợ nhập khoảng tùy ý như 18:30–19:30 hoặc booking kéo dài nhiều slot trong một giao dịch.

PDF yêu cầu mã khung giờ rõ ràng, không bắt buộc quy ước tính mã trên. Đây là cách chọn để mọi mã hợp lệ đều ứng với một khung một giờ duy nhất. Việc cấm đặt giờ quá khứ, giới hạn giờ mở cửa hoặc giới hạn thời điểm hủy chưa nằm trong thiết kế cơ bản; nếu bổ sung phải kiểm tra cả trong contract và cập nhật test.

## 3. Kiến trúc hệ thống và cấu trúc thư mục

### 3.1. Công nghệ dự kiến

| Thành phần | Lựa chọn | Vai trò |
| --- | --- | --- |
| Smart contract | Solidity 0.8.x | Dữ liệu và quy tắc đặt bàn |
| Công cụ phát triển | Hardhat | Compile, test và deploy |
| Blockchain | Ganache cục bộ | Chạy contract và tài khoản test |
| Ví trình duyệt | MetaMask | Kết nối tài khoản và ký giao dịch |
| Giao diện | HTML, CSS, JavaScript; Vite để chạy web | Form, bảng bàn, trạng thái giao dịch |
| Web3 client | ethers.js v6 | Đọc contract và gửi giao dịch qua ví |
| Quản lý source | Git | Lưu lịch sử thay đổi cá nhân |

Hardhat và Vite là lựa chọn triển khai, không phải công cụ bắt buộc trong PDF. Khi khởi tạo, chọn một bộ phiên bản Node/Hardhat/plugin tương thích, ghi phiên bản thực tế vào README và lưu lockfile. Không trộn cú pháp cấu hình của các phiên bản Hardhat khác nhau.

### 3.2. Luồng kết nối

```text
Solidity + script deploy
          |
       Hardhat ---- RPC ----> Ganache [RestaurantBooking contract]
          |                                ^
    xuất ABI + địa chỉ                      | RPC
          |                                |
Website HTML/JS ---- ethers.js ---- MetaMask [tài khoản đang chọn]
```

Thiết kế cơ bản dùng provider của MetaMask cho cả đọc và ghi. Người dùng kết nối ví và chọn đúng mạng trước khi sử dụng. Đọc dữ liệu bằng call không gửi giao dịch; thao tác ghi cần chữ ký và chờ receipt. Cách tạo `BrowserProvider`, lấy signer và chờ giao dịch dựa trên [tài liệu ethers.js v6](https://docs.ethers.org/v6/getting-started/).

### 3.3. Cấu trúc repository dự kiến

```text
restaurant-table-booking/
├── contracts/
│   └── RestaurantBooking.sol       # Contract duy nhất của ứng dụng
├── scripts/
│   └── deploy.ts                   # Deploy, xuất ABI/địa chỉ/chain ID cho web
├── test/
│   └── RestaurantBooking.test.ts   # Test logic, quyền, event và trường hợp lỗi
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── main.js                 # Sự kiện giao diện và render trạng thái
│       ├── style.css
│       ├── services/
│       │   └── blockchain.js       # Provider, signer, gọi contract, đọc lỗi
│       ├── utils/
│       │   └── slots.js            # Đổi ngày giờ UTC+07:00 ↔ slotId
│       └── generated/
│           └── contract.json      # ABI, address, chainId do deploy xuất ra
├── docs/
│   ├── project-plan.md             # Có thể chép tài liệu này vào đây
│   ├── test-results.md             # Chỉ điền kết quả sau khi thực sự chạy
│   ├── demo-script.md
│   ├── screenshots/
│   └── demo.mp4                    # Nếu chọn nộp video
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

Đây là cấu trúc mục tiêu, không có nghĩa các file trên đã được tạo. Script deploy xuất một file cấu hình thống nhất để tránh chép nhầm ABI và địa chỉ của các lần deploy khác nhau. File sinh ra không chứa khóa cá nhân.

## 4. Thiết kế smart contract

### 4.1. Dữ liệu dự kiến

```solidity
address public immutable owner;

struct Table {
    bool exists;
    uint256 capacity;
}

mapping(uint256 => Table) public tables;
uint256[] private tableIds;
mapping(uint256 => mapping(uint256 => address)) public bookings;
```

- `owner`: địa chỉ deploy, đại diện nhà hàng.
- `capacity`: số chỗ ngồi, phải lớn hơn 0; là thông tin hiển thị, chưa quản lý số người trong booking.
- `tableIds`: phục vụ lấy danh sách bàn vì mapping không tự liệt kê các khóa.
- `bookings[tableId][slotId] == address(0)`: cặp bàn/slot chưa có người đặt.
- Giá trị khác địa chỉ 0: địa chỉ khách đang giữ booking.

Đây là phác thảo dữ liệu, không phải source contract hoàn chỉnh. Với quy mô demo vài bàn, trả toàn bộ danh sách ID là đủ; chưa cần phân trang.

### 4.2. Các hàm dự kiến

| Hàm | Quyền gọi | Kiểm tra / kết quả |
| --- | --- | --- |
| `registerTable(uint256 tableId, uint256 capacity)` | Owner | ID > 0, số chỗ > 0, bàn chưa tồn tại; thêm bàn và ID |
| `reserve(uint256 tableId, uint256 slotId)` | Mọi địa chỉ | Bàn tồn tại, slot > 0, booking đang trống; lưu `msg.sender` |
| `cancel(uint256 tableId, uint256 slotId)` | Người đang đặt | Bàn tồn tại, slot > 0, booking tồn tại và thuộc `msg.sender`; xóa booking |
| `getTableIds()` | Đọc công khai | Trả danh sách mã bàn đã đăng ký |
| `tables(tableId)` | Đọc công khai, getter tự sinh | Trả thông tin bàn |
| `bookings(tableId, slotId)` | Đọc công khai, getter tự sinh | Trả địa chỉ giữ booking; UI phân biệt bàn không tồn tại qua `tables` |
| `owner()` | Đọc công khai, getter tự sinh | Trả địa chỉ nhà hàng |

Không truyền `customerAddress` vào `reserve` để quyết định chủ booking: chủ booking luôn là người gọi thực tế `msg.sender`. Không dùng `tx.origin` để kiểm tra quyền.

### 4.3. Event dự kiến

```solidity
event TableRegistered(uint256 indexed tableId, uint256 capacity);
event TableReserved(uint256 indexed tableId, uint256 indexed slotId, address indexed customer);
event BookingCancelled(uint256 indexed tableId, uint256 indexed slotId, address indexed customer);
```

Event phục vụ thông báo và truy vết thay đổi. Mapping vẫn là nguồn để xác định trạng thái hiện tại, vì lịch sử có thể chứa nhiều lần đặt/hủy cùng một cặp bàn/slot.

### 4.4. Trạng thái booking

```text
TRỐNG -- reserve bởi A --> ĐÃ ĐẶT BỞI A
ĐÃ ĐẶT BỞI A -- cancel bởi A --> TRỐNG
TRỐNG -- reserve bởi B --> ĐÃ ĐẶT BỞI B

ĐÃ ĐẶT BỞI A -- reserve bởi A hoặc B --> REVERT, giữ nguyên trạng thái
ĐÃ ĐẶT BỞI A -- cancel bởi B/owner --> REVERT, giữ nguyên trạng thái
```

Nếu hai khách cùng gửi yêu cầu, trạng thái được kiểm tra khi từng giao dịch được thực thi. Giao dịch được thực thi thành công trước giữ slot; giao dịch tiếp theo phải bị từ chối. Trạng thái “còn trống” trên giao diện chỉ là ảnh chụp tại thời điểm đọc.

### 4.5. Giới hạn thiết kế

- Không xóa bàn, đổi owner hoặc hủy booking thay khách trong phiên bản cơ bản.
- Không xác thực danh tính ngoài đời; quyền gắn với địa chỉ ví.
- Không kiểm chứng việc khách thực sự đến nhà hàng.
- Dữ liệu booking là công khai; không lưu tên, số điện thoại hay thông tin cá nhân.
- Lịch sử còn trong event dù booking đã bị xóa khỏi mapping.

## 5. Thiết kế giao diện

Một trang web gồm các khu vực sau, ưu tiên dễ thao tác khi demo.

| Khu vực | Nội dung |
| --- | --- |
| Kết nối | Nút kết nối MetaMask, địa chỉ đang chọn, chain ID, địa chỉ contract |
| Quản lý nhà hàng | Mã bàn, số chỗ, nút đăng ký; hiển thị khi tài khoản là owner |
| Chọn khung giờ | Chọn ngày và giờ nguyên theo giờ Việt Nam; hiện nhãn thời gian và slotId |
| Danh sách bàn | Mã bàn, số chỗ, trạng thái của slot đang chọn, địa chỉ giữ booking |
| Thao tác | Đặt nếu trống; hủy nếu thuộc ví hiện tại; hiện “Đã được đặt” nếu thuộc ví khác |
| Giao dịch | Chờ ký → đang xử lý → thành công/thất bại; tx hash nếu đã có |

Các nguyên tắc xử lý:

1. Chặn thao tác ghi khi chưa kết nối, sai mạng hoặc chưa tải contract thành công.
2. Khi đã có transaction response, hiển thị hash; chờ `tx.wait()` trước khi báo thành công và đọc lại dữ liệu. Cơ chế receipt được mô tả trong [tài liệu ethers.js](https://docs.ethers.org/v6/single-page/).
3. Hiển thị lỗi dễ hiểu: “Bàn chưa được đăng ký”, “Khung giờ đã được đặt”, “Bạn không phải người đặt”, “Bạn đã từ chối ký”.
4. Xử lý `accountsChanged` và `chainChanged`: làm mới provider/signer, kiểm tra lại mạng và tải lại trạng thái.
5. Khóa nút trong khi gửi để tránh bấm lặp; contract vẫn tự kiểm tra mọi điều kiện.
6. Sau giao dịch, đọc lại mapping; có thể bổ sung event listener và nút “Làm mới” để cập nhật thay đổi từ ví khác.
7. Địa chỉ có thể rút gọn khi hiển thị nhưng phải cho xem/sao chép đầy đủ.

## 6. Kế hoạch triển khai từng bước

### Bước 1. Chuẩn bị môi trường

- Kiểm tra Node.js, npm, Git, Ganache và trình duyệt có MetaMask.
- Khởi tạo repository cá nhân và bộ công cụ Hardhat tương thích theo tài liệu chính thức.
- Ghi lại phiên bản thực tế; kiểm tra compile/test mẫu trước khi thay bằng contract đề tài.

**Đầu ra:** môi trường hoạt động, source được quản lý bằng Git.

### Bước 2. Viết contract và kiểm thử logic

- Tạo `RestaurantBooking.sol` theo mục 4.
- Hoàn thiện owner, kiểm tra đầu vào, mapping, các hàm và event.
- Viết test ở mục 7; kiểm tra dữ liệu không đổi sau các thao tác bị từ chối.

**Đầu ra:** compile thành công, các test logic chạy được. Kết quả test trên mạng thử của công cụ chưa thay thế bằng chứng chạy Ganache.

### Bước 3. Cấu hình và deploy lên Ganache

- Mở một workspace Ganache và ghi đúng RPC URL, chain ID, tài khoản deploy.
- RPC `http://127.0.0.1:7545` chỉ là giá trị ví dụ từ đoạn Python; phải dùng cổng thực tế của Ganache.
- Lấy chain ID bằng `eth_chainId`, không suy ra từ network ID.
- Chọn compiler/EVM target tương thích Ganache đang dùng; Hardhat cho cấu hình `evmVersion` theo [tài liệu cấu hình](https://hardhat.org/docs/reference/configuration).
- Viết script deploy, chờ receipt rồi xuất ABI, địa chỉ và chain ID sang `frontend/src/generated/contract.json`.
- Kiểm tra địa chỉ có bytecode trên đúng mạng.

**Đầu ra:** contract thực sự tồn tại trên Ganache; lưu địa chỉ, chain ID và tx hash deploy.

### Bước 4. Kết nối ví và làm giao diện

- Thêm mạng Ganache vào MetaMask và chuẩn bị tài khoản test.
- Làm lần lượt: kết nối → đọc danh sách bàn → đăng ký bàn → đặt → hủy.
- Hoàn thiện chuyển đổi slotId, trạng thái giao dịch và thông báo lỗi.
- Dùng địa chỉ/ABI do script vừa xuất; không tái sử dụng địa chỉ Storage từ ví dụ Python.

**Đầu ra:** website thực hiện được toàn bộ luồng trên Ganache.

### Bước 5. Chạy kiểm thử tích hợp và thu bằng chứng

- Dùng ba tài khoản theo bảng vai trò.
- Thực hiện demo đặt trùng, hủy sai quyền, hủy đúng quyền và đặt lại.
- Kiểm tra trạng thái trực tiếp sau từng bước; chụp ảnh hoặc quay video.
- Điền kết quả thật vào `docs/test-results.md`, ghi rõ môi trường và thời điểm chạy.

**Đầu ra:** bằng chứng thành công và thất bại có thể giải thích được.

### Bước 6. Hoàn thiện tài liệu và thử chạy lại

- Viết README theo mục 9.
- Kiểm tra setup từ source sạch theo đúng README, giữ lockfile.
- Rà soát các file nộp và ghi nguồn hỗ trợ bên ngoài.

**Đầu ra:** người khác có thể làm theo hướng dẫn để deploy và chạy project.

## 7. Kế hoạch kiểm thử

### 7.1. Bộ test đề xuất

| ID | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| T01 | Deploy bằng account 0 | `owner` đúng địa chỉ deploy |
| T02 | Owner đăng ký bàn 1, số chỗ 4 | Bàn tồn tại, xuất hiện trong danh sách, event đúng |
| T03 | Khách đăng ký bàn | Bị từ chối, danh sách bàn không đổi |
| T04 | Đăng ký lại mã bàn đã có | Bị từ chối |
| T05 | Mã bàn 0 hoặc số chỗ 0 | Bị từ chối |
| T06 | A đặt bàn 1, slot S | Booking thuộc A, phát event đúng |
| T07 | B đặt bàn 1, slot S khi A đang giữ | Bị từ chối; booking vẫn thuộc A |
| T08 | A đặt lại chính bàn 1, slot S | Bị từ chối; booking vẫn thuộc A |
| T09 | B hủy booking của A | Bị từ chối; booking vẫn thuộc A |
| T10 | Owner hủy booking của A | Bị từ chối; booking vẫn thuộc A |
| T11 | A hủy booking của mình | Booking thành địa chỉ 0, phát event đúng |
| T12 | B đặt lại cặp bàn/slot vừa được hủy | Thành công, booking thuộc B |
| T13 | Đặt hoặc hủy với bàn không tồn tại / slot 0 | Bị từ chối |
| T14 | Hủy một booking đang trống | Bị từ chối |
| T15 | Cùng bàn, hai slot khác nhau | Hai booking độc lập, không ghi đè nhau |
| T16 | Hai bàn khác nhau, cùng slot | Hai booking độc lập, không ghi đè nhau |
| T17 | Chuyển ngày/giờ Việt Nam → slot → ngày/giờ | Khớp thời điểm ban đầu; xử lý đúng qua ngày |
| T18 | UI đổi ví, đổi mạng, từ chối ký | Hiện tài khoản/trạng thái/lỗi đúng, không báo thành công giả |

T01–T16 chủ yếu kiểm thử contract; T17 kiểm thử quy ước thời gian; T18 kiểm thử giao diện thủ công. Các test phải được triển khai và chạy trước khi đánh dấu đạt.

### 7.2. Phân biệt các loại thao tác bị từ chối

Một lời gọi có thể bị phát hiện lỗi ngay khi mô phỏng/ước lượng gas, nên không tạo giao dịch trên chain và không có tx hash. Đây vẫn là minh chứng contract từ chối thao tác, nhưng phải ghi đúng là “bị từ chối trước khi gửi”.

Nếu giao dịch đã được đưa vào block rồi revert, nó có receipt thất bại và có thể tiêu thụ gas. Không ghi một thao tác bị chặn trước khi gửi thành giao dịch revert đã được ghi lên chain.

### 7.3. Mẫu ghi kết quả

| Test | Môi trường | Kết quả thực tế | Bằng chứng |
| --- | --- | --- | --- |
| A đặt bàn 1, slot S | Ganache | Chưa chạy | Chưa có |
| B đặt trùng | Ganache | Chưa chạy | Chưa có |
| B hủy của A | Ganache | Chưa chạy | Chưa có |
| A hủy, B đặt lại | Ganache | Chưa chạy | Chưa có |

## 8. Kịch bản demo

Thời lượng gợi ý 5–7 phút; PDF không ấn định thời lượng. Chuẩn bị một khung giờ hợp lệ S và hai bàn để tránh nhập liệu dài trong lúc trình bày.

| Bước | Tài khoản | Thao tác | Kết quả cần giải thích |
| --- | --- | --- | --- |
| 1 | Owner | Hiện mạng Ganache, account và contract; đăng ký bàn 1 | Chỉ nhà hàng được thêm bàn |
| 2 | A | Chọn slot S, đặt bàn 1 | Giao dịch thành công, bàn thuộc A |
| 3 | B | Thử đặt cùng bàn 1, slot S | Contract từ chối vì đã có booking |
| 4 | B | Thử gọi `cancel(1, S)` | Contract từ chối vì B không phải người đặt |
| 5 | A | Hủy booking | Bàn trở về trống |
| 6 | B | Đặt lại bàn 1, slot S | Thành công, chủ booking chuyển thành B |
| 7 | B | Làm mới trang và tra cứu lại | Trạng thái đọc từ blockchain vẫn thuộc B |

Vì UI bình thường chỉ hiện nút hủy cho chủ booking, bước 4 cần được chuẩn bị bằng script/test gọi contract trực tiếp với signer B. Không làm yếu kiểm tra quyền để phục vụ demo. Bước 3 cũng có thể dùng script gọi trực tiếp nếu UI đã khóa nút đặt của bàn bận.

Sau cùng, chỉ ra mapping lưu chủ booking, điều kiện `msg.sender` và event tương ứng. Nên có video dự phòng ghi cả địa chỉ ví và thông báo kết quả.

## 9. README và bằng chứng nộp bài

### 9.1. Dàn ý README

1. Tên đề tài, sinh viên, MSSV và tóm tắt chức năng.
2. Công nghệ và phiên bản thực tế đã kiểm chứng.
3. Cấu trúc thư mục.
4. Cài dependencies ở thư mục gốc và frontend.
5. Cấu hình Ganache: RPC, chain ID, tài khoản deploy và tài khoản demo.
6. Lệnh compile/test/deploy đúng với script trong `package.json`.
7. Cách cập nhật file ABI/address sau mỗi lần deploy.
8. Cách cấu hình MetaMask và chạy giao diện.
9. Quy ước slotId, múi giờ và giới hạn khung một giờ.
10. Kịch bản demo, kết quả test và đường dẫn ảnh/video.
11. Giới hạn hiện tại và nguồn tham khảo/hỗ trợ đã sử dụng.

Không điền lệnh hoặc phiên bản chưa kiểm chứng như thể đã chạy thành công. Không đưa private key, mnemonic, `.env`, `node_modules` hay dữ liệu ví vào source nộp; cấu hình công khai chỉ cần địa chỉ và thông số mạng. Dùng quy trình tài khoản thử nghiệm của Ganache, không dùng tiền hoặc khóa của ví thật.

### 9.2. Bằng chứng nên lưu

- Trang kết nối hiện đúng tài khoản, chain ID và địa chỉ contract.
- Owner đăng ký bàn thành công.
- A đặt thành công, kèm hash/receipt nếu đã gửi giao dịch.
- B đặt trùng và hủy sai quyền bị từ chối, kèm lời giải thích.
- A hủy rồi B đặt lại thành công.
- Kết quả test thực tế và hướng dẫn tái hiện.

## 10. Lỗi thường gặp

| Hiện tượng | Cần kiểm tra |
| --- | --- |
| Không kết nối được Ganache | Ganache đã chạy chưa, RPC và cổng có đúng không |
| Ví báo sai mạng | So chain ID với `eth_chainId`, không nhầm network ID |
| Không có code tại địa chỉ contract | Đã deploy trên đúng Ganache chưa; có reset workspace không |
| Gọi hàm không tồn tại / giải mã dữ liệu lỗi | ABI và địa chỉ có thuộc cùng lần deploy không |
| Deploy gặp invalid opcode | Kiểm tra compiler, EVM target và hardfork Ganache có tương thích không |
| Đổi ví nhưng UI còn dữ liệu cũ | Xử lý lại signer/account và tải lại booking |
| Reset Ganache xong giao dịch lỗi nonce | Kiểm tra trạng thái giao dịch lưu trong ví; triển khai và cập nhật cấu hình lại nếu cần |
| Giờ hiển thị hoặc slot bị lệch | Chuyển đổi thời gian có chỉ rõ UTC+07:00 không |
| UI báo thành công nhưng chain chưa đổi | Đã chờ receipt thành công và đọc lại trạng thái chưa |
| Không thấy tx hash cho thao tác sai | Có thể lỗi được phát hiện trước khi gửi; kiểm tra thông báo và ghi nhận đúng loại thất bại |
| Web không nhận ví khi mở HTML trực tiếp | Chạy bằng server phát triển và mở URL localhost |

## 11. Checklist hoàn thành

- [ ] Contract compile được, owner đúng tài khoản deploy.
- [ ] Chỉ owner đăng ký bàn; kiểm tra mã bàn trùng và đầu vào không hợp lệ.
- [ ] Đặt được bàn trống; từ chối đặt trùng cùng bàn/slot.
- [ ] Chỉ chủ booking được hủy; owner không hủy thay được.
- [ ] Hủy xong có thể đặt lại.
- [ ] Booking giữa các bàn và slot độc lập.
- [ ] Event và tham số phản ánh đúng mỗi thay đổi.
- [ ] Contract được deploy và chạy thật trên Ganache.
- [ ] Frontend dùng đúng ABI, địa chỉ và chain ID.
- [ ] UI hiện ví, dữ liệu, trạng thái giao dịch và lỗi.
- [ ] Xử lý đổi tài khoản, đổi mạng và người dùng từ chối ký.
- [ ] Quy ước khung giờ và múi giờ nhất quán.
- [ ] Demo dùng ít nhất hai tài khoản, có cả thành công và thao tác sai bị từ chối.
- [ ] Có kết quả test thật, ảnh hoặc video.
- [ ] README đủ bước để chạy lại từ source sạch.
- [ ] Ghi rõ nguồn code và hỗ trợ đã sử dụng.

## 12. Tài liệu tham khảo

- **Nguồn yêu cầu:** `19_29211145181_Mai_Nam_Quoc.pdf` trong thư mục `web3/` của bài tập cá nhân.
- **Mẫu bố cục:** `DS441A_Blockchain_Team5.md` do sinh viên cung cấp; chỉ tham khảo cách tổ chức tài liệu.
- [Hardhat — Getting started](https://hardhat.org/docs/getting-started): công cụ và cấu trúc project.
- [Hardhat — Configuration](https://hardhat.org/docs/reference/configuration): cấu hình compiler và EVM target.
- [ethers.js v6 — Getting started](https://docs.ethers.org/v6/getting-started/): provider, signer và tương tác qua ví.
- [ethers.js v6 — Documentation](https://docs.ethers.org/v6/single-page/): contract, giao dịch và receipt.

**Ghi nhận hỗ trợ:** Bản kế hoạch được soạn với hỗ trợ của Codex. Khi triển khai, bổ sung nguồn code/thư viện thực tế sử dụng và tự kiểm chứng toàn bộ kết quả trước khi nộp.
