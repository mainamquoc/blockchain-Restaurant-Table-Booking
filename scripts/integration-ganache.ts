import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Contract, FetchRequest, JsonRpcProvider, ZeroAddress, getAddress, keccak256, toBeHex, zeroPadValue, type ContractTransactionResponse } from "ethers";
import { artifacts } from "hardhat";

const root = new URL("../", import.meta.url);
const metadata = JSON.parse(await readFile(new URL("docs/deployment.json", root), "utf8"));
const config = JSON.parse(await readFile(new URL("frontend/src/generated/contract.json", root), "utf8"));
const url = new URL(metadata.rpcUrl);
assert.ok(url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
const request = new FetchRequest(url.href); request.timeout = 5000;
const provider = new JsonRpcProvider(request);
const result: Record<string, any> = { startedAt: new Date().toISOString(), environment: "Ganache RPC (not MetaMask)", status: "IN_PROGRESS", rpcUrl: url.href, steps: [] };
let history: URL | undefined;
async function save() {
  const text = JSON.stringify(result, null, 2) + "\n";
  await writeFile(new URL("docs/integration-results.json", root), text);
  if (history) await writeFile(history, text);
}
try {
  const chainId = BigInt(await provider.send("eth_chainId", [])).toString();
  const clientVersion = await provider.send("web3_clientVersion", []);
  assert.match(clientVersion, /Ganache/i);
  assert.equal(chainId, metadata.chainId); assert.equal(chainId, config.chainId);
  assert.equal(getAddress(config.address), getAddress(metadata.address));
  const artifact = await artifacts.readArtifact("RestaurantBooking");
  assert.deepEqual(config.abi, artifact.abi);
  const code = await provider.getCode(config.address);
  assert.notEqual(code, "0x"); assert.equal(keccak256(code), metadata.runtimeBytecodeHash);
  const contract = new Contract(config.address, config.abi, provider);
  const accounts: string[] = (await provider.send("eth_accounts", [])).map(getAddress);
  const expected = metadata.accounts.slice(0, 3).map((a: any) => getAddress(a.address));
  assert.deepEqual(accounts.slice(0, 3), expected, "Ganache accounts changed; use the saved workspace");
  assert.equal(getAddress(await contract.owner()), accounts[0]);
  const signers = await Promise.all(accounts.slice(0, 3).map(address => provider.getSigner(address)));
  const [owner, a, b] = signers.map(signer => contract.connect(signer) as Contract);
  const balances = await Promise.all(accounts.slice(0, 3).map(address => provider.send("eth_getBalance", [address, "latest"])));
  assert.ok(balances.every(balance => BigInt(balance) > 0n));
  // Dedicated test IDs: never modify table 1 or any pre-existing booking.
  let tableId = 1000n;
  while ((await contract.tables(tableId)).exists) {
    tableId++;
    assert.ok(tableId < 2000n, "No unused integration table ID available in range 1000–1999");
  }
  const slotId = 498611n; // 2026-11-18 18:00 UTC+07:00
  Object.assign(result, { chainId, clientVersion, contractAddress: config.address,
    accounts: { owner: accounts[0], customerA: accounts[1], customerB: accounts[2] },
    balancesBeforeWei: balances.map(balance => BigInt(balance).toString()), tableId: tableId.toString(), slotId: slotId.toString(), slot: "2026-11-18 18:00–19:00 UTC+07:00" });
  await mkdir(new URL("docs/integration-runs/", root), { recursive: true });
  history = new URL(`docs/integration-runs/${chainId}-table-${tableId}-${Date.now()}.json`, root);
  await save();

  async function write(label: string, transaction: Promise<ContractTransactionResponse>, event: string, args: unknown[]) {
    const tx = await transaction;
    const entry: Record<string, any> = { label, type: "transaction", transactionHash: tx.hash, status: "PENDING" };
    result.steps.push(entry); await save();
    const receipt = await tx.wait(1, 60_000);
    assert.ok(receipt); assert.equal(receipt.status, 1); assert.equal(receipt.logs.length, 1);
    const parsed = contract.interface.parseLog(receipt.logs[0]);
    assert.ok(parsed); assert.equal(parsed.name, event); assert.deepEqual(Array.from(parsed.args), args);
    Object.assign(entry, { status: "PASS", blockNumber: receipt.blockNumber, receiptStatus: receipt.status,
      gasUsed: receipt.gasUsed.toString(), feeWei: receipt.fee.toString(),
      event: { name: parsed.name, args: Array.from(parsed.args, value => String(value)) } });
    await save(); console.log(`${label}: PASS ${tx.hash}`);
  }
  async function snapshot() {
    return {
      customer: await contract.bookings(tableId, slotId),
      table: Array.from(await contract.tables(tableId), value => String(value)),
      // All three event types index tableId at topic position 1.
      logs: await provider.send("eth_getLogs", [{ address: config.address, fromBlock: "0x0", toBlock: "latest", topics: [null, zeroPadValue(toBeHex(tableId), 32)] }]),
      nonceB: await provider.send("eth_getTransactionCount", [accounts[2], "pending"]),
    };
  }
  async function rejection(label: string, method: "reserve" | "cancel", expectedError: string, expectedArgs: unknown[]) {
    const prior = await snapshot();
    await assert.rejects(b.getFunction(method).estimateGas(tableId, slotId), (error: unknown) => {
      assert.ok(typeof error === "object" && error !== null, "Expected ABI revert data, not an RPC/configuration failure");
      const rpcError = error as { data?: unknown; info?: { error?: { data?: { result?: string } | string } } };
      const nested = rpcError.info?.error?.data;
      const data = [rpcError.data, nested, typeof nested === "object" ? nested?.result : undefined]
        .find((candidate): candidate is string => typeof candidate === "string" && candidate.startsWith("0x"));
      assert.ok(data, "Expected hex revert data from Ganache estimateGas");
      const decoded = contract.interface.parseError(data);
      assert.equal(decoded?.name, expectedError);
      assert.deepEqual(Array.from(decoded?.args ?? []), expectedArgs);
      return true;
    });
    assert.deepEqual(await snapshot(), prior, "Rejected preflight must not change booking, table, logs or B nonce");
    result.steps.push({ label, type: "estimateGas", status: "PASS", rejection: "before send", transactionHash: null,
      error: { name: expectedError, args: expectedArgs.map(value => String(value)) }, customerAfter: prior.customer, stateAndLogsUnchanged: true });
    await save(); console.log(`${label}: PASS (${expectedError}, rejected before send; no transaction hash)`);
  }

  await write("Owner registers dedicated integration table", owner.registerTable(tableId, 4n), "TableRegistered", [tableId, 4n]);
  assert.deepEqual(Array.from(await contract.tables(tableId)), [true, 4n]);
  assert.ok((await contract.getTableIds()).includes(tableId));
  assert.equal(await contract.bookings(tableId, slotId), ZeroAddress);
  await write("A reserves", a.reserve(tableId, slotId), "TableReserved", [tableId, slotId, accounts[1]]);
  assert.equal(getAddress(await contract.bookings(tableId, slotId)), accounts[1]);
  await rejection("B duplicate reservation rejected", "reserve", "SlotAlreadyBooked", [tableId, slotId]);
  await rejection("B unauthorized cancellation rejected", "cancel", "NotBookingOwner", []);
  await write("A cancels", a.cancel(tableId, slotId), "BookingCancelled", [tableId, slotId, accounts[1]]);
  assert.equal(await contract.bookings(tableId, slotId), ZeroAddress);
  await write("B reserves the released slot", b.reserve(tableId, slotId), "TableReserved", [tableId, slotId, accounts[2]]);
  assert.equal(getAddress(await contract.bookings(tableId, slotId)), accounts[2]);
  result.finalCustomer = accounts[2]; result.status = "PASS"; result.finishedAt = new Date().toISOString();
  await save(); console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.status = "FAILED"; result.finishedAt = new Date().toISOString();
  result.error = error instanceof Error ? error.message : String(error);
  await save(); throw error;
} finally { provider.destroy(); }
