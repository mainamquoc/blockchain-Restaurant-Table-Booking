import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { Contract, FetchRequest, JsonRpcProvider, getAddress, zeroPadValue, toBeHex } from "ethers";

// Read-only proof for the UI demo: deliberately invalid estimates, never send().
const root = new URL("../", import.meta.url);
const metadata = JSON.parse(await readFile(new URL("docs/deployment.json", root), "utf8"));
const config = JSON.parse(await readFile(new URL("frontend/src/generated/contract.json", root), "utf8"));
const url = new URL(metadata.rpcUrl);
assert.ok(url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
const request = new FetchRequest(url.href); request.timeout = 5000;
const provider = new JsonRpcProvider(request);
try {
  assert.equal(BigInt(await provider.send("eth_chainId", [])).toString(), config.chainId);
  assert.notEqual(await provider.getCode(config.address), "0x");
  const contract = new Contract(config.address, config.abi, provider);
  assert.equal(getAddress(await contract.owner()), getAddress(metadata.owner));
  const tableId = 1n, slotId = 498587n;
  const customerA = getAddress(metadata.accounts[1].address), customerB = getAddress(metadata.accounts[2].address);
  assert.equal(getAddress(await contract.bookings(tableId, slotId)), customerA, "Demo requires A to hold table 1 / slot 498587; no state will be changed");
  const b = contract.connect(await provider.getSigner(customerB)) as Contract;
  const logs = () => provider.send("eth_getLogs", [{ address: config.address, fromBlock: "0x0", toBlock: "latest", topics: [null, zeroPadValue(toBeHex(tableId), 32)] }]);
  const result = { checkedAt: new Date().toISOString(), chainId: config.chainId, contractAddress: config.address,
    tableId: String(tableId), slotId: String(slotId), customerA, customerB, status: "PASS", steps: [] as unknown[] };
  for (const [method, expected, args] of [["reserve", "SlotAlreadyBooked", [tableId, slotId]], ["cancel", "NotBookingOwner", []]] as const) {
    const before = await logs();
    await assert.rejects(b.getFunction(method).estimateGas(tableId, slotId), (error: unknown) => {
      const e = error as { data?: unknown; info?: { error?: { data?: string | { result?: string } } } };
      const nested = e.info?.error?.data;
      const data = [e.data, nested, typeof nested === "object" ? nested?.result : undefined].find((x): x is string => typeof x === "string" && x.startsWith("0x"));
      assert.ok(data, "Expected ABI revert data instead of an RPC failure");
      const decoded = contract.interface.parseError(data);
      assert.equal(decoded?.name, expected); assert.deepEqual(Array.from(decoded?.args ?? []), Array.from(args));
      return true;
    });
    assert.equal(getAddress(await contract.bookings(tableId, slotId)), customerA);
    assert.deepEqual(await logs(), before);
    result.steps.push({ method, customError: expected, args: args.map(x => String(x)), status: "PASS", rejection: "before send (estimateGas)", transactionHash: null, bookingUnchanged: true, logsUnchanged: true });
  }
  await writeFile(new URL("docs/demo-rejections.json", root), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally { provider.destroy(); }
