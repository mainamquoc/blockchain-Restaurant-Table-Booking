# Bước 04 — Thiết lập ví và xây dựng giao diện

## Nhiệm vụ giao cho AI

Đọc hướng dẫn chung, kế hoạch mục 5, trạng thái dự án, ABI/API và metadata deploy. Hãy xây website HTML/CSS/JavaScript dùng ethers.js v6, chạy và kiểm tra trong khả năng công cụ. Phân biệt code/build đạt với tương tác ví đã được quan sát.

## Điều kiện đầu vào

API contract bước 02 đã chốt. Cần kết quả bước 03 để kiểm tra tích hợp thật; có thể viết giao diện khi đang chờ Ganache, nhưng không hoàn thành bước 04 bằng dữ liệu giả. Giữ frontend trong thư mục đã khởi tạo, không tạo ứng dụng mới lồng nhau.

## AI tự thực hiện

1. Tạo trang một màn hình với kết nối ví, thông tin mạng/contract, quản lý nhà hàng, chọn ngày/giờ, danh sách bàn và khu vực trạng thái giao dịch. Có hướng dẫn khi chưa có cấu hình deploy hoặc chưa có ví, không crash trắng trang.
2. Viết `services/blockchain.js`: `BrowserProvider`, signer, contract; kiểm tra chain ID, bytecode, owner trước khi bật thao tác ghi. Không kết nối/sửa ví hoặc yêu cầu ký tự động lúc tải trang.
3. Dùng duy nhất `generated/contract.json` do deploy tạo, không chép ABI thủ công hoặc hardcode địa chỉ ví dụ.
4. Viết `utils/slots.js`: tạo slot từ ngày/giờ đầu giờ theo UTC+07:00 tường minh, kiểm tra ngày hợp lệ/giờ 0–23, đổi ngược để hiển thị. Không dùng múi giờ mặc định của máy; không dùng phép chuyển đổi để làm tròn một giờ nhập sai thành slot hợp lệ.
5. Viết test T17 cho chuyển đổi thời gian: đầu/cuối ngày, qua tháng/năm, ngày không hợp lệ, hai giờ liên tiếp tạo hai slot liên tiếp, độc lập timezone máy. Kiểm tra giây so với millisecond.
6. Owner đăng ký bàn; khách đặt bàn trống, hủy booking của chính mình. Dùng getter bàn và mapping để hiển thị nguồn dữ liệu thật; chưa có bàn thì có empty state.
7. Xử lý chờ ký, chờ receipt, thành công, revert, người dùng từ chối và lỗi RPC. Chỉ hiện hash sau khi thực sự có transaction response; chỉ hiện thành công sau receipt thành công và tải lại state.
8. Ẩn thao tác không phù hợp quyền nhưng không thay thế kiểm tra trong contract. Không thêm nút hủy thay khách cho owner.
9. Xử lý đổi ví/đổi mạng; xóa dữ liệu cũ, làm mới signer/contract và listener, tránh response đọc chậm từ ví/slot cũ ghi đè màn hình mới.
10. Chạy test liên quan, build, mở server và kiểm tra HTTP. Nếu có công cụ browser/computer-use phù hợp thì đọc hướng dẫn công cụ, xem trang thật, kiểm tra console và layout; nếu không thì ghi chưa kiểm chứng phần thị giác/tương tác.
11. Tạo `docs/wallet-setup.md` bằng RPC/chain ID/địa chỉ công khai thực tế; cập nhật trạng thái.

## Người dùng thiết lập MetaMask

AI viết hướng dẫn cụ thể theo giao diện/phiên bản thực tế; nếu chưa xem được UI thì mô tả mục tiêu, không bịa tên menu chính xác.

1. Cài/mở MetaMask trong trình duyệt sẽ demo, hoàn tất khởi tạo hoặc mở khóa ví.
2. Thêm mạng Ganache bằng thông tin AI lấy ở bước 03: tên tùy chọn, RPC URL và chain ID đúng. Ký hiệu tiền có thể dùng ETH; mạng local không cần block explorer.
3. Import các tài khoản Ganache test owner/A/B trực tiếp trong ví bằng quy trình của Ganache/MetaMask. Giữ khóa riêng trên máy, không dán vào chat, code hoặc log.
4. Kiểm tra địa chỉ sau import khớp bảng địa chỉ công khai. Nếu ví có giới hạn truy cập localhost, xử lý theo hướng dẫn UI thực tế.
5. Mở URL server frontend do AI cung cấp; bấm kết nối và chấp thuận các tài khoản cần dùng.
6. Chọn owner và chấp thuận một giao dịch đăng ký bàn test khi giao diện yêu cầu. Sau đó chuyển khách A để kiểm tra địa chỉ trên trang thay đổi đúng.

Chỉ cần hoàn thành import/thiết lập một lần cho workspace Ganache đang dùng; không yêu cầu làm lại ở mỗi bước nếu không có thay đổi node/account. Nếu AI có thể hỗ trợ UI, vẫn để người dùng giữ bí mật và xử lý xác nhận riêng của ví.

## Kiểm chứng thủ công tối thiểu

| Tình huống | Kết quả cần quan sát |
| --- | --- |
| Kết nối đúng mạng | Ví, chain ID, address contract đúng |
| Owner đăng ký bàn | Hiện chờ ký/receipt rồi có bàn trên trang |
| Đổi sang A | Hiện địa chỉ A, quyền giao diện cập nhật |
| Từ chối một yêu cầu ký | Hiện lỗi dễ hiểu, không báo thành công |
| Chuyển sang mạng khác | Chặn thao tác ghi và hiện hướng dẫn quay lại |

Người dùng thực hiện phần ví; AI quan sát qua công cụ hoặc ghi nhận phản hồi có nguồn rõ ràng. Nếu người dùng tự xác nhận, ghi “người dùng xác nhận”, không ghi là AI đã trực tiếp kiểm tra.

## Điều kiện hoàn thành

- [ ] Source giao diện và test slot/build đạt.
- [ ] Server khởi chạy được, có URL cụ thể.
- [ ] Ví thực sự kết nối đúng Ganache, ít nhất một giao dịch UI thành công đã được xác minh.
- [ ] Có kết quả các mục đổi tài khoản, sai mạng, từ chối ký; mục chưa chạy ghi PARTIAL.
- [ ] Không đánh đồng RPC integration test với demo MetaMask.
- [ ] Bàn giao URL, account, bàn/slot hiện tại và việc còn thiếu cho bước 05.
