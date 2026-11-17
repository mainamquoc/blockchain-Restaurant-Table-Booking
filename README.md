# Restaurant Table Booking

Bài tập cá nhân DS 441 A — Mai Nam Quốc, MSSV 29211145181.
Ứng dụng đặt bàn theo slot một giờ, dùng Solidity, Ganache và MetaMask.

Hiện đã hoàn thành **bước 01–05: môi trường, contract/test, deploy, giao diện và demo**.
Frontend dùng tiếng Anh; slot luôn theo UTC+07:00. Xem [trạng thái bàn giao](docs/implementation-status.md)
và [kế hoạch nguồn](DS441A_Restaurant_Table_Booking.md).

## Công cụ đã kiểm chứng

| Thành phần | Phiên bản |
| --- | --- |
| Node.js / npm | 26.3.0 / 11.16.0 |
| Git | 2.54.0.windows.1 |
| Hardhat | 3.22.0 |
| hardhat-ethers / hardhat-node-test-runner | 4.2.2 / 3.1.2 |
| ethers.js | 6.17.0 |
| TypeScript / @types/node (root) | 5.9.3 / 26.0.0 |
| Solidity / EVM target | 0.8.28 / paris |
| Vite | 8.3.8 |

Hardhat 3 dùng ESM, cấu hình và test TypeScript, `node:test` cùng `node:assert`.
Frontend dùng HTML/CSS/JavaScript thuần. Node 26 được giữ nguyên trên máy.
EVM `paris` tránh sinh opcode PUSH0 khi triển khai Ganache cũ; deploy thực tế
đã thành công trên Ganache engine 7.7.3 ở bước 03.

## Chạy cục bộ

Tại thư mục `web3/`, trong PowerShell:

```powershell
npm.cmd ci
npm.cmd --prefix frontend ci
npm.cmd run compile
npm.cmd test
npm.cmd run test:frontend
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Mở <http://127.0.0.1:5173/>. Dừng server bằng Ctrl+C; chạy lại bằng
`npm.cmd run dev`. Lần compile đầu cần mạng để Hardhat tải compiler.
Hai lockfile cố định dependencies cho root và frontend.

Khi cần triển khai một instance mới, giữ Ganache mở rồi chạy:

```powershell
npm.cmd run deploy:ganache
npm.cmd run verify:ganache
```

Lệnh deploy gửi giao dịch bằng account 0 đã unlock trên node local, không cần file
khóa. Script kiểm tra client Ganache, chain ID và số dư, chờ receipt, kiểm tra owner,
bytecode và danh sách bàn trống; sau đó xuất ABI/address/chainId tự động.
Mỗi lần deploy tạo contract mới; chỉ chạy `verify:ganache` để kiểm tra lại contract
hiện tại mà không gửi giao dịch. Lịch sử lưu trong `docs/deployments/`.

## Cấu trúc hiện tại

- `contracts/RestaurantBooking.sol`, `test/RestaurantBooking.test.ts`: contract nghiệp vụ
  và 24 test trên mạng Hardhat tạm trong bộ nhớ; đã thay source mẫu bước 01.
- `docs/contract-design.md`, `docs/test-results.md`: thiết kế, custom errors và kết quả T01–T16.
- `scripts/deploy.ts`, `scripts/verify-deployment.ts`: deploy và xác minh RPC chỉ đọc.
- `docs/deployment.json`, `docs/deployments/`: metadata hiện tại và lịch sử deploy.
- `frontend/src/generated/contract.json`: ABI, address, chainId dạng chuỗi thập phân,
  tx hash và block do script xuất, là nguồn cấu hình duy nhất cho frontend.
- `frontend/`: giao diện tiếng Anh, kết nối MetaMask, đăng ký/đặt/hủy bàn;
  `src/services/blockchain.js`, `src/utils/slots.js` và 17 frontend tests.
- `scripts/integration-ganache.ts`: integration RPC thật bằng tài khoản test unlock,
  chọn bàn mới từ 1000–1999, giữ nguyên bàn demo và lưu kết quả/lịch sử.
- `docs/wallet-setup.md`, `docs/demo-script.md`: hướng dẫn ví và kịch bản demo.
- `docs/integration-results.json`, `docs/ui-chain-evidence.json`, `docs/demo-rejections.json`:
  kết quả RPC và receipt UI, nguồn bằng chứng tách riêng.
- `docs/screenshots/`: ảnh thật booking B và thông báo từ chối ký.
- `docs/implementation-status.md`: phiên bản, bằng chứng và bàn giao.
- `docs/logs/`: log kiểm chứng cục bộ; file `.log` được Git bỏ qua.
- `implementation-steps/`, PDF và kế hoạch: tài liệu nguồn được giữ nguyên.

## Ganache và kiểm chứng

Đã quan sát Ganache Desktop 2.7.1, RPC `http://127.0.0.1:7545`,
chain ID `1337` (`0x539`), network ID `5777`, RPC engine Ganache `7.7.3`.
Thông số được xác minh lại ngày 17/11/2026 ở bước 03–05.
MetaMask đã được dùng trong Edge, owner và hai khách giao dịch UI thành công.

- Contract: `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`.
- Owner: `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec`.
- Deployment tx: `0x701e5f1ad0a94513951b00086a49016d8bd83c84bc99d63b13c830066f2e8646`.
- Block: `26`; receipt status `1`; runtime bytecode `1567` bytes.
- Không seed khi deploy. Sau demo có Table 1 / slot 498587 thuộc khách B;
  bàn test 1000/1001 tại slot 498611 lần lượt thuộc A/B. Địa chỉ và số dư trước deploy
  nằm trong `docs/deployment.json`; đó không phải số dư cập nhật sau demo.

Giữ Ganache Desktop mở và dùng nguyên workspace đang chạy. Khi mở lại ứng dụng,
chọn lại workspace đã lưu của buổi này và kiểm tra RPC 7545 bằng `verify:ganache`.
Tên/chế độ lưu workspace hiện tại chưa được xác minh qua UI. Nếu đang dùng Quickstart,
đóng/mở có thể tạo chain mới và mất địa chỉ đã deploy. Nếu workspace bị reset, cần
deploy lại và dùng file generated mới; không dùng địa chỉ cũ. Không reset node để chạy web.

Compile, test nghiệp vụ (24 passing), typecheck đã đạt ở bước 02.
Build frontend và HTTP 200 đã đạt ở bước 01.
Deploy và verify Ganache, ABI khớp artifact, owner và bytecode đã đạt ở bước 03.
HTTP không thay thế kiểm chứng hiển thị trình duyệt hay luồng MetaMask.
Frontend 17 tests, build/HTTP và UI MetaMask đã kiểm chứng bước 04–05.
Kịch bản A đặt → B bị từ chối đặt trùng/hủy sai → A hủy → B đặt lại đã chạy thật;
người dùng xác nhận reload giữ booking và thử sai mạng; AI quan sát B/rejection,
RPC xác minh receipts. Xem `docs/test-results.md` để phân biệt nguồn từng kết quả.

```powershell
npm.cmd run inspect:demo
npm.cmd run test:ganache
```

`inspect:demo` chỉ đọc Table 1. `test:ganache` gửi giao dịch bằng tài khoản test,
mỗi lần tạo bàn test mới, không cần chạy lại để mở web. `demo:rejections` chỉ kiểm
tra estimateGas trên Table 1 / slot 498587 khi A còn giữ; hiện B đã giữ nên lệnh này
sẽ dừng đúng điều kiện. Kết quả lần chạy hợp lệ được lưu trong docs.

`npm audit` báo 5 mục mức high ở cây dependency phát triển Hardhat, cùng bắt nguồn
từ Zod 3; frontend cài đặt báo 0 vulnerabilities. Không ép nâng Zod 3 lên major 4
hoặc chạy `audit fix --force` vì có thể phá API của Hardhat. Chi tiết nằm trong
`docs/logs/01-audit-root.json`.

## Nguồn và hỗ trợ

- Yêu cầu: `19_29211145181_Mai_Nam_Quoc.pdf`, kế hoạch trong repository.
- [Hardhat: hỗ trợ Node](https://hardhat.org/docs/reference/nodejs-support),
  [cấu hình](https://hardhat.org/docs/reference/configuration),
  [ethers plugin](https://hardhat.org/docs/plugins/hardhat-ethers),
  [Node test runner](https://hardhat.org/docs/plugins/hardhat-node-test-runner).
- [ethers.js v6](https://docs.ethers.org/v6/).
- Source và kiểm chứng bước 01–05 được thực hiện với hỗ trợ Codex; các thao tác
  xác nhận riêng của MetaMask do người dùng thực hiện.
