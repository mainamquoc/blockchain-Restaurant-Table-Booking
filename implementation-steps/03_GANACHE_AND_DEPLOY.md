# Bước 03 — Chuẩn bị Ganache và deploy contract thật

## Nhiệm vụ giao cho AI

Đọc hướng dẫn chung, trạng thái dự án, source và kết quả bước 02. Hãy chuẩn bị/cấu hình và thực hiện deploy lên Ganache local đang dùng, xuất cấu hình frontend rồi xác minh bằng RPC. Được giao bước này là đã được giao triển khai thử nghiệm local; không hỏi lại cho từng giao dịch deploy thông thường.

## Điều kiện đầu vào

Contract và test logic đã đạt. Ganache chưa mở không cản AI viết script, cấu hình và kiểm tra compile.

## Phân tích thao tác thủ công

| Việc | Ai thực hiện |
| --- | --- |
| Tìm phiên bản/RPC đang chạy, đọc chain/account công khai | AI qua terminal/RPC |
| Mở Ganache Desktop, tạo/chọn workspace, xem RPC | Người dùng nếu AI không có công cụ điều khiển máy |
| Cài Ganache Desktop nếu thiếu | Người dùng hoàn tất installer nếu cần |
| Deploy bằng account Ganache đã unlock | AI qua RPC, không cần lấy khóa cá nhân |
| Chạy Ganache CLI thay Desktop | AI có thể làm sau khi xác định dùng chế độ CLI; không tự đổi chế độ đang dùng |

Ưu tiên workspace Ganache Desktop của buổi học nếu đã có. Chưa thấy ứng dụng không đồng nghĩa chưa cài. Khi người dùng chưa có Ganache và chưa rõ chế độ muốn dùng, trình bày lựa chọn Desktop/CLI và hỏi đúng điểm này; trong lúc chờ vẫn chuẩn bị script. Không thay Ganache bằng Hardhat node rồi báo đáp ứng yêu cầu Ganache.

## Checklist người dùng nếu dùng Ganache Desktop

1. Mở Ganache và chọn/tạo workspace dùng riêng cho bài này; không reset workspace đang có dữ liệu cần giữ.
2. Giữ Ganache mở; cho AI biết RPC URL hiển thị nếu AI chưa tự xác định được.
3. Không gửi mnemonic/private key. AI lấy địa chỉ và số dư test qua RPC.

AI cần xác nhận lại RPC bằng kết nối thực tế trước khi tiếp tục; người dùng chỉ nói “đã mở” chưa phải bằng chứng RPC đã hoạt động.

## AI tự thực hiện

1. Kiểm tra RPC local với timeout, đọc `eth_chainId`, `eth_accounts`, số dư và thông tin client. Đối chiếu với Ganache đang dùng, không chỉ mặc định cổng 7545 hoặc chain ID 1337.
2. Chọn account 0 làm owner, account 1/2 làm A/B nếu đủ ba account; ghi địa chỉ công khai và số dư. Nếu node khóa account, báo đúng điều kiện; không yêu cầu key vào chat hoặc tự unlock bằng mật khẩu của người dùng.
3. Cấu hình network `ganache` theo bộ Hardhat đã chọn. Xác định compiler/EVM target tương thích bản Ganache thực tế, ghi lý do thay đổi nếu gặp invalid opcode. Chạy lại compile/test nếu thay đổi cấu hình liên quan.
4. Viết `scripts/deploy.ts` và script npm tương ứng. Dùng signer của account test node cung cấp; không hardcode key.
5. Script kiểm tra network, deploy `RestaurantBooking`, chờ receipt thành công, xác minh bytecode và `owner()` đúng account deploy.
6. Xuất `frontend/src/generated/contract.json` bằng dữ liệu thật, gồm ít nhất ABI, address, chainId. Biểu diễn chain ID thành chuỗi thập phân nhất quán để tránh lỗi JSON BigInt. Có thể thêm deployment block/tx hash.
7. Lưu metadata công khai vào `docs/deployment.json` hoặc tài liệu tương đương: RPC, chain ID, address, owner, tx hash, block, phiên bản compiler/EVM target.
8. Mặc định deploy không tự seed bàn/booking để demo còn rõ ràng. Nếu cần seed, tách script riêng và ghi trạng thái, không ngầm chạy lại mỗi lần khởi động.
9. Kiểm tra file cấu hình vừa xuất đúng ABI/address/chain; nếu deploy lại, cập nhật đồng bộ và lưu lịch sử thay vì để frontend dùng địa chỉ cũ.
10. Cập nhật trạng thái dự án và hướng dẫn giữ node đang chạy.

## Điểm chờ hợp lý

Nếu RPC chưa truy cập được: hoàn tất script/cấu hình có thể làm, ghi trạng thái `WAITING_FOR_USER`, đưa đúng checklist mở Ganache và RPC cần xác nhận. Không báo deploy đạt, không dùng địa chỉ mẫu Storage và không tạo tx hash giả.

Nếu có Ganache chạy sẵn, tiếp tục deploy và xác minh mà không yêu cầu người dùng bấm deploy thủ công.

## Điều kiện hoàn thành

- [ ] RPC được xác minh là mạng Ganache đang dùng cho bài.
- [ ] Contract có receipt deploy thành công và bytecode tại đúng địa chỉ.
- [ ] `owner()` khớp tài khoản deploy.
- [ ] ABI/address/chain ID xuất tự động cho frontend.
- [ ] Có metadata bàn giao và cách khởi động lại node.
- [ ] Bước 03 chỉ VERIFIED sau deploy thật; bước tiếp theo là 04.
