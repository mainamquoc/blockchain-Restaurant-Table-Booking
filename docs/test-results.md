# Kết quả kiểm thử

## Bước 01 — môi trường

Ngày 17/11/2026: compile mẫu, 1 smoke test, typecheck, frontend build và HTTP 200
đã đạt. Chi tiết lịch sử ở [implementation-status.md](implementation-status.md).
Source mẫu EnvironmentCheck đã được thay bằng contract và test thật ở bước 02;
log `docs/logs/01-*` được giữ nguyên.

## Bước 02 — logic contract

Ngày 17/11/2026, Asia/Saigon. Kết quả cuối: **24 passing (24 nodejs), 0 failing**.

Môi trường: Node 26.3.0, npm 11.16.0, Hardhat 3.22.0, hardhat-ethers 4.2.2,
hardhat-node-test-runner 3.1.2, ethers 6.17.0, TypeScript 5.9.3,
Solidity 0.8.28 / EVM paris / optimizer 200 runs.

| Lệnh tại root | Exit code | Kết quả | Log cục bộ |
| --- | --- | --- | --- |
| `npm.cmd run compile` | 0 | Compiled 1 Solidity file | logs/02-compile.log |
| `npm.cmd test` | 0 | 24 passing | logs/02-test.log |
| `npm.cmd run typecheck` | 0 | Không có lỗi TypeScript | logs/02-typecheck.log |

Các log `.log` được Git bỏ qua. Bảng dưới đây lưu kết quả bền vững trong source.
Mạng test là `hardhatTest` (`edr-simulated`), chỉ tồn tại trong bộ nhớ.
Mỗi test deploy một instance mới; không dùng RPC hoặc tài khoản Ganache.

| ID kế hoạch | Kiểm chứng | Kết quả |
| --- | --- | --- |
| T01 | Owner đúng deployer, danh sách và mapping ban đầu trống | PASS |
| T02 | Owner đăng ký, capacity, danh sách đúng thứ tự, event đủ tham số | PASS |
| T03 | A và B không đăng ký được; hai test riêng | PASS |
| T04 | ID trùng không ghi đè capacity hoặc thêm ID lần nữa | PASS |
| T05 | ID 0 và capacity 0; hai test riêng | PASS |
| T06 | A đặt bàn trống, mapping và event ghi đúng người gọi | PASS |
| T07 | B không đặt trùng booking của A | PASS |
| T08 | A không đặt trùng booking của chính mình | PASS |
| T09 | B không hủy booking A | PASS |
| T10 | Owner không hủy booking A | PASS |
| T11 | A hủy, booking về address zero, bàn còn nguyên, event đúng | PASS |
| T12 | A đặt → B đặt trùng/hủy sai bị từ chối → A hủy → B đặt lại/hủy; A không hủy thay B | PASS |
| T13 | reserve/cancel với bàn 0, bàn 99 và slot 0; sáu test riêng | PASS |
| T14 | Hủy booking trống bị từ chối | PASS |
| T15 | Hai slot cùng bàn độc lập cả sau khi hủy một slot | PASS |
| T16 | Hai bàn cùng slot độc lập cả sau khi hủy một bàn | PASS |
| Bổ sung | Slot dương trong quá khứ được chấp nhận; owner tự đặt/hủy như khách | PASS |

Mỗi thao tác thành công kiểm tra receipt status 1, đúng một event, tên và toàn bộ
tham số event. Mỗi thao tác lỗi được kiểm tra hai lần: staticCall để giải mã chính xác
custom error/arguments, rồi gửi giao dịch với gasLimit tường minh để bỏ qua estimateGas.
Test yêu cầu receipt status 0 và logs rỗng, so sánh owner, danh sách ID, dữ liệu bàn,
các cặp booking dùng trong test và toàn bộ lịch sử event trước/sau revert.
Không so sánh balance/nonce vì giao dịch revert vẫn có thể tốn gas và tăng nonce.

Trong quá trình xây test, đã sửa cấu hình override không hợp lệ của Hardhat 3 và
cách xử lý lỗi staticCall của provider. Cấu hình cuối dùng mạng test riêng,
`throwOnTransactionFailures: false` để ethers nhận tx response rồi kiểm tra receipt
thất bại qua `wait()`. Cấu hình Ganache giữ nguyên. Các kết quả ở trên là lần chạy cuối.

## Chưa kiểm chứng

- T17 và RPC integration đã đạt ở bước 04–05 bên dưới. Một số kiểm chứng MetaMask
  vẫn đang chờ; không dùng kết quả wallet stub để thay demo ví thật.
- Test trên Hardhat không thay thế demo MetaMask hoặc bằng chứng Ganache.

## Bước 03 — deploy và xác minh Ganache

17/11/2026, 15:01 UTC+07:00: deploy thực tế qua RPC `http://127.0.0.1:7545`.
Client Ganache 7.7.3, chain ID `1337`, network ID `5777`; Desktop 2.7.1 đang chạy.

| Lệnh | Exit code | Kết quả | Log cục bộ |
| --- | --- | --- | --- |
| `npm.cmd run typecheck` | 0 | Script TypeScript hợp lệ | logs/03-typecheck.log |
| `npm.cmd run deploy:ganache` | 0 | Deploy thành công, receipt status 1, owner đúng, không seed | logs/03-deploy.log |
| `npm.cmd run verify:ganache` | 0 | Kiểm tra độc lập qua ethers JSON-RPC, không gửi giao dịch | logs/03-verify.log; logs/03-verification.json |

- Address: `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`.
- Tx: `0x701e5f1ad0a94513951b00086a49016d8bd83c84bc99d63b13c830066f2e8646`.
- Block `26`, gas used `391334`, runtime bytecode `1567` bytes.
- Verify kiểm tra receipt/contract address/block hash/from, chain ID, owner(),
  bytecode hash, ABI khớp artifact và cấu hình frontend khớp metadata. getTableIds() trả `[]`.
- Metadata compiler lấy từ build-info: solc `0.8.28+commit.7893614a`, paris,
  optimizer 200 runs. Không đổi compiler/source sau test bước 02; không gặp invalid opcode.
- Lần chạy script đầu bị lỗi đọc URL dạng ResolvedConfigurationVariable của Hardhat,
  chưa gửi giao dịch. Đã sửa dùng `await config.url.get()`, typecheck và deploy lại đạt.
- Đây là kiểm chứng deploy/read; chưa chạy luồng đăng ký/đặt/hủy trên Ganache.

## Bước 04 — frontend và ví, cập nhật 17/11/2026

- Frontend hoàn chỉnh, toàn bộ chữ/thông báo tiếng Anh theo yêu cầu; slot vẫn UTC+07:00.
- `npm.cmd run test:frontend`: exit 0, **17 passing**: 12 test T17 và 5 test service.
  T17 kiểm tra đầu/cuối ngày, qua tháng/năm, nhuận, ngày/giờ sai, không làm tròn,
  seconds/milliseconds và bốn timezone máy. Service kiểm tra config lỗi, thông báo
  wallet/RPC, giải mã cả 9 custom errors, sai mạng và đổi tài khoản trước gửi.
- Service tests dùng wallet stub và Vite SSR, **không giả làm MetaMask demo**.
- `npm.cmd run build`: exit 0, 155 modules; HTTP HTML và main.js 200, lang=en.
- Logs: `logs/04-frontend-tests.log`, `logs/04-build.log`, `logs/04-http.json`.
- Server từng dừng khiến người dùng không mở trang được; đã khởi động nền lại và
  xác minh HTTP 200. Tiến trình nền không cần người dùng giữ terminal mở trong phiên này.

| UI thực tế | Nguồn / kết quả |
| --- | --- |
| Owner kết nối đúng Ganache | AI quan sát Edge AX, người dùng gửi ảnh; account/chain/contract đúng |
| Owner đăng ký Table 1, 4 seats | Người dùng thao tác và gửi ảnh; receipt 1, block 27, tx `0xc10cf8b1a4ce19dfe35aa80a954406c4ea4d0b73e8963f4eee62aced336a3245` |
| Đổi sang A, quyền owner ẩn | AI quan sát account A, Customer, không có form owner |
| A đặt Table 1 / slot 498587 | Người dùng gửi ảnh và AI quan sát Your booking/Cancel booking/Transaction confirmed; receipt 1, block 34, tx `0xc2e8d449b6d3d340e25a6859671c98323a49a0215310b112a2febc08ea5a2160` |
| Reject yêu cầu ký thật | Người dùng xác nhận; AI quan sát thông báo You rejected the wallet request; ảnh screenshots/07-wallet-rejected.png |
| Đổi mạng thật và khóa thao tác | Người dùng xác nhận đã thử, Wrong network và khóa thao tác đúng rồi quay về Ganache; AI không trực tiếp quan sát thời điểm sai mạng |

Chưa đọc console bằng DevTools, chưa xác minh layout mobile trong trình duyệt thật.
Không coi build/HTTP là kiểm chứng console hoặc mọi kích thước màn hình.

## Bước 05 — RPC integration Ganache

`npm.cmd run test:ganache`: **exit 0, PASS**, 17/11/2026 15:22 UTC+07:00.
Mạng/bytecode hash/owner/ABI/accounts/số dư được kiểm tra trước khi gửi.
Contract `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`, chain `1337`.
Table **1001**, 4 seats; slot **498611** (18/11/2026 18:00 UTC+07:00).

| Thao tác | Kết quả / block | Transaction hash |
| --- | --- | --- |
| Owner đăng ký bàn riêng | PASS / 30 | `0xe09cf61980c3c75593551ab90003912848ab324cdb674ccca9b82fa674dfe044` |
| A đặt | PASS / 31 | `0xd5017c22a2e19c35f1b6f0f1dcc6e66609308f6677419f4b769fe2b5db58f9a6` |
| B đặt trùng | SlotAlreadyBooked; estimateGas bị từ chối trước gửi | Không có |
| B hủy sai quyền | NotBookingOwner; estimateGas bị từ chối trước gửi | Không có |
| A hủy | PASS / 32 | `0xc5918a352c1b573d4343faeb41969849a28d56e51d960d1066c9d4c6e877de5a` |
| B đặt lại | PASS / 33 | `0xe11343f581651f5e237b94337fef01e4d617081265152b8b18504b743cb45539` |

Receipt thành công, event/tất cả arguments và trạng thái mapping được assert.
Hai lỗi phải giải mã đúng custom error/arguments; booking/table/logs/nonce B giữ nguyên.
Không gửi giao dịch revert để tạo hash. Chủ booking cuối là B.
Metadata chi tiết: `integration-results.json`; lịch sử từng lần trong `integration-runs/`.

Lần chạy đầu **FAILED** ở parser lỗi estimateGas (Ganache trả data.result lồng nhau).
Table 1000 đã đăng ký và được A giữ tại slot 498611 trước khi script dừng; log và
metadata FAILED được giữ nguyên. Đã sửa parser, chạy với ID mới 1001 và đạt; không
reset chain hoặc đụng booking Table 1. Chạy lại luôn chọn ID chưa tồn tại 1000–1999.

## Bước 05 — bằng chứng từ chối trên đúng bàn UI

`npm.cmd run demo:rejections`: **exit 0, PASS** lúc 15:25 UTC+07:00.
Table **1**, slot **498587**, A đang giữ booking. Hai estimateGas bằng signer B
đều bị từ chối với SlotAlreadyBooked(1,498587) và NotBookingOwner(). Đã assert
booking vẫn thuộc A và lịch sử event không đổi. Không gửi giao dịch, không tx hash.
Chi tiết: `demo-rejections.json`, `logs/05-demo-rejections.log`.

## Bước 05 — hoàn tất demo UI MetaMask

Ngày 17/11/2026 khoảng 15:29 UTC+07:00: người dùng xác nhận A hủy → B đặt lại →
reload vẫn Your booking; xác nhận đã thử Reject và sai mạng, đều xử lý đúng.
AI quan sát trực tiếp qua AX Edge: account B, Customer, chain 1337 verified,
Table 1 / slot 498587 / Your booking / Cancel booking, và thông báo từ chối ký.

| Thao tác UI | Receipt / block | Transaction hash |
| --- | --- | --- |
| A hủy Table 1 / slot 498587 | Status 1 / 35 | `0x0267b2c4ce3a5def0b5861f68a8635225100ffb8a15fedb73ec3063c66a8ed37` |
| B đặt lại Table 1 / slot 498587 | Status 1 / 36 | `0xf0fef69e003780634a7304bb80b5f11815769613e8da4ea78ffd40a127f2cab7` |

RPC kiểm tra event BookingCancelled/TableReserved đúng bàn/slot/địa chỉ, và chủ
booking cuối là B; dữ liệu `ui-chain-evidence.json` cập nhật lúc 15:29.
Ảnh thật đã lưu: `screenshots/06-reserved-by-b.png`, `screenshots/07-wallet-rejected.png`.
Ảnh A/owner nằm trong chat với nguồn người dùng; không có file PNG A trong repository.
Sai mạng và thao tác reload được ghi nguồn người dùng xác nhận, không ghi AI tự thao tác.
Không gửi private key hoặc ký ví thay người dùng.

Bước 04 và 05 VERIFIED theo bằng chứng trên; bước 06 chưa bắt đầu. Kiểm tra console
DevTools và layout mobile chưa được quan sát trực tiếp, không phải kết quả PASS.
