import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { Interface } from "ethers";

let server, service;
before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom" });
  service = await server.ssrLoadModule("/src/services/blockchain.js");
});
after(async () => { await server?.close(); });
test("Configuration errors are explicit; no missing-config crash", () => {
  assert.throws(() => service.validateDeployment(null), /Missing or invalid deployment/);
  assert.equal(service.validateDeployment().chainId, "1337");
});
test("Wallet rejection, pending request and RPC failures have English messages", () => {
  assert.match(service.friendlyError({ code: 4001 }), /rejected/);
  assert.match(service.friendlyError({ code: "ACTION_REJECTED" }), /rejected/);
  assert.match(service.friendlyError({ info: { error: { code: -32002 } } }), /already pending/);
  assert.match(service.friendlyError({ code: "NETWORK_ERROR" }), /Check Ganache/);
});
test("Every custom error is decoded from Ganache nested result data", () => {
  const abi = new Interface(service.deployment.abi);
  const cases = [
    ["NotOwner", [], /Only the restaurant/], ["InvalidTableId", [], /greater than zero/],
    ["InvalidCapacity", [], /greater than zero/], ["TableAlreadyExists", [1n], /already registered/],
    ["TableNotFound", [1n], /not been registered/], ["InvalidSlotId", [], /Invalid time slot/],
    ["SlotAlreadyBooked", [1n, 498587n], /already booked/], ["BookingNotFound", [1n, 498587n], /no booking/],
    ["NotBookingOwner", [], /Only the customer/],
  ];
  for (const [name, args, expected] of cases) {
    const data = abi.encodeErrorResult(name, args);
    assert.match(service.friendlyError({ info: { error: { data: { result: data } } } }), expected);
    assert.match(service.friendlyError({ data }), expected);
  }
});
test("Wrong network blocks connection before contract access", async () => {
  const calls = [];
  const wallet = { request: async ({ method }) => { calls.push(method); return method === "eth_accounts" ? ["0x810A640B6089B12ab3bb7Bde1697752129679828"] : "0x1"; } };
  await assert.rejects(service.connectWallet(wallet), /Wrong network/);
  assert.deepEqual(calls, ["eth_accounts", "eth_chainId"]);
});
test("Changed account, changed chain and disconnected account block writes", async () => {
  const account = "0x810A640B6089B12ab3bb7Bde1697752129679828";
  for (const [accounts, chain] of [[[], "0x539"], [[account], "0x1"], [["0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7"], "0x539"]]) {
    const session = { account, chainId: "1337", wallet: { request: async ({ method }) => method === "eth_accounts" ? accounts : chain } };
    await assert.rejects(service.assertCurrentSession(session), /account or network changed/);
  }
});
