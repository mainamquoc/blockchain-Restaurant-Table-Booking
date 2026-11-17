import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { Contract, FetchRequest, JsonRpcProvider, getAddress, keccak256 } from "ethers";
import { artifacts } from "hardhat";

// Read-only, independent RPC check: never sends or redeploys a contract.
const root = new URL("../", import.meta.url);
const deployment = JSON.parse(await readFile(new URL("docs/deployment.json", root), "utf8"));
const frontend = JSON.parse(await readFile(new URL("frontend/src/generated/contract.json", root), "utf8"));
const url = new URL(deployment.rpcUrl);
assert.ok(url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
const request = new FetchRequest(url.href);
request.timeout = 5_000;
const provider = new JsonRpcProvider(request);
try {
  const chainId = BigInt(await provider.send("eth_chainId", [])).toString();
  const clientVersion: string = await provider.send("web3_clientVersion", []);
  assert.match(clientVersion, /Ganache/i);
  assert.equal(chainId, deployment.chainId);
  assert.equal(chainId, frontend.chainId);
  assert.equal(getAddress(frontend.address), getAddress(deployment.address));
  assert.equal(frontend.deploymentTransactionHash, deployment.transactionHash);
  assert.equal(frontend.deploymentBlock, deployment.blockNumber);
  const artifact = await artifacts.readArtifact("RestaurantBooking");
  assert.deepEqual(frontend.abi, artifact.abi);
  const receipt = await provider.getTransactionReceipt(deployment.transactionHash);
  assert.ok(receipt);
  assert.equal(receipt.status, 1);
  assert.equal(receipt.blockNumber, deployment.blockNumber);
  assert.equal(receipt.blockHash, deployment.blockHash);
  assert.equal(getAddress(receipt.from), getAddress(deployment.owner));
  assert.equal(getAddress(receipt.contractAddress!), getAddress(frontend.address));
  const code = await provider.getCode(frontend.address);
  assert.notEqual(code, "0x");
  assert.equal(keccak256(code), deployment.runtimeBytecodeHash);
  const contract = new Contract(frontend.address, frontend.abi, provider);
  const owner = getAddress(await contract.owner());
  assert.equal(owner, getAddress(deployment.owner));
  const tableIds = Array.from(await contract.getTableIds(), id => String(id));
  const result = { verifiedAt: new Date().toISOString(), verified: true, rpcUrl: url.href,
    chainId, address: frontend.address, owner, transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber, receiptStatus: receipt.status,
    bytecodeBytes: (code.length - 2) / 2, runtimeBytecodeHash: keccak256(code),
    abiMatchesArtifact: true, tableIds };
  await writeFile(new URL("docs/logs/03-verification.json", root), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally {
  provider.destroy();
}
