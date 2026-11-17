# Restaurant Table Booking

**DS 441 A - Blockchain: Theory & Practices**

**Individual project:** Mai Nam Quốc | **Student ID:** 29211145181

A restaurant registers tables. Customers reserve a free table for a one-hour slot
and cancel only their own bookings. Solidity enforces permissions and prevents
duplicate reservations. The English HTML/JavaScript interface connects through MetaMask.

## Requirements

Verified with Node **26.3.0**, npm **11.16.0**, Hardhat **3.22.0**, ethers **6.17.0**,
TypeScript **5.9.3**, Vite **8.3.8**, Ganache Desktop **2.7.1** / engine **7.7.3**,
and MetaMask in Edge. Solidity **0.8.28**, EVM **paris**, optimizer **200** runs.
Use Node 26.x, Ganache, and a browser with MetaMask. Internet is needed to install
dependencies and download the compiler on first use. No backend is required.

## Install and check

```powershell
git clone https://github.com/mainamquoc/blockchain-Restaurant-Table-Booking.git
cd blockchain-Restaurant-Table-Booking
npm.cmd ci
npm.cmd --prefix frontend ci
npm.cmd run compile
npm.cmd test
npm.cmd run test:frontend
npm.cmd run typecheck
npm.cmd run build
```

Run all commands from this project root. On other shells, use `npm` instead of
`npm.cmd`. Contract tests use an in-memory Hardhat network; frontend service tests
use wallet stubs. [Recorded results](docs/test-results.md) distinguish these from real Ganache/UI tests.

## Run Ganache and deploy

Open a Ganache workspace with at least three funded, unlocked test accounts.
The verified configuration in [hardhat.config.ts](hardhat.config.ts) is:

| Setting | Value |
| --- | --- |
| RPC | http://127.0.0.1:7545 |
| Chain ID | 1337 (0x539) |
| Network ID | 5777; this is not the chain ID |
| Accounts | 0 = owner, 1 = customer A, 2 = customer B |

If your workspace differs, update the ganache network configuration before deploying.

```powershell
npm.cmd run deploy:ganache
```

This deploys using Ganache account 0, waits for a successful receipt and checks
bytecode, owner and the initial empty table list. No private key file is needed.
It automatically updates [frontend ABI/address/chain ID](frontend/src/generated/contract.json)
and [public deployment metadata](docs/deployment.json). Never copy ABI/address manually.
Each deploy creates a new instance with no tables/bookings. Keep the same workspace
running; after a reset, deploy again. A matching chain ID alone does not prove that
an old contract address is still valid.

## Connect MetaMask and use the interface

Add the local network above to MetaMask with currency ETH and no block explorer.
Import only the Ganache test accounts directly on your machine, then select the
desired role. Do not share keys, mnemonic phrases or passwords, and do not use real funds.

```powershell
npm.cmd run dev
```

Open <http://127.0.0.1:5173/> in the browser with MetaMask and click **Connect MetaMask**.
Owner sees **Restaurant management** and can **Register table** (e.g. ID 1, 4 seats).
Choose **Date** and **Start time**. Customers can **Reserve table** when free and
**Cancel booking** only for their own booking. Confirm or reject each transaction
yourself in MetaMask. The interface waits for a successful receipt and refreshes data
before reporting success. Use **Refresh tables** after another account changes state.
Account/network changes invalidate old data; the wrong network blocks writes.

Stop a foreground server with Ctrl+C; restart using the same command. If port 5173
is occupied, check the existing page first. Do not open index.html using a file URL.

## Demonstration and evidence

1. Owner registers a table.
2. A reserves the table and a selected slot.
3. B cannot reserve the same table/slot or cancel A's booking. The UI hides invalid
   buttons; direct contract tests and saved Ganache estimates prove the restrictions.
4. A cancels; B can then reserve that slot.
5. Reload and reconnect B: the booking remains on-chain.
6. Reject a wallet request and try a different network to check the error/disabled state.

The recorded demo used Table 1, 4 seats, **2026-11-17 18:00-19:00 UTC+07:00**, slot
**498587**. B currently holds it. Choose a fresh table/slot for another demonstration.
Historical contract: `0xa504b217514805a4F51fc329D980445A3B0ec0Fe`, chain 1337,
deployment block 26. A new deployment has its own address/config and empty state.

[Test results](docs/test-results.md), [UI receipts](docs/ui-chain-evidence.json),
[RPC integration results](docs/integration-results.json), [rejection proof](docs/demo-rejections.json),
and [real screenshots](docs/screenshots/README.md) provide grading evidence.
See [individual explanation notes](docs/individual-explanation.md) for contract/Web3 concepts.

## Rules and limitations

`slotId = start Unix seconds / 3600`, at a whole-hour start. The interval is
`[slotId * 3600, (slotId + 1) * 3600)`; the UI uses explicit UTC+07:00. IDs, capacity
and slots must be positive. Past hours are intentionally allowed. Capacity is display-only.
Only the customer holding the booking can cancel; owner has no override.

One restaurant; no payments/deposits, backend, personal data, table deletion,
capacity editing, owner transfer, arbitrary time ranges or multi-slot writes.
Transactions use test gas even though no booking fee is charged. Listing is unpaginated.
Mobile visual QA and DevTools console inspection were not performed. Root install
audit reported five high entries from transitive development dependencies (Zod 3);
frontend install reported zero. This is a local coursework prototype.

## Submission contents and sources

- `contracts/`, `test/`: Solidity and 24 contract tests.
- `scripts/deploy.ts`: the deployment entry point needed for a fresh clone.
- `frontend/`: interface, wallet service, slot utilities, 17 frontend tests, public generated config.
- `docs/`: test results, explanation notes, public metadata/receipts and screenshots.
- Package/lockfiles and configuration: reproducible installation and build.

Working notes, AI task instructions, extra automation and old ZIP packages are
preserved locally under ignored `archived/`; they are not part of the Git submission.
Dependencies/build outputs and local chain/wallet data are also ignored.

Requirements: [assignment PDF](19_29211145181_Mai_Nam_Quoc.pdf). Codex/ChatGPT assisted
with planning, implementation, testing and documentation. The student performed
private wallet actions and is responsible for understanding and explaining the work.
No Python Storage example or another team's contract was used as the implementation.

Libraries/docs: [Hardhat](https://hardhat.org/docs/), [ethers v6](https://docs.ethers.org/v6/),
[Vite](https://vite.dev/guide/) and [Node test runner](https://nodejs.org/api/test.html).
