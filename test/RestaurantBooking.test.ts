import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { network } from "hardhat";
import { isError, ZeroAddress, type Contract, type ContractTransactionResponse } from "ethers";

const SLOT = 498611n; // 18/11/2026 18:00 UTC+07:00, start seconds / 3600

describe("RestaurantBooking", () => {
  let connection: Awaited<ReturnType<typeof network.create>>;
  let booking: Contract;
  let owner: string;
  let customerA: string;
  let customerB: string;
  let a: Contract;
  let b: Contract;

  before(async () => {
    // Explicit simulated network: never use the Ganache configuration for these tests.
    connection = await network.create("hardhatTest");
  });
  after(async () => { await connection?.close(); });

  beforeEach(async () => {
    const signers = await connection.ethers.getSigners();
    [owner, customerA, customerB] = await Promise.all(signers.slice(0, 3).map(s => s.getAddress()));
    booking = await connection.ethers.deployContract("RestaurantBooking", [], signers[0]);
    await booking.waitForDeployment();
    a = booking.connect(signers[1]) as Contract;
    b = booking.connect(signers[2]) as Contract;
  });

  async function succeeds(tx: Promise<ContractTransactionResponse>, event: string, args: unknown[]) {
    const receipt = await (await tx).wait();
    assert.ok(receipt);
    assert.equal(receipt.status, 1);
    assert.equal(receipt.logs.length, 1);
    const parsed = booking.interface.parseLog(receipt.logs[0]);
    assert.ok(parsed);
    assert.equal(parsed.name, event);
    assert.deepEqual(Array.from(parsed.args), args);
  }

  async function register(tableId = 1n, capacity = 4n) {
    await succeeds(booking.registerTable(tableId, capacity), "TableRegistered", [tableId, capacity]);
  }

  async function reserve(caller = a, tableId = 1n, slotId = SLOT, customer = customerA) {
    await succeeds(caller.reserve(tableId, slotId), "TableReserved", [tableId, slotId, customer]);
    assert.equal(await booking.bookings(tableId, slotId), customer);
  }

  async function snapshot() {
    const ids = [0n, 1n, 2n, 99n];
    return {
      owner: await booking.owner(),
      ids: Array.from(await booking.getTableIds()),
      tables: await Promise.all(ids.map(async id => Array.from(await booking.tables(id)))),
      bookings: await Promise.all(ids.flatMap(id => [0n, 1n, SLOT, SLOT + 1n].map(slot => booking.bookings(id, slot)))),
      // Raw RPC avoids provider block-number caching when checking newly mined reverts.
      logs: await connection.ethers.provider.send("eth_getLogs", [{
        address: await booking.getAddress(), fromBlock: "0x0", toBlock: "latest",
      }]),
    };
  }

  async function rejects(caller: Contract, method: string, args: bigint[], error: string, errorArgs: unknown[] = []) {
    const prior = await snapshot();
    // Decode the exact custom error and arguments, independently of send-time wrappers.
    await assert.rejects(caller.getFunction(method).staticCall(...args), (e: unknown) => {
      assert.ok(typeof e === "object" && e !== null && "data" in e, String(e));
      assert.equal(typeof e.data, "string");
      assert.ok(typeof e.data === "string");
      const decoded = booking.interface.parseError(e.data);
      assert.equal(decoded?.name, error);
      assert.deepEqual(Array.from(decoded?.args ?? []), errorArgs);
      return true;
    });
    // Explicit gas bypasses estimation: exercise a real rejected write on the simulated EVM.
    await assert.rejects(async () => {
      const tx = await caller.getFunction(method).send(...args, { gasLimit: 300_000 });
      await tx.wait();
    }, (e: unknown) => {
      assert.ok(isError(e, "CALL_EXCEPTION"));
      assert.equal(e.receipt?.status, 0, "Rejected write must be mined with a failed receipt");
      assert.equal(e.receipt.logs.length, 0, "Reverted transaction must have no success events");
      return true;
    });
    assert.deepEqual(await snapshot(), prior, "Revert must preserve all sampled state and event history");
  }

  it("T01: deployer is owner; initial tables and bookings are empty", async () => {
    assert.equal(await booking.owner(), owner);
    assert.deepEqual(Array.from(await booking.getTableIds()), []);
    assert.deepEqual(Array.from(await booking.tables(1n)), [false, 0n]);
    assert.equal(await booking.bookings(1n, SLOT), ZeroAddress);
  });

  it("T02: owner registers tables, preserves insertion order, emits full event", async () => {
    await register(2n, 6n);
    await register();
    assert.deepEqual(Array.from(await booking.tables(1n)), [true, 4n]);
    assert.deepEqual(Array.from(await booking.tables(2n)), [true, 6n]);
    assert.deepEqual(Array.from(await booking.getTableIds()), [2n, 1n]);
  });

  for (const who of ["A", "B"]) {
    it(`T03: customer ${who} cannot register tables`, async () => {
      await register();
      await rejects(who === "A" ? a : b, "registerTable", [2n, 6n], "NotOwner");
    });
  }

  it("T04: duplicate table ID cannot overwrite capacity or append ID", async () => {
    await register();
    await rejects(booking, "registerTable", [1n, 8n], "TableAlreadyExists", [1n]);
  });
  it("T05a: table ID zero is invalid", async () => {
    await rejects(booking, "registerTable", [0n, 4n], "InvalidTableId");
  });
  it("T05b: capacity zero is invalid", async () => {
    await rejects(booking, "registerTable", [1n, 0n], "InvalidCapacity");
  });
  it("T06: A reserves an empty slot and event identifies the actual caller", async () => {
    await register();
    await reserve();
  });
  it("T07: B cannot reserve A's slot", async () => {
    await register(); await reserve();
    await rejects(b, "reserve", [1n, SLOT], "SlotAlreadyBooked", [1n, SLOT]);
  });
  it("T08: A cannot reserve their own occupied slot twice", async () => {
    await register(); await reserve();
    await rejects(a, "reserve", [1n, SLOT], "SlotAlreadyBooked", [1n, SLOT]);
  });
  it("T09: B cannot cancel A's booking", async () => {
    await register(); await reserve();
    await rejects(b, "cancel", [1n, SLOT], "NotBookingOwner");
  });
  it("T10: owner cannot cancel A's booking", async () => {
    await register(); await reserve();
    await rejects(booking, "cancel", [1n, SLOT], "NotBookingOwner");
  });
  it("T11: A cancels their booking, clears address and emits event", async () => {
    await register(); await reserve();
    await succeeds(a.cancel(1n, SLOT), "BookingCancelled", [1n, SLOT, customerA]);
    assert.equal(await booking.bookings(1n, SLOT), ZeroAddress);
    assert.deepEqual(Array.from(await booking.tables(1n)), [true, 4n]);
  });
  it("T12: A reserves, duplicate and wrong cancellation fail, A cancels, B rebooks and cancels", async () => {
    await register(); await reserve();
    await rejects(b, "reserve", [1n, SLOT], "SlotAlreadyBooked", [1n, SLOT]);
    await rejects(b, "cancel", [1n, SLOT], "NotBookingOwner");
    await succeeds(a.cancel(1n, SLOT), "BookingCancelled", [1n, SLOT, customerA]);
    await reserve(b, 1n, SLOT, customerB);
    await rejects(a, "cancel", [1n, SLOT], "NotBookingOwner");
    await succeeds(b.cancel(1n, SLOT), "BookingCancelled", [1n, SLOT, customerB]);
    assert.equal(await booking.bookings(1n, SLOT), ZeroAddress);
  });

  for (const method of ["reserve", "cancel"]) {
    for (const id of [0n, 99n]) {
      it(`T13: ${method} rejects missing table ${id}`, async () => {
        await register(); await reserve();
        await rejects(b, method, [id, SLOT], "TableNotFound", [id]);
      });
    }
    it(`T13: ${method} rejects slot zero on an existing table`, async () => {
      await register(); await reserve();
      await rejects(a, method, [1n, 0n], "InvalidSlotId");
    });
  }
  it("T14: cannot cancel an empty booking", async () => {
    await register();
    await rejects(a, "cancel", [1n, SLOT], "BookingNotFound", [1n, SLOT]);
  });
  it("T15: same table, two slots remain independent through cancellation", async () => {
    await register(); await reserve();
    await reserve(b, 1n, SLOT + 1n, customerB);
    await succeeds(a.cancel(1n, SLOT), "BookingCancelled", [1n, SLOT, customerA]);
    assert.equal(await booking.bookings(1n, SLOT), ZeroAddress);
    assert.equal(await booking.bookings(1n, SLOT + 1n), customerB);
  });
  it("T16: same slot, two tables remain independent through cancellation", async () => {
    await register(); await register(2n, 6n); await reserve();
    await reserve(b, 2n, SLOT, customerB);
    await succeeds(a.cancel(1n, SLOT), "BookingCancelled", [1n, SLOT, customerA]);
    assert.equal(await booking.bookings(1n, SLOT), ZeroAddress);
    assert.equal(await booking.bookings(2n, SLOT), customerB);
  });
  it("Positive past slots remain valid; owner may reserve and cancel their own booking", async () => {
    await register();
    await reserve(booking, 1n, 1n, owner);
    await succeeds(booking.cancel(1n, 1n), "BookingCancelled", [1n, 1n, owner]);
    assert.equal(await booking.bookings(1n, 1n), ZeroAddress);
  });
});
