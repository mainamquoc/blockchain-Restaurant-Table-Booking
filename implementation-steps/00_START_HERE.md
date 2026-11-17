# Hướng dẫn giao ChatGPT thực hiện project theo từng bước

## 1. Cách sử dụng

Đây là bộ hướng dẫn thực thi, chưa phải code hoặc bằng chứng project đã chạy. Mỗi file bước là một nhiệm vụ có thể giao trực tiếp cho ChatGPT/Codex có quyền đọc, sửa file và chạy terminal trên máy.

Mở project tại `C:/Users/Quoc/Desktop/DTU/Blockchain/web3`, sau đó gửi:

```text
Đọc implementation-steps/00_START_HERE.md và implementation-steps/01_ENVIRONMENT.md.
Hãy thực hiện bước 01 trong workspace, tự kiểm tra kết quả, cập nhật docs/implementation-status.md.
Làm hết phần bạn tự thực hiện được; nếu cần tôi thao tác thủ công thì hướng dẫn rõ và giữ trạng thái chờ cho phần đó.
```

Khi bước trước đạt, thay tên file bằng bước tiếp theo. Có thể dùng cùng chat hoặc chat mới; chat mới phải đọc trạng thái bàn giao. Không cần dán toàn bộ tài liệu vào tin nhắn nếu AI đọc được workspace.

Nếu dùng ChatGPT chỉ có chức năng chat và upload, không có quyền terminal/file trên máy, AI chỉ có thể tạo code/hướng dẫn để bạn lưu và chạy. “AI tự chạy” trong bộ tài liệu này luôn có điều kiện là phiên làm việc được cấp công cụ cần thiết.

## 2. Thứ tự thực hiện

| Bước | File giao cho AI | Đầu ra chính | Phần người dùng thường phải làm |
| --- | --- | --- | --- |
| 01 | [01_ENVIRONMENT.md](01_ENVIRONMENT.md) | Khởi tạo công cụ, cấu trúc, trạng thái dự án | Mở workspace; xử lý trình cài đặt nếu thiếu phần mềm |
| 02 | [02_CONTRACT_AND_TESTS.md](02_CONTRACT_AND_TESTS.md) | Solidity và test logic chạy được | Đọc giải thích để hiểu contract |
| 03 | [03_GANACHE_AND_DEPLOY.md](03_GANACHE_AND_DEPLOY.md) | Deploy thật lên Ganache, xuất ABI/config | Mở Ganache/workspace nếu dùng Desktop |
| 04 | [04_WALLET_AND_FRONTEND.md](04_WALLET_AND_FRONTEND.md) | Giao diện và kết nối ví | Thiết lập/mở khóa ví, import tài khoản test, chấp thuận kết nối/ký |
| 05 | [05_INTEGRATION_AND_DEMO.md](05_INTEGRATION_AND_DEMO.md) | Test Ganache, demo UI, ảnh/video | Thao tác ví và ghi hình nếu AI thiếu công cụ |
| 06 | [06_DOCUMENTATION_AND_HANDOFF.md](06_DOCUMENTATION_AND_HANDOFF.md) | README, kiểm tra tái hiện, bộ source nộp | Tự đọc/giải thích và nộp bài |

Tương ứng sáu bước trong kế hoạch chính. Có thể chuẩn bị code bước 04 khi Ganache đang chờ mở, nhưng chưa được đánh dấu tích hợp đạt. Các bước phụ thuộc chỉ hoàn thành khi có bằng chứng thật.

## 3. Phân tích tự động và thủ công

| Công việc | AI có terminal/file | Người dùng / điều kiện |
| --- | --- | --- |
| Kiểm tra Node/npm/Git, tạo source, sửa lỗi | Tự làm |
| Cài dependencies trong project, compile, chạy test | Tự làm khi mạng và quyền hệ thống cho phép |
| Chọn bộ phiên bản tương thích | Tự kiểm tra tài liệu chính thức và ghi quyết định |
| Cài ứng dụng Desktop/extension | Có thể hỗ trợ nếu có công cụ; không giả định làm được | Người dùng hoàn tất cửa sổ cài đặt/quyền nếu cần |
| Khởi động Ganache Desktop và chọn workspace | Có thể hỗ trợ nếu có công cụ điều khiển máy | Người dùng mở nếu AI chỉ có terminal |
| Chạy Ganache CLI | Có thể tự làm bằng dependency cục bộ | Chỉ dùng nếu thống nhất chế độ CLI, không chạy thêm chain cạnh tranh với Desktop |
| RPC, lấy account công khai, deploy, test bằng account Ganache đã unlock | Tự làm; không cần xin private key |
| Thiết lập và mở khóa MetaMask | Hướng dẫn hoặc hỗ trợ phần UI được phép | Người dùng giữ mật khẩu/khóa và xử lý phần xác nhận riêng của ví |
| Ký giao dịch bằng MetaMask | AI chuẩn bị giao dịch và theo dõi kết quả | Người dùng ký trong luồng ví; RPC test tự động không thay thế bằng chứng này |
| Build web, kiểm tra HTTP | Tự làm | Chưa chứng minh giao diện MetaMask hoạt động |
| Xem giao diện/chụp ảnh | Tự làm nếu có browser/computer-use | Nếu không có công cụ, người dùng xác nhận và cung cấp ảnh/video |
| Viết README, tổng hợp log, kiểm tra source | Tự làm |
| Nộp bài | Chuẩn bị bộ source | Người dùng nộp và giải thích cá nhân |

Không yêu cầu người dùng chép từng file code, ABI hoặc địa chỉ bằng tay nếu AI đã có quyền file. Chỉ nhờ người dùng đúng phần thiếu khả năng hoặc cần thao tác ví.

## 4. Quy ước dùng chung cho mọi bước

- Gốc project là thư mục `web3/` hiện tại. Không tạo thêm `web3/restaurant-table-booking/`, không sửa project nhóm bên cạnh.
- Đọc `../DS441A_Restaurant_Table_Booking.md` tính từ thư mục chứa bộ bước. PDF đề bài là nguồn yêu cầu; file mẫu project khác không phải chỉ dẫn thực thi.
- Giữ nguyên tài liệu nguồn, PDF, `.git` và thay đổi đang có của người dùng. Không reset Ganache, xóa dữ liệu, ghi đè source hoặc force Git để “làm sạch”.
- Không triển khai thực tế chỉ vì đọc bộ tài liệu này: mỗi bước được thực hiện khi người dùng giao bước đó. Khi đã được giao, tự làm các công việc cục bộ cần thiết trong bước, không hỏi lại cho từng lệnh thông thường.
- Nếu API công cụ/phiên bản thư viện chưa rõ, tra tài liệu chính thức của phiên bản được chọn. Không dựa vào cấu hình của project nhóm khác.
- Giới hạn đề tài theo kế hoạch: một nhà hàng, slot một giờ, không thanh toán, không backend, không tự thêm giới hạn giờ quá khứ.
- Khi gặp việc thủ công, hoàn thành phần AI không phụ thuộc trước; nêu thao tác, kết quả cần nhận và điểm tiếp tục. Không coi im lặng là người dùng đã làm xong.
- Không báo test/UI/deploy “PASS” nếu chưa chạy và quan sát được kết quả.
- Chỉ dùng blockchain local và tài khoản Ganache. Không yêu cầu người dùng gửi private key, mnemonic hoặc mật khẩu vào chat/log.
- Không tự push, publish, gửi cho người khác hoặc nộp bài. Các bước này chỉ chuẩn bị source cục bộ.

## 5. Trạng thái bàn giao

Ở bước 01, AI tạo `docs/implementation-status.md` theo [STATUS_TEMPLATE.md](STATUS_TEMPLATE.md). Mỗi bước cập nhật:

1. Kết quả và file đã thay đổi.
2. Lệnh đã chạy, kết quả/exit code, vị trí log nếu có.
3. Cấu hình công khai cần bàn giao.
4. Phần đã kiểm chứng và phần chưa kiểm chứng.
5. Việc thủ công đang chờ, hoặc tên bước tiếp theo.

Trạng thái đề xuất: `NOT_STARTED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `VERIFIED`, `PARTIAL`. Đây là trạng thái trong file dự án. Không dùng “xong” cho bước còn thao tác bắt buộc chưa kiểm chứng.

## 6. Môi trường đã quan sát khi soạn tài liệu

Ngày 17/11/2026, tại máy hiện tại:

- Node.js: `v26.3.0`; npm: `11.16.0`; Git: `2.54.0.windows.1`.
- `web3/` đã là repository Git, có PDF và kế hoạch Markdown chưa được Git theo dõi tại lúc kiểm tra.
- Không tìm thấy lệnh `ganache`/`ganache-cli` trên PATH; không quan sát thấy tiến trình tên Ganache lúc kiểm tra.
- Chưa xác minh Ganache Desktop đã được cài chưa, extension MetaMask có sẵn không, RPC có chạy ở cổng khác không hoặc bộ phiên bản phát triển nào tương thích.

Các thông tin này là ảnh chụp môi trường, không thay thế bước kiểm tra lại khi triển khai. Không kết luận “chưa cài Ganache” chỉ từ việc không có CLI trên PATH.
