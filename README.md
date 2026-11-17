# Restaurant Table Booking

**Individual project - DS 441 A: Blockchain: Theory & Practices**

**Student:** Mai Nam Quốc | **Student ID:** 29211145181

A restaurant registers tables. Customers reserve a free table for a one-hour slot
and cancel only their own bookings. Solidity enforces permissions and prevents
duplicate claims. The English HTML/JavaScript interface uses ethers v6 and MetaMask.

## Prerequisites

| Component | Verified version |
| --- | --- |
| Node.js / npm | 26.3.0 / 11.16.0 |
| Git | 2.54.0.windows.1 |
| Hardhat | 3.22.0 |
| hardhat-ethers / hardhat-node-test-runner | 4.2.2 / 3.1.2 |
| ethers / TypeScript | 6.17.0 / 5.9.3 |
| Solidity / EVM target | 0.8.28 / paris, optimizer 200 runs |
| Vite | 8.3.8 |
| Ganache Desktop / RPC engine | 2.7.1 / 7.7.3 |

Use Node 26.x as specified by package.json, Ganache Desktop, and a browser with
MetaMask. The first compile needs Internet access to download solc. Dependencies
are project-local and pinned by two lockfiles. No backend or global Hardhat is needed.

## Install, compile and test

Run from the directory containing this README in PowerShell:

```powershell
npm.cmd ci
npm.cmd --prefix frontend ci
npm.cmd run compile
npm.cmd test
npm.cmd run test:frontend
npm.cmd run typecheck
npm.cmd run build
```

Use `npm` instead of `npm.cmd` on other shells. Contract tests use an in-memory
Hardhat network. Frontend service tests use wallet stubs, not real MetaMask.

## Ganache and deploy

Keep the existing workspace open. On a fresh installation, create a local Ganache
workspace with at least three funded, unlocked test accounts. Verified settings:
RPC `http://127.0.0.1:7545`, chain ID `1337` (`0x539`), network ID `5777`.
If your settings differ, edit network `ganache` in [hardhat.config.ts](hardhat.config.ts).
Do not substitute network ID for chain ID.

```powershell
npm.cmd run deploy:ganache
npm.cmd run verify:ganache
```

Deploy uses account 0 through Ganache RPC without a key file. It checks client/network,
funds, successful receipt, bytecode and owner. It starts with no tables or bookings
and automatically writes [frontend config](frontend/src/generated/contract.json),
[public metadata](docs/deployment.json) and per-transaction history in `docs/deployments/`.
Chain IDs in JSON are decimal strings. Never copy ABI/address manually.

Each deploy creates a new contract and updates that copy's frontend config.
`verify:ganache` is read-only. The recorded demo address is
`0xa504b217514805a4F51fc329D980445A3B0ec0Fe`, block 26, chain 1337: historical
evidence, not a fixed application constant. Reopen the same saved workspace and
verify it before reuse. Unsaved Quickstart state may be lost on restart; matching
chain IDs do not prove the old contract still exists. Deploy again after a reset.

## MetaMask and interface

Follow [wallet setup](docs/wallet-setup.md). Add the local RPC and chain ID above,
currency ETH, no explorer. Import only Ganache test accounts directly on your machine.
Never put keys, mnemonic phrases or passwords in source, chat or logs.

```powershell
npm.cmd run dev
```

Open <http://127.0.0.1:5173/> in the browser with MetaMask. Click **Connect MetaMask**.
Owner can **Register table**; customers can **Reserve table** or **Cancel booking**.
Confirm transactions yourself in MetaMask. Success appears only after receipt and
data refresh. Account/network changes invalidate the old session; wrong-chain writes
are blocked. No wallet access/signature is requested automatically on page load.

Stop a foreground server with Ctrl+C; restart with the same command. If port 5173
is occupied, check the running page before starting another server. Do not use a file URL.

## Demo and test evidence

Follow [the demo script](docs/demo-script.md). Recorded UI workflow: owner registered
Table 1 (4 seats); A reserved slot 498587; B's duplicate/unauthorized estimates were
rejected; A cancelled; B reserved again and retained the booking after reload.

```powershell
npm.cmd run inspect:demo
npm.cmd run test:ganache
```

`inspect:demo` only reads Table 1. `test:ganache` sends test transactions on an unused
table ID in 1000-1999, preserving existing tables/bookings. Re-running creates another
test table and is not required to open the web page. It records receipts, events,
exact expected errors and unchanged state after rejected preflights.
`demo:rejections` only estimates invalid actions on Table 1 / slot 498587 while A
holds it; it correctly stops now that B holds it. Earlier valid results are saved.

| Check | Recorded result |
| --- | --- |
| Contract T01-T16 | 24 passing |
| Frontend | 17 passing: 12 slot tests, 5 service tests |
| Build / HTTP | Passed / 200 |
| Ganache integration | Passed: 4 successful transactions, 2 expected preflight rejections |
| MetaMask | Owner/A/B writes; B booking and rejection message directly observed |
| Wrong-network blocking / reload | User confirmed; not claimed as observed at the exact moment |

See [test results](docs/test-results.md), [UI receipts](docs/ui-chain-evidence.json),
[RPC results](docs/integration-results.json), [rejection proof](docs/demo-rejections.json),
[screenshots](docs/screenshots/README.md) and [clean-copy reproduction](docs/reproduction-check.md).

## Rules and limits

`slotId = start Unix seconds / 3600` at an exact hour; the UI uses explicit UTC+07:00.
The interval is `[slotId * 3600, (slotId + 1) * 3600)`. Slots, table IDs and capacity
must be positive. Past hours are intentionally allowed. Capacity is display information.
Only the current customer can cancel; owner has no override.

One restaurant; no payments/deposits, backend, personal data, table removal, capacity
editing, owner transfer, arbitrary start/end times or multi-slot writes. Mined writes
still cost test gas despite having no booking fee. Listing is unpaginated. Mobile
visual QA and DevTools console inspection were not performed. This is a local coursework prototype.
Root audit recorded five high entries caused by transitive Zod 3 in development packages;
frontend installation recorded zero. No forced major upgrade was applied.

## Files and acknowledgments

`contracts/` and `test/` contain Solidity and tests; `scripts/` contains deploy,
verification/integration tools; `frontend/` contains UI/service/slot source and tests;
`docs/` contains design, receipts, results and real screenshots.
Read [submission checklist](docs/submission-checklist.md) and [individual study notes](docs/individual-explanation.md).

To validate or prepare a local handoff directory without sending it anywhere:

```powershell
node scripts/prepare-submission.mjs --check-only
node scripts/prepare-submission.mjs
```

The second command creates a timestamped source folder under submission/ with a
SHA256 manifest. It excludes dependencies/build/Git/.env/wallet/chain/local logs and
working plan/instruction records. The step 06 handoff also provides a local ZIP of
that directory, checked against the manifest. Review and submit it yourself.

Requirements: [assignment PDF](19_29211145181_Mai_Nam_Quoc.pdf). Original planning and
implementation instructions remain working records in the workspace, not the README.
Codex/ChatGPT assisted with planning, implementation, tests and documentation. The
student performed private wallet actions and must understand and explain the work.
No Python Storage example or another team's contract was used as this implementation.

Libraries/documentation: [Hardhat](https://hardhat.org/docs/),
[ethers plugin](https://hardhat.org/docs/plugins/hardhat-ethers),
[Node test runner plugin](https://hardhat.org/docs/plugins/hardhat-node-test-runner),
[ethers v6](https://docs.ethers.org/v6/), [Vite](https://vite.dev/guide/) and
[Node test runner](https://nodejs.org/api/test.html).
