import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { toSlotId, fromSlotId, slotLabel, vietnamToday } from "../src/utils/slots.js";

test("T17: timestamp seconds rather than milliseconds, explicit UTC+07", () => {
  const slot = toSlotId("2026-11-18", "18");
  assert.equal(slot, 498611n);
  assert.equal(slot * 3600n, BigInt(Date.parse("2026-11-18T18:00:00+07:00") / 1000));
  assert.deepEqual(fromSlotId(slot), { date: "2026-11-18", hour: 18 });
});
for (const [date, hour, nextDate, nextHour] of [
  ["2026-11-18", "00", "2026-11-18", 1],
  ["2026-11-18", "23", "2026-11-19", 0],
  ["2026-01-31", "23", "2026-02-01", 0],
  ["2026-12-31", "23", "2027-01-01", 0],
  ["2028-02-28", "23", "2028-02-29", 0],
  ["2028-02-29", "23", "2028-03-01", 0],
]) {
  test(`T17: round trip and next hour at ${date} ${hour}`, () => {
    const id = toSlotId(date, hour);
    assert.deepEqual(fromSlotId(id), { date, hour: Number(hour) });
    assert.deepEqual(fromSlotId(id + 1n), { date: nextDate, hour: nextHour });
    assert.equal(toSlotId(nextDate, nextHour), id + 1n);
  });
}
test("T17: rejects malformed dates, rollover, non-leap day and nonpositive slots", () => {
  for (const date of ["", "2026-2-01", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "0000-01-01", "1969-12-31"]) assert.throws(() => toSlotId(date, "18"));
});
test("T17: rejects fractional, minute, signed or out-of-range hours without rounding", () => {
  for (const hour of ["18:30", "18:00", "18.5", "24", "-1", "", "1e1", " 18", "+18"]) assert.throws(() => toSlotId("2026-11-18", hour));
});
test("T17: rejects zero, fractional or overflowing slot IDs", () => {
  for (const id of [0, -1, "1.5", "abc", "9999999999999999999999999"]) assert.throws(() => fromSlotId(id));
});
test("T17: Vietnam date across UTC midnight and next-day label", () => {
  assert.equal(vietnamToday(new Date("2026-12-31T18:00:00Z")), "2027-01-01");
  assert.match(slotLabel(toSlotId("2026-12-31", 23)), /23:00–00:00 \(next day\)/);
});
test("T17: calculations independent of host timezone", () => {
  const moduleUrl = new URL("../src/utils/slots.js", import.meta.url).href;
  const code = `import {toSlotId,fromSlotId} from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify([toSlotId('2026-11-18',18).toString(),fromSlotId(498611n)]));`;
  const outputs = ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Asia/Ho_Chi_Minh"].map(TZ => execFileSync(process.execPath, ["--input-type=module", "-e", code], { env: { ...process.env, TZ }, encoding: "utf8" }).trim());
  assert.ok(outputs.every(value => value === outputs[0]));
});
