# Test results

Recorded on 2026-11-17, Asia/Saigon (UTC+07:00). Unit, RPC and wallet evidence
are distinct. Commands run at project root. No result below is inferred from build alone.

## Environment

Node 26.3.0, npm 11.16.0, Hardhat 3.22.0, hardhat-ethers 4.2.2,
hardhat-node-test-runner 3.1.2, ethers 6.17.0, TypeScript 5.9.3,
Solidity 0.8.28 / paris / optimizer 200, Vite 8.3.8.

## Step 01: toolchain

Compile and one temporary EnvironmentCheck smoke test passed, along with typecheck,
frontend build and HTTP 200. Those two sample source files were replaced in step 02;
local 01-* logs retain that historical run. Original PDF/plan/instructions were unchanged.
The Git repository initially had no commits; no history was reset or forced.

Root installation audit reported five high entries from Zod 3 development dependencies;
frontend installation reported zero. npm warned about esbuild install scripts, but
compile/test/build succeeded. No system Node or PowerShell security setting was changed.

## Step 02: Solidity logic

`npm.cmd run compile`, `npm.cmd test`, `npm.cmd run typecheck`: exit 0.
**24 passing**, on the explicit in-memory hardhatTest network, never Ganache.
Local logs: docs/logs/02-compile.log, 02-test.log, 02-typecheck.log.

| Plan test | Verified behavior |
| --- | --- |
| T01 | Correct owner, empty initial IDs/table/booking |
| T02 | Owner registers, capacity and insertion order correct, exact event arguments |
| T03 | A and B registration rejected in separate tests |
| T04 | Duplicate ID cannot overwrite capacity or append again |
| T05 | ID zero and capacity zero rejected separately |
| T06 | A reserves, mapping/event use actual caller |
| T07-T08 | Neither B nor A can duplicate A's booking |
| T09-T10 | Neither B nor owner can cancel A's booking |
| T11 | A cancels, mapping zero, table unchanged, correct event |
| T12 | A books, invalid B actions fail, A cancels, B rebooks/cancels; A cannot cancel B |
| T13 | reserve/cancel for missing IDs 0/99 and slot zero: six independent tests |
| T14 | Empty cancellation rejected |
| T15 | Different slots on same table remain independent after cancellation |
| T16 | Different tables at same slot remain independent after cancellation |
| Additional | Past positive slot accepted; owner can book/cancel as an ordinary customer |

Success helpers assert receipt status 1 and exactly one event with its full arguments.
Failure helpers decode the exact staticCall error/arguments, send with explicit gas,
assert failed receipt status 0/no logs, and compare owner, IDs, sampled table/bookings
and event history. Balances/nonces may change for mined reverts and are not compared.
Hardhat configuration/staticCall wrapper issues during test development were corrected;
the final results above are the passing run. Solidity source was not weakened.

## Step 03: actual Ganache deployment

Ganache Desktop 2.7.1, engine 7.7.3, RPC http://127.0.0.1:7545,
chain 1337, network ID 5777. All deploy/typecheck/verify commands exited 0.
[Metadata](deployment.json) records solc 0.8.28+commit.7893614a, paris and optimizer 200.

- Contract: 0xa504b217514805a4F51fc329D980445A3B0ec0Fe.
- Tx: 0x701e5f1ad0a94513951b00086a49016d8bd83c84bc99d63b13c830066f2e8646.
- Block 26; receipt 1; gas used 391334; runtime code 1567 bytes; owner correct.
- No tables/bookings seeded. ABI/config generated, then independently compared to
  artifact/receipt/chain/bytecode hash/owner by verify:ganache.
- Initial URL resolution error was fixed using await config.url.get() before any deploy
  transaction was submitted. Local logs: docs/logs/03-*.

## Step 04: frontend and wallet

`npm.cmd run test:frontend`: exit 0, **17 passing**. T17 has 12 tests for exact
UTC+07 conversion, start/end of day, month/year/leap boundaries, malformed dates,
invalid/non-hour input without rounding, seconds versus milliseconds, invalid IDs,
and four host timezones. Five service tests cover invalid config, English wallet/RPC
messages, all nine custom errors, wrong network and changed accounts before writes.
Service tests use wallet stubs/Vite SSR, not MetaMask transactions.

Build exited 0, 155 modules. HTML and main.js returned HTTP 200 with lang=en.
The server stopped during the demo, causing a user connection error; it was restarted
in the background and HTTP reverified. Local logs: docs/logs/04-*.

| Actual wallet check | Evidence source |
| --- | --- |
| Owner on correct Ganache | Agent observed Edge accessibility; user supplied screenshot |
| Owner registered Table 1, 4 seats | User operated wallet; receipt status 1, block 27 |
| Switched to A, owner controls hidden | Agent observed A address/Customer and no owner form |
| A reserved Table 1 / slot 498587 | User screenshot, agent observed Your booking/Cancel booking/confirmed; receipt 1, block 34 |
| Rejected signature request | User confirmed, agent observed rejection message and saved real screenshot |
| Wrong-network writes blocked | User explicitly confirmed correct behavior and return to Ganache; not directly observed at that moment |

DevTools console and mobile visual layout were not directly inspected; no PASS is
claimed for these. The desktop layout was observed through actual UI/screenshots.

## Step 05: separate RPC integration

`npm.cmd run test:ganache`: exit 0, **PASS**, approximately 15:22 UTC+07.
Chain/code hash/owner/ABI/accounts/funds were checked first. Dedicated Table 1001,
4 seats, slot 498611 (2026-11-18 18:00-19:00 UTC+07) on the demo contract.

| Action | Result / block | Transaction hash |
| --- | --- | --- |
| Owner registers | Receipt 1 / 30 | 0xe09cf61980c3c75593551ab90003912848ab324cdb674ccca9b82fa674dfe044 |
| A reserves | Receipt 1 / 31 | 0xd5017c22a2e19c35f1b6f0f1dcc6e66609308f6677419f4b769fe2b5db58f9a6 |
| B duplicates | SlotAlreadyBooked, rejected estimate before send | None |
| B cancels A | NotBookingOwner, rejected estimate before send | None |
| A cancels | Receipt 1 / 32 | 0xc5918a352c1b573d4343faeb41969849a28d56e51d960d1066c9d4c6e877de5a |
| B rebooks | Receipt 1 / 33 | 0xe11343f581651f5e237b94337fef01e4d617081265152b8b18504b743cb45539 |

Exact events/arguments/mapping asserted after success. Expected estimate failures
must have the precise custom error/arguments and preserve booking/table/logs/B nonce.
No mined revert was forced to create a hash. Final holder B.
[Results](integration-results.json) and integration-runs/ preserve each run.

The first run FAILED at nested Ganache estimateGas error parsing after registering
Table 1000 and reserving it as A (blocks 28/29). That failed history remains truthful;
the parser was fixed and a new unused ID 1001 passed. No chain reset or UI booking
modification occurred. Subsequent runs choose another unused ID in 1000-1999.

## Step 05: UI demonstration and preflight proof

`npm.cmd run demo:rejections`: exit 0 around 15:25. On Table 1 / slot 498587 while
A held it, B's estimates returned SlotAlreadyBooked(1,498587) and NotBookingOwner().
Booking/logs unchanged, no tx hashes: [saved proof](demo-rejections.json).

| Actual UI write | Receipt / block | Transaction hash |
| --- | --- | --- |
| Owner registers Table 1 | 1 / 27 | 0xc10cf8b1a4ce19dfe35aa80a954406c4ea4d0b73e8963f4eee62aced336a3245 |
| A reserves slot 498587 | 1 / 34 | 0xc2e8d449b6d3d340e25a6859671c98323a49a0215310b112a2febc08ea5a2160 |
| A cancels | 1 / 35 | 0x0267b2c4ce3a5def0b5861f68a8635225100ffb8a15fedb73ec3063c66a8ed37 |
| B reserves again | 1 / 36 | 0xf0fef69e003780634a7304bb80b5f11815769613e8da4ea78ffd40a127f2cab7 |

[Read-only inspection](ui-chain-evidence.json) confirmed exact events/callers and B
as final holder. The user performed wallet actions and confirmed reload persistence,
Reject and wrong network. The agent observed A/B account/role/booking and rejection
via Edge, and saved [B booking](screenshots/06-reserved-by-b.png) and
[wallet rejection](screenshots/07-wallet-rejected.png). Owner/A chat screenshots are
not claimed as repository PNGs. No signing/key handling was automated.

## Step 06

See [reproduction record](reproduction-check.md) for the clean-copy run and its distinct
Ganache deployment. Prior results above remain evidence for the original demo instance.
