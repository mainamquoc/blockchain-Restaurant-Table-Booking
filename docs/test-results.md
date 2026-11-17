# Test results

Date: 2026-11-17, Asia/Saigon. The contract, frontend and actual Ganache/UI checks
below are separate evidence sources. No UI result is inferred from build alone.

## Automated checks

| Command at project root | Recorded result |
| --- | --- |
| npm.cmd run compile | Exit 0; solc 0.8.28, EVM paris, optimizer 200 |
| npm.cmd test | Exit 0; 24 passing contract tests on in-memory Hardhat |
| npm.cmd run test:frontend | Exit 0; 17 passing: 12 time-slot and 5 wallet-service tests |
| npm.cmd run typecheck | Exit 0 |
| npm.cmd run build | Exit 0; 155 modules |
| Frontend HTTP | HTML/JavaScript status 200 |

Contract tests cover owner/deployment state, registration permissions, invalid and
duplicate IDs/capacity, successful reserve/cancel, duplicate reservations by A/B,
unauthorized cancellation by B/owner, cancel/rebook, missing tables, invalid slots,
empty cancellation and independence across tables/slots. They check full event/error
arguments, failed receipts/no success logs, and unchanged contract state after revert.

Slot tests cover explicit UTC+07 conversion, day/month/year/leap boundaries,
invalid dates/hours without rounding, seconds versus milliseconds, ID validation
and four host timezones. Service tests use wallet stubs to check configuration,
all nine custom errors, rejection/RPC messages and account/network mismatch.
Stubs are not presented as MetaMask transactions.

The same source passed both locked installs, compile, tests, typecheck, build,
an independent Ganache deployment/integration and production HTTP in a clean
temporary copy. Original demo configuration and contract storage were preserved.
That separate contract was 0x1bA44fF4b8FcE6788c368687785595f741cBDe05,
deployed at block 37; its test transactions occupied blocks 38-41. Detailed working
transcripts are kept locally in archived/ rather than in the instructor's source tree.

## Ganache deployment and integration

Desktop 2.7.1 / engine 7.7.3, RPC http://127.0.0.1:7545, chain 1337, network ID 5777.
The [demo deployment metadata](deployment.json) records receipt status 1, block 26,
runtime code 1567 bytes and the correct owner. ABI/address/chain ID were generated
and independently verified. No table/booking was seeded during deployment.

The [RPC integration result](integration-results.json) used dedicated Table 1001,
slot 498611 (2026-11-18 18:00 UTC+07). Four successful writes at blocks 30-33:
owner registration, A reserve, A cancel, B rebook. B's duplicate reservation and
unauthorized cancellation estimates returned exact SlotAlreadyBooked and NotBookingOwner
errors before sending. Booking, table, logs and B nonce remained unchanged; no hash
exists for those rejected estimates. Success receipts/events/arguments were asserted.
Final holder B. This is RPC evidence, not a MetaMask recording.

An initial automation parser failure left Table 1000 held by A at slot 498611.
After correcting nested Ganache error parsing, the new Table 1001 run passed.
No chain reset or manipulation of the UI booking was used to hide that failed run.
The earlier detailed run history remains in the local archive.

## Real MetaMask demonstration

Contract: 0xa504b217514805a4F51fc329D980445A3B0ec0Fe; Table 1, 4 seats, slot 498587
(2026-11-17 18:00-19:00 UTC+07). [Public accounts](deployment.json) identify owner/A/B.

| User-operated UI action | Successful receipt / block |
| --- | --- |
| Owner registered Table 1 | 1 / 27 |
| A reserved | 1 / 34 |
| A cancelled | 1 / 35 |
| B reserved again | 1 / 36 |

[UI receipts and exact transaction hashes](ui-chain-evidence.json) confirm events,
callers and B as final holder. [Saved B rejection proof](demo-rejections.json) on this
same table/slot was collected while A held it: duplicate reserve and unauthorized
cancel were rejected before sending, with booking/logs unchanged and no fake hashes.
The UI intentionally hides invalid buttons rather than bypassing contract permissions.

The agent observed owner/A/B roles, booking state and the rejected-wallet message in
Edge. The user performed wallet confirmations and explicitly confirmed wrong-network
blocking and persistence after reload; those exact moments were not directly observed.
[B booking](screenshots/06-reserved-by-b.png) and [wallet rejection](screenshots/07-wallet-rejected.png)
are actual screenshots. Owner/A screenshots supplied in chat are not claimed as saved PNG files.
Mobile visual QA and DevTools console inspection were not performed. No private keys
were collected or wallet confirmations automated.
