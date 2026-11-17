# Individual explanation and study notes

Mai Nam Quốc - 29211145181 - individual DS 441 A project.
These notes are prompts for understanding, not a claim of unaided authorship or a
script to recite without understanding. Codex/ChatGPT assistance is disclosed in README.

## What the contract stores

`tables[id]` contains existence/capacity. `tableIds` lets the UI enumerate a mapping,
which has no built-in list of keys. `bookings[tableId][slotId]` stores one address:
zero means empty, a customer address means reserved. Table capacity is display-only.

## Identity, owner and permissions

`msg.sender` is the immediate caller. Owner is set to the deployer's address in the
constructor and is immutable. Only owner registers tables, but every address can
reserve. reserve never accepts an arbitrary customer address from a form.
cancel compares msg.sender with the current mapping entry: even owner cannot cancel
another customer's booking. tx.origin is not used.

Question: after A cancels and B reserves, why can A no longer cancel? The mapping now
contains B, so msg.sender=A fails the same check without needing a separate role list.

## Time slots

slotId is an hour index, start Unix seconds / 3600, for an exact whole-hour start.
The interval is [slotId*3600, (slotId+1)*3600), so adjacent slots do not overlap.
2026-11-17 18:00 UTC+07 is 498587; the next hour is 498588.
The UI explicitly converts UTC+07; the contract compares positive integers.
It does not restrict past hours, opening hours or multi-hour reservations.

## RPC, chain ID, address and ABI

RPC is the node endpoint, here http://127.0.0.1:7545. Chain ID identifies the network
used for wallet transactions; ours is 1337. Ganache network ID 5777 is a different
RPC field. A wallet's human-readable network label is not proof of either setting.
The contract address identifies this deployed instance on this chain. ABI describes
its functions/events/errors for ethers to encode and decode. An address from a reset
chain or ABI for a different contract will not work. Deploy regenerates one config
file automatically so ABI/address/chain ID stay together. Never paste an example address.

## Calls, estimates, transactions and receipts

A read call queries state without a mined write or user signature. estimateGas
simulates a write and can reject it before sending: no transaction hash exists.
A signed write is mined and has a receipt. The UI waits for receipt status 1 and
refreshes state before reporting success. A user Reject is not a successful transaction.
Mined reverts can consume gas even though their contract writes/logs are rolled back.
There is no booking payment: only test gas for mined writes.

## Events and revert

TableRegistered, TableReserved and BookingCancelled describe successful changes.
The current mapping is authoritative; events are historical evidence, not a substitute
for reading the current booking after many cancellations/rebookings.
A custom error identifies a specific failed rule. Revert undoes writes and logs of
that transaction. Earlier events remain, explaining the booking history.

## Cancellation and persistence

delete bookings[tableId][slotId] restores address zero. It does not delete the table,
remove old events or erase other slots. B can then reserve. Reloading the browser
does not clear the chain; the UI reads the same mapping. Resetting Ganache may clear
it, so persistence depends on preserving the local workspace.

## Why a Python Storage example is not this application

A Storage example demonstrates writing/reading a single value through RPC. It does
not implement registered tables, two-level slot bookings, address permissions,
booking events, duplicate protection or the MetaMask UI. This project deploys its
own RestaurantBooking contract and exports its own ABI/address, not Storage metadata.

## Explain the evidence honestly

24 Hardhat tests verify logic on a simulated network; 17 frontend tests verify slots
and service behavior with stubs; real Ganache RPC integration verifies receipts and
preflight rejections; MetaMask screenshots/user confirmations verify actual UI use.
These are different kinds of evidence. Wrong-network/reload were user-confirmed;
the agent observed booking/rejection states and independently read actual receipts.
Mobile visual QA/DevTools console inspection were not performed. See test-results.md.
