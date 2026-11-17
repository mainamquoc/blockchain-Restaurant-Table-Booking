# Bước 06 — README, kiểm tra tái hiện và bàn giao bài nộp

## Nhiệm vụ giao cho AI

Đọc hướng dẫn chung, kế hoạch nguồn và toàn bộ trạng thái/bằng chứng của các bước đã làm. Hãy hoàn thiện tài liệu từ kết quả thật, kiểm tra khả năng chạy lại và chuẩn bị danh sách source nộp. Không tự publish, push repository hoặc nộp bài.

## Điều kiện đầu vào

Bước 01–05 có dữ liệu bàn giao. Nếu thiếu UI/demo hoặc test, ghi mục thiếu và quay lại đúng việc cần hoàn thành; không dùng README đẹp để đánh dấu cả project hoàn tất.

## AI tự thực hiện

1. Viết README ngắn nhưng đủ để người khác chạy: đề tài/cá nhân, công nghệ/phiên bản thực tế, prerequisites, cấu trúc, cài dependencies, compile/test, Ganache, deploy, MetaMask, chạy web và demo.
2. Lệnh README phải khớp script đã chạy, thư mục chạy, tên network, file cấu hình và port thực tế. Ghi địa chỉ contract chỉ là ví dụ của deployment hiện tại và sẽ thay đổi khi deploy/reset, không biến nó thành hằng số cần chép tay.
3. Ghi cách tái tạo ABI/address tự động; bước thiết lập ví theo checklist đã xác minh. Chỉ ghi account công khai/vai trò, không bí mật.
4. Tóm tắt kết quả test và đường dẫn bằng chứng. Chia rõ verified, người dùng xác nhận, chưa kiểm chứng; chỉ điền gas nếu thực sự đo, không yêu cầu báo cáo gas trước/sau ngoài đề.
5. Ghi quy ước slot một giờ, UTC+07:00, không kiểm tra giờ quá khứ trong phiên bản cơ bản, owner không được hủy thay khách và các giới hạn còn lại.
6. Ghi hỗ trợ Codex/ChatGPT cùng nguồn code/thư viện thực sự dùng. Không ghi tác giả đã tự làm mọi phần nếu có hỗ trợ.
7. Tạo `docs/submission-checklist.md` đối chiếu từng yêu cầu PDF với file source, test và bằng chứng; ghi tên sinh viên Mai Nam Quốc, MSSV 29211145181, bài cá nhân.
8. Tạo `docs/individual-explanation.md` dạng ghi chú để sinh viên tự học: `msg.sender`, owner, mapping, slotId, ABI/address/RPC/chain ID, call/transaction, event/revert, dữ liệu sau hủy, vì sao Python Storage không phải ứng dụng này.
9. Kiểm tra từ bản source sao chép sạch vào thư mục tạm riêng đã xác định, bỏ dependencies/build/bí mật/Git metadata. Không dùng lệnh dọn workspace gốc hoặc yêu cầu người dùng commit tất cả trước khi kiểm tra.
10. Trong bản tạm, cài theo lockfile, compile/test/build theo README. Với deploy thử, dùng Ganache local đã thống nhất và triển khai một contract mới không ảnh hưởng contract demo; ghi rõ địa chỉ của bản tạm không thay file frontend trong workspace gốc. Nếu không thể chạy phần này, ghi đúng giới hạn xác minh.
11. Kiểm tra file bằng chứng tồn tại, link tương đối nội bộ hoạt động, README không còn placeholder chưa giải thích và source không chứa key/mnemonic. Không in nội dung bí mật nếu phát hiện.
12. Lưu `docs/reproduction-check.md`, cập nhật trạng thái cuối. Nếu tạo ZIP cục bộ, chỉ đưa các file nộp cần thiết, loại `node_modules`, dữ liệu ví/chain, `.env`, cache/build và log nhạy cảm; không bắt buộc ZIP nếu chưa cần.

## Người dùng thực hiện

- Đọc và tự giải thích các câu hỏi trong ghi chú cá nhân bằng hiểu biết của mình.
- Xem lại ảnh/video, bảo đảm thể hiện đúng bài và không có thông tin bí mật.
- Cung cấp ảnh/video còn thiếu nếu AI không quan sát được UI.
- Nộp source/README/bằng chứng theo kênh giảng viên yêu cầu. Chỉ người dùng quyết định gửi bài.

Không cần xin người dùng duyệt để viết README hoặc chạy kiểm tra cục bộ trong phạm vi bước được giao. Nếu cần thao tác installer/ví, chỉ hỏi đúng thao tác còn thiếu, không yêu cầu xác nhận lại toàn bộ công việc.

## Bộ file cần có khi bàn giao

| Nhóm | Thành phần |
| --- | --- |
| Source | Contract, frontend, script deploy và test thực tế |
| Cấu hình | Package/lockfile, cấu hình compiler/network, `.gitignore` |
| Hướng dẫn | README, quy trình setup ví và chạy lại |
| Kết quả | Test-results, metadata deploy, ảnh hoặc video demo |
| Học và trình bày | Ghi chú giải thích cá nhân và checklist đối chiếu đề |

Bộ `implementation-steps/` và kế hoạch là tài liệu làm việc; không phải thay thế README/source/bằng chứng. Có thể giữ trong repository, nhưng phân biệt rõ khi nộp.

## Điều kiện hoàn thành project

- [ ] Source và lệnh README khớp nhau.
- [ ] Có kiểm tra tái hiện thực tế và nêu đúng giới hạn còn lại.
- [ ] Các yêu cầu PDF có file/bằng chứng đối chiếu.
- [ ] Không còn bước bắt buộc chưa kiểm chứng mà được ghi VERIFIED.
- [ ] Có ảnh hoặc video demo thật bằng nhiều tài khoản.
- [ ] Không đưa dữ liệu bí mật/dependencies vào bộ nộp.
- [ ] Người dùng nhận đường dẫn các file cuối và danh sách việc còn lại nếu có.

Chỉ báo project hoàn tất khi các điều kiện bắt buộc đã đạt. Nếu thiếu thao tác ví/bằng chứng, báo phần code đã hoàn thành và đúng mục đang chờ, không tuyên bố đã đủ bài nộp.
