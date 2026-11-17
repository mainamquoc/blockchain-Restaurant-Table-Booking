# Bước 01 — Chuẩn bị môi trường và khởi tạo project

## Nhiệm vụ giao cho AI

Hãy thực hiện bước này trong workspace, không chỉ mô tả cách làm. Đọc `implementation-steps/00_START_HERE.md`, kế hoạch chính và hướng dẫn repository áp dụng trước khi sửa. Tự xử lý lựa chọn triển khai thông thường, chỉ nhờ người dùng phần thiếu quyền/công cụ.

## Mục tiêu và đầu vào

- Dùng `web3/` hiện tại làm project root.
- Có môi trường compile/test Solidity và server frontend, bộ phiên bản được ghi nhận.
- Chưa cần Ganache hoặc MetaMask hoạt động để hoàn thành phần công cụ.

## AI tự thực hiện

1. Kiểm tra thư mục, `git status`, source đã có, Node/npm/Git và cấu hình npm. Không đọc/in bí mật; không ghi đè các file người dùng đang làm.
2. Kiểm tra phần mềm Ganache bằng nguồn quan sát phù hợp và thử RPC local đã biết bằng yêu cầu chỉ đọc, có timeout ngắn. Không quét mạng diện rộng hoặc khởi động chain mới ngay.
3. Chọn bộ Hardhat, ethers.js v6, test runner/plugin và Solidity 0.8.x tương thích với Node thực tế. Tra tài liệu chính thức nếu cần; không giả định Node mới nhất luôn tương thích mọi plugin.
4. Khởi tạo có kiểm soát ngay trong project root; nếu công cụ yêu cầu thư mục trống, tạo scaffold ở thư mục tạm riêng rồi đưa các file cần thiết về, bảo toàn PDF/tài liệu/`.git`. Không chạy Git init lồng nhau.
5. Thiết lập `contracts/`, `test/`, `scripts/`, `frontend/`, `docs/`; dùng TypeScript cho công cụ contract và JavaScript thuần cho frontend. Nếu bộ công cụ cần tên file khác kế hoạch, chọn một cách thống nhất và ghi lại.
6. Tạo package scripts có tên dễ dùng: compile, test, deploy:ganache; frontend có dev và build. Chỉ ghi lệnh deploy là đã kiểm chứng sau bước 03.
7. Cài dependencies cục bộ, giữ lockfile. Có thể dùng `npm.cmd` trên PowerShell nếu `npm.ps1` bị execution policy chặn; không đổi execution policy toàn máy chỉ để chạy npm.
8. Chạy compile/test mẫu của công cụ trước, kiểm tra server frontend tối thiểu trả HTTP. Dọn source mẫu do chính bước này tạo khi không còn cần, không đụng file ngoài project.
9. Tạo `.gitignore` cho dependencies, cache, build, `.env`, dữ liệu chain local; tạo README khung, không ghi kết quả chưa có.
10. Tạo `docs/implementation-status.md` từ template, ghi bộ phiên bản, lệnh đã chạy và đường dẫn root.

## Người dùng cần làm thủ công khi nào?

| Điều kiện | Người dùng làm | AI tiếp tục được gì? |
| --- | --- | --- |
| AI không được truy cập thư mục | Mở đúng workspace hoặc cấp quyền theo ứng dụng | Chuẩn bị nội dung file, chưa thể xác minh trên máy |
| Thiếu phần mềm cần trình cài đặt/quyền hệ thống | Hoàn tất cài đặt được AI hướng dẫn, mở lại terminal nếu cần | Tạo source và cấu hình không phụ thuộc phần mềm thiếu |
| Không có Ganache Desktop/MetaMask | Có thể chuẩn bị sau, trước bước 03/04 | Vẫn hoàn thiện môi trường và test local |

Nếu phải đổi Node để tương thích, giải thích vấn đề quan sát được; ưu tiên cách dùng phiên bản riêng cho project, không tự gỡ/thay toàn bộ môi trường máy.

## File và bằng chứng bàn giao

- Package/lockfile, cấu hình Hardhat/TypeScript, cấu trúc frontend, `.gitignore`.
- `docs/implementation-status.md` có phiên bản thực tế và các lệnh đã chạy.
- Ghi rõ Ganache/MetaMask là “đã quan sát”, “chưa xác minh” hay “đang chờ”, không đoán.

## Điều kiện hoàn thành

- [ ] Dependencies cài thành công và bộ phiên bản được chốt.
- [ ] Compile và test mẫu chạy được; có kết quả thực tế.
- [ ] Frontend tối thiểu chạy qua HTTP; nếu dừng server, ghi cách khởi động lại.
- [ ] Không mất tài liệu, source hoặc lịch sử Git.
- [ ] Có trạng thái bàn giao cho bước 02.

Kết thúc bằng tóm tắt việc đã làm, kết quả kiểm chứng và thao tác thủ công còn thiếu nếu có. Chưa triển khai contract đề tài trong bước này.
