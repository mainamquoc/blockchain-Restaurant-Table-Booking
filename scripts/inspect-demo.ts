import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { Contract, FetchRequest, JsonRpcProvider, getAddress } from "ethers";

// Read-only evidence for user-operated UI transactions; no signing and no state changes.
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
  const logs = await contract.queryFilter("*", config.deploymentBlock, "latest");
  const events = [];
  for (const log of logs) {
    const parsed = contract.interface.parseLog(log);
    if (!parsed || parsed.args[0] !== 1n) continue;
    const receipt = await provider.getTransactionReceipt(log.transactionHash);
    assert.ok(receipt); assert.equal(receipt.status, 1);
    events.push({ event: parsed.name, args: Array.from(parsed.args, value => String(value)),
      transactionHash: log.transactionHash, blockNumber: log.blockNumber, from: receipt.from,
      receiptStatus: receipt.status, gasUsed: receipt.gasUsed.toString() });
  }
  const result = { inspectedAt: new Date().toISOString(), source: "Read-only RPC; UI source requires screenshot/user confirmation",
    chainId: config.chainId, contractAddress: config.address, tableId: "1", table: Array.from(await contract.tables(1n), value => String(value)),
    bookings: await Promise.all([498587n, 498611n].map(async slot => ({ slotId: slot.toString(), customer: await contract.bookings(1n, slot) }))), events };
  await writeFile(new URL("docs/ui-chain-evidence.json", root), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally { provider.destroy(); }
