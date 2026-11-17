import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { artifacts, network } from "hardhat";
import { formatEther, getAddress, keccak256 } from "ethers";

const root = new URL("../", import.meta.url);
const connection = await network.create("ganache");
try {
  const config = connection.networkConfig;
  assert.equal(config.type, "http");
  assert.ok("url" in config);
  const rpcUrl = await config.url.get();
  const url = new URL(rpcUrl);
  assert.ok(url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname),
    "Only local HTTP Ganache is allowed");
  const { ethers } = connection;
  const provider = ethers.provider;
  const clientVersion: string = await provider.send("web3_clientVersion", []);
  assert.match(clientVersion, /Ganache/i, "RPC must identify as Ganache");
  const chainId = BigInt(await provider.send("eth_chainId", [])).toString();
  assert.equal(chainId, String(config.chainId), "RPC chain ID must match hardhat.config.ts");
  const networkId: string = await provider.send("net_version", []);
  const addresses: string[] = (await provider.send("eth_accounts", [])).map(getAddress);
  assert.ok(addresses.length >= 3, "Need owner and two demo customers from the Ganache node");
  const roles = ["owner", "customerA", "customerB"];
  const accounts = await Promise.all(addresses.slice(0, 3).map(async (address, index) => {
    const balance = BigInt(await provider.send("eth_getBalance", [address, "latest"]));
    return { role: roles[index], address, balanceBeforeWei: balance.toString(), balanceBeforeEth: formatEther(balance) };
  }));
  assert.ok(BigInt(accounts[0].balanceBeforeWei) > 0n, "Owner needs test Ether for gas");

  const artifact = await artifacts.readArtifact("RestaurantBooking");
  const buildId = await artifacts.getBuildInfoId("contracts/RestaurantBooking.sol:RestaurantBooking");
  assert.ok(buildId);
  const buildPath = await artifacts.getBuildInfoPath(buildId);
  assert.ok(buildPath);
  const build = JSON.parse(await readFile(buildPath, "utf8"));
  // Prepare output directories before sending the deployment transaction.
  await mkdir(new URL("docs/deployments/", root), { recursive: true });
  await mkdir(new URL("frontend/src/generated/", root), { recursive: true });

  const signer = await ethers.getSigner(addresses[0]);
  console.log(JSON.stringify({ rpcUrl, clientVersion, chainId, networkId, accounts }, null, 2));
  const contract = await ethers.deployContract("RestaurantBooking", [], signer);
  const tx = contract.deploymentTransaction();
  assert.ok(tx);
  console.log(`Deployment submitted: ${tx.hash}`);
  const receipt = await tx.wait(1, 60_000);
  assert.ok(receipt, "Deployment receipt not available");
  assert.equal(receipt.status, 1);
  const address = getAddress(await contract.getAddress());
  assert.equal(getAddress(receipt.contractAddress!), address);
  const bytecode = await provider.getCode(address);
  assert.notEqual(bytecode, "0x", "No bytecode at deployed address");
  const owner = getAddress(await contract.owner());
  assert.equal(owner, addresses[0]);
  assert.deepEqual(Array.from(await contract.getTableIds()), [], "Deployment must not seed tables");
  const balanceAfterWei = BigInt(await provider.send("eth_getBalance", [owner, "latest"]));
  const deployment = {
    contractName: "RestaurantBooking", deployedAt: new Date().toISOString(),
    rpcUrl, chainId, networkId, clientVersion, address, owner, accounts,
    transactionHash: tx.hash, blockNumber: receipt.blockNumber, blockHash: receipt.blockHash,
    receiptStatus: receipt.status, gasUsed: receipt.gasUsed.toString(),
    feeWei: receipt.fee.toString(), ownerBalanceAfterWei: balanceAfterWei.toString(),
    ownerBalanceAfterEth: formatEther(balanceAfterWei),
    compiler: { version: build.solcVersion, longVersion: build.solcLongVersion,
      evmVersion: build.input.settings.evmVersion, optimizer: build.input.settings.optimizer },
    buildInfoId: buildId, runtimeBytecodeHash: keccak256(bytecode),
    initialTableIds: [], seeded: false,
  };
  const frontend = {
    contractName: "RestaurantBooking", abi: artifact.abi, address, chainId,
    deploymentTransactionHash: tx.hash, deploymentBlock: receipt.blockNumber,
  };
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  // Keep every deployment, then replace each current file via a temporary file.
  const history = new URL(`docs/deployments/${chainId}-${tx.hash}.json`, root);
  await writeFile(history, json(deployment), { flag: "wx" });
  for (const [path, data] of [
    ["docs/deployment.json", deployment],
    ["frontend/src/generated/contract.json", frontend],
  ] as const) {
    const target = new URL(path, root);
    await writeFile(new URL(path + ".tmp", root), json(data));
    await rename(new URL(path + ".tmp", root), target);
  }
  console.log(JSON.stringify({ verified: true, address, owner, chainId, transactionHash: tx.hash,
    blockNumber: receipt.blockNumber, metadata: fileURLToPath(new URL("docs/deployment.json", root)),
    history: fileURLToPath(history), seeded: false }, null, 2));
} finally {
  await connection.close();
}
