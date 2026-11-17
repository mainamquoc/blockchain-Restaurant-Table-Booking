# Trạng thái triển khai Restaurant Table Booking

## Thông tin chung

- Gốc project: `C:/Users/Quoc/Desktop/DTU/Blockchain/web3`.
- Lần cập nhật: 17/11/2026, múi giờ Asia/Saigon (UTC+07:00).
- Bước hiện tại: 05 — VERIFIED; bước 04 cũng VERIFIED.
- Kế hoạch nguồn: `DS441A_Restaurant_Table_Booking.md`.
- Đã đọc `00_START_HERE.md`, `01_ENVIRONMENT.md`, kế hoạch và STATUS_TEMPLATE.
  Không tìm thấy AGENTS.md áp dụng trong workspace hoặc các thư mục cha đã kiểm tra.

## Tiến độ

| Bước | Trạng thái | Bằng chứng / việc còn thiếu |
| --- | --- | --- |
| 01 Môi trường | VERIFIED | Dependencies, compile, test mẫu, typecheck, build, HTTP 200 |
| 02 Contract và test | VERIFIED | RestaurantBooking.sol; 24 passing T01–T16; compile và typecheck đạt |
| 03 Ganache và deploy | VERIFIED | Deploy block 26, receipt 1, bytecode/owner đúng, ABI/config tự động và RPC verify đạt |
| 04 Ví và giao diện | VERIFIED | 17 frontend tests; build/HTTP 200; UI owner/A/B; Reject quan sát thật, sai mạng do người dùng xác nhận |
| 05 Tích hợp và demo | VERIFIED | RPC integration PASS; UI A đặt/hủy/B đặt lại; receipts, ảnh thật và nguồn xác nhận lưu trong docs |
| 06 Tài liệu và bàn giao | NOT_STARTED | README hiện là khung cho bước 01 |

## Bộ phiên bản và lệnh đã xác minh

- Node `26.3.0`, npm `11.16.0`, Git `2.54.0.windows.1`.
- Hardhat `3.22.0`; hardhat-ethers `4.2.2`; hardhat-node-test-runner `3.1.2`;
  ethers `6.17.0`; TypeScript `5.9.3`; @types/node root `26.0.0`.
- Solidity `0.8.28`, optimizer 200 runs, EVM target `paris`.
- Vite `8.3.8`; frontend JavaScript thuần, ethers `6.17.0`.
- npm registry `https://registry.npmjs.org/`; engine-strict `false`.
- Dùng dependency cục bộ, ESM, hai package-lock.json. Không thay Node hệ thống,
  không đổi PowerShell execution policy. Các lệnh dùng npm.cmd.
- Compile/test mẫu thành công trên mạng Hardhat trong bộ nhớ, không ghi vào Ganache.
- Deploy và verify Ganache đã đạt bước 03; `deploy:ganache` tạo contract mới,
  `verify:ganache` chỉ đọc contract hiện tại.
- Audit root: exit 1, 5 mục high do Zod `3.25.76` trong dependencies phát triển
  Hardhat (GHSA-mrhx-c7xc-m3w5). Giữ API tương thích của upstream; không ép Zod 4
  hay hạ Hardhat bằng fix --force. Audit frontend khi cài: 0 vulnerabilities.
- npm có cảnh báo allow-scripts cho esbuild; compile/test/build vẫn chạy thành công,
  không thay thiết lập script toàn máy.

## Cấu hình công khai

- Chế độ Ganache: đã quan sát Desktop, tiến trình từ gói `GanacheUI_2.7.1.0`.
- RPC URL: `http://127.0.0.1:7545`, chain ID `1337` (`0x539`), network ID `5777`.
- RPC client: `Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js`.
- `127.0.0.1:8545`: yêu cầu đọc timeout; không kiểm tra cổng khác, không mở chain mới.
- CLI Ganache: không tìm thấy trên PATH; điều này không có nghĩa Desktop chưa cài.
- MetaMask: đã quan sát extension Edge đang mở, owner/A/B dùng được; chưa xác minh số phiên bản extension.
- Owner: `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec`.
- Khách A: `0x810A640B6089B12ab3bb7Bde1697752129679828`.
- Khách B: `0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7`.
- Contract: `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`.
- Deployment tx: `0x701e5f1ad0a94513951b00086a49016d8bd83c84bc99d63b13c830066f2e8646`, block `26`.
- File cấu hình frontend: `frontend/src/generated/contract.json`, chainId là chuỗi `"1337"`.
- Metadata/số dư: `docs/deployment.json`; lịch sử `docs/deployments/`.
- Frontend URL: `http://127.0.0.1:5173/`; server chạy nền, HTTP 200 đã xác minh.
  Chạy lại tại root bằng `npm.cmd run dev`.
- UI demo: Table 1 / 4 chỗ / slot 498587 (17/11/2026 18:00 UTC+07:00), hiện thuộc B.
- RPC test: Table 1001 / slot 498611 thuộc B; lần chạy lỗi ban đầu để lại
  Table 1000 / slot 498611 thuộc A. Không reset hoặc xóa dữ liệu để làm sạch.

## Kiểm chứng

Các thao tác dưới đây chạy ngày 17/11/2026 khoảng 14:37–14:47 UTC+07:00.
Log trong `docs/logs/` là bằng chứng cục bộ; `.log` được bỏ qua bởi Git.

| Ngày giờ | Bước | Lệnh hoặc thao tác | Kết quả thực tế | Log / ảnh |
| --- | --- | --- | --- | --- |
| 17/11/2026 | 01 | git status --short; git rev-parse --git-dir | Repository hiện hữu, chỉ có PDF/kế hoạch/bộ bước untracked ban đầu | Quan sát terminal |
| 17/11/2026 | 01 | git log -1 --oneline | Exit 1: nhánh main chưa có commit; không tạo/reset Git | Quan sát terminal |
| 17/11/2026 | 01 | node --version; npm.cmd --version; git --version | Exit 0, phiên bản nêu trên | Quan sát terminal |
| 17/11/2026 | 01 | npm.cmd install --no-fund | Exit 0, 88 packages added; 5 audit high | logs/01-install-root.log |
| 17/11/2026 | 01 | npm.cmd --prefix frontend install --no-fund | Exit 0, 26 packages added; 0 vulnerabilities | logs/01-install-frontend.log |
| 17/11/2026 | 01 | npm.cmd run compile | Exit 0, compile 1 Solidity file, solc 0.8.28, paris | logs/01-compile.log |
| 17/11/2026 | 01 | npm.cmd test | Exit 0, 1 passing: deploy, receipt status 1, đọc value 42 | logs/01-test.log |
| 17/11/2026 | 01 | npm.cmd run typecheck | Exit 0 | logs/01-typecheck.log |
| 17/11/2026 | 01 | npm.cmd run build | Exit 0, Vite build 152 modules | logs/01-build.log |
| 17/11/2026 | 01 | npm.cmd run dev; HTTP GET / và /src/main.js | Vite ready; HTTP 200 cả HTML và JS module, title đúng | logs/01-http.json |
| 17/11/2026 | 01 | eth_chainId; net_version; web3_clientVersion | Đọc được RPC 7545; không gửi giao dịch | Cấu hình công khai ở trên |
| 17/11/2026 | 01 | npm.cmd audit --json | Exit 1, 5 high, cùng nguồn Zod | logs/01-audit-root.json |
| 17/11/2026 | 01 | npm.cmd --prefix frontend ci --no-fund | Lần đầu EPERM do Vite khóa binding; dừng đúng Vite vừa tạo, chạy lại exit 0, 24 packages, 0 vulnerabilities | logs/01-ci-frontend.log |
| 17/11/2026 | 01 | npm.cmd run build sau frontend ci | Exit 0, build lại thành công từ lockfile | logs/01-build.log |
| 17/11/2026 | 01 | SHA256 toàn bộ PDF/kế hoạch/bộ bước; git diff --check | Exit 0; tài liệu nguồn không thay đổi | logs/01-preservation.json |

## File đã thay đổi

Tạo mới package/lockfile root và frontend; hardhat.config.ts; tsconfig.json;
.gitignore; README.md; contracts/EnvironmentCheck.sol; test/EnvironmentCheck.test.ts;
scripts/deploy.ts; frontend/index.html; frontend/src/main.js; frontend/src/style.css;
docs/implementation-status.md và log kiểm chứng.
Giữ mẫu EnvironmentCheck để tái kiểm tra công cụ, xóa ở bước 02 khi thay bằng test thật.
Không tạo contract nghiệp vụ trong bước 01.

PDF, kế hoạch và bộ implementation-steps giữ nguyên. Hash SHA256 lưu trong
`logs/01-source-hashes.json`; không sửa `.git`, không commit/push/publish.

## Chờ người dùng

- Không có thao tác bắt buộc còn thiếu cho bước 01–05. Giữ Ganache mở.
- Ganache đã được quan sát; không reset hoặc đổi workspace.
- Không gửi khóa hoặc mật khẩu. Ví đã được thiết lập và demo, không yêu cầu import lại.
- Console DevTools và layout mobile chưa kiểm tra trực tiếp. Sai mạng và reload
  do người dùng xác nhận; ảnh/AX/receipts và test service được ghi nguồn riêng.

## Bàn giao bước tiếp theo

- Đọc `implementation-steps/00_START_HERE.md`, `implementation-steps/06_DOCUMENTATION_AND_HANDOFF.md`,
  kế hoạch chính, test-results, demo-script và file trạng thái này khi người dùng giao bước 06.
- Đã đạt các điều kiện bước 01–05; bước 06 cần hoàn thiện tài liệu và kiểm tra tái hiện.
- Test thật dùng `network.create("hardhatTest")`, `connection.ethers`, node:test/node:assert.
  `connection.close()` giải phóng kết nối sau test. Mạng test riêng không dùng Ganache.
- Không trộn cú pháp Hardhat 2, không dùng ethers v5.
- EVM paris đã deploy thành công trên Ganache 7.7.3 ở bước 03.
- Lịch sử: 17/11/2026 — khởi tạo và kiểm chứng môi trường bước 01.

## Cập nhật bước 02 — 17/11/2026

- Đã đọc lại hướng dẫn chung, bước 02, kế hoạch mục 2/4/7 và trạng thái bước 01.
- Tạo `contracts/RestaurantBooking.sol`, `test/RestaurantBooking.test.ts`,
  `docs/contract-design.md`, `docs/test-results.md`; sửa README và trạng thái này.
- Xóa đúng hai file mẫu EnvironmentCheck của bước 01 theo kế hoạch bàn giao.
- Thêm mạng `hardhatTest` mô phỏng trong hardhat.config.ts; giữ cấu hình Ganache.
  Không thêm dependencies, không đổi compiler hoặc lockfile.
- API chốt: registerTable, reserve, cancel, getTableIds; getters owner/tables/bookings.
  Owner immutable, chỉ owner đăng ký, chỉ người giữ booking được hủy, kể cả khi người
  hủy là owner. Event và custom errors xem `contract-design.md`.
- `npm.cmd run compile`: exit 0, compile 1 Solidity file, 0.8.28 / paris.
- `npm.cmd test`: exit 0, **24 passing**, bao phủ T01–T16 với các nhánh lỗi tách riêng.
- `npm.cmd run typecheck`: exit 0. Log cuối trong `docs/logs/02-*.log`.
- Xác minh event/arguments, custom errors/arguments, receipt thành công và revert,
  dữ liệu không đổi và không có event thành công sau revert. Luồng hai khách đã đạt.
- Lỗi khi dựng test (override mạng, định dạng lỗi staticCall) đã sửa và chạy lại đạt;
  chi tiết phương pháp tại `docs/test-results.md`.
- Test chỉ chạy trên Hardhat trong bộ nhớ. Không deploy hoặc gửi giao dịch Ganache;
  không có địa chỉ contract thật, không sinh ABI/config frontend. RPC ở trên vẫn là
  quan sát bước 01, chưa xác minh lại cho bước 03.
- Chưa chạy T17/T18 hoặc giao diện MetaMask; không có thao tác thủ công chờ bước 02.
- Lịch sử: 17/11/2026 — bước 02 VERIFIED, bàn giao bước 03 khi người dùng yêu cầu.

## Cập nhật bước 03 — 17/11/2026, 15:01 UTC+07:00

- Kiểm tra lại Ganache Desktop đang chạy, eth_chainId/eth_accounts/eth_getBalance,
  web3_clientVersion/net_version. Node có 10 tài khoản, dùng account 0/1/2 đúng kế hoạch.
- Số dư trước deploy: owner `99.984537190325594567` ETH test,
  A `99.98126392`, B `99.99299888`; sau deploy owner `99.976712721979436951`.
- Viết scripts/deploy.ts và scripts/verify-deployment.ts; thêm verify:ganache vào
  package.json; đặt RPC timeout 10 giây. Không đổi contract/compiler/dependencies.
- Deploy qua tài khoản Ganache unlock, không đọc khóa; receipt status 1, block 26,
  gasUsed 391334; code 1567 bytes và owner() đúng. Danh sách bàn trống, không seed.
- Xuất frontend/src/generated/contract.json, docs/deployment.json và một metadata
  lịch sử theo tx hash trong docs/deployments/. Chain ID JSON luôn là chuỗi thập phân.
- Typecheck, deploy, verify đều exit 0. Bằng chứng tại docs/logs/03-*.log và
  docs/logs/03-verification.json; bảng kết quả ở docs/test-results.md.
- Verify độc lập qua ethers JSON-RPC: receipt, bytecode hash, owner, chain ID,
  ABI khớp artifact, config frontend khớp metadata. Không gửi thêm giao dịch khi verify.
- Lỗi đọc URL cấu hình Hardhat ở lần đầu đã sửa trước khi gửi deploy. Chỉ có một
  giao dịch deploy được gửi trong bước này; không reset hoặc tạo chain cạnh tranh.
- README có hướng dẫn giữ node/mở lại đúng workspace, verify trước khi dùng lại.
  Tên workspace và việc lưu bền vững chưa được xác minh qua UI; nếu Quickstart tạo
  chain mới khi mở lại, cần deploy lại để xuất config mới. Không coi chain ID trùng là
  bằng chứng địa chỉ cũ còn tồn tại.
- Cập nhật README, contract-design, test-results, trạng thái; giữ lịch sử bước 01/02.
- Bước tiếp theo: 04 — ví và frontend. MetaMask chưa xác minh, demo UI chưa chạy.

## Cập nhật bước 04–05 — 17/11/2026, hoàn tất khoảng 15:30 UTC+07:00

- Frontend HTML/CSS/JS dùng ethers v6, chỉ đọc generated/contract.json. Toàn bộ
  chữ/thông báo đổi sang tiếng Anh theo yêu cầu; slot vẫn UTC+07:00 tường minh.
- Trước ghi: kiểm tra chain, bytecode, owner/receipt deploy, account hiện tại. Không
  yêu cầu kết nối/ký lúc tải trang. Account/network change xóa session và dữ liệu cũ;
  epoch/readVersion chặn response cũ. Có Refresh tables, loading/empty/error states.
- Owner register; khách đặt/hủy đúng quyền; trạng thái chờ ví → tx hash → receipt →
  tải lại state. Custom errors và RPC/rejection hiển thị tiếng Anh. Form owner ẩn với khách.
- Tạo wallet-setup.md, demo-script.md, screenshots/README.md; cập nhật README/test-results.
- `npm.cmd run test:frontend`: exit 0, 17 passing (12 T17 + 5 service tests bằng stub).
- `npm.cmd run build`: exit 0, 155 modules. HTTP / và /src/main.js đều 200; lang=en.
  Server đã khởi động lại nền sau lỗi người dùng mất kết nối; log docs/logs/04-server*.
- `npm.cmd run typecheck`: exit 0 sau khi thêm scripts bước 05.
- Viết integration-ganache.ts, inspect-demo.ts, demo-rejections.ts và các npm scripts
  test:ganache/inspect:demo/demo:rejections. Không thêm dependencies, không đổi contract.
- RPC integration: PASS trên Table 1001 / slot 498611, 4 giao dịch status 1
  (blocks 30–33), hai estimateGas bị từ chối đúng lỗi, mapping/event/nonce không đổi.
  Metadata và lịch sử cả lần FAILED parser lỗi tại docs/integration-runs/; kết quả
  đạt tại docs/integration-results.json. Không có tx hash cho preflight bị từ chối.
- UI Table 1: owner đăng ký block 27; A đặt block 34; A hủy block 35; B đặt lại block 36.
  Receipt/event/account đúng và chủ booking cuối B, docs/ui-chain-evidence.json.
- B đặt trùng/hủy sai quyền trên đúng Table 1 trong lúc A giữ: PASS qua estimateGas,
  docs/demo-rejections.json; hiện script sẽ dừng vì B đã giữ, không chạy lại giả PASS.
- Người dùng thao tác MetaMask, gửi ảnh owner/A và xác nhận A hủy/B đặt/reload,
  Reject và sai mạng. AI quan sát account A/B, quyền UI, booking và thông báo Reject;
  sai mạng/reload ghi đúng nguồn người dùng xác nhận. Không ký ví thay người dùng.
- Ảnh thật trên máy: docs/screenshots/06-reserved-by-b.png và 07-wallet-rejected.png.
  Ảnh owner/A chỉ có trong chat, không giả định file PNG đã tồn tại trong repo.
- Không có việc thủ công đang chờ. Chưa thực hiện bước 06, chưa push/publish/nộp bài.
