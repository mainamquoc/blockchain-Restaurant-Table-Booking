import "./style.css";
import { deployment, validateDeployment, injectedWallet, connectWallet, assertCurrentSession, readTables, friendlyError, ZeroAddress } from "./services/blockchain.js";
import { toSlotId, slotLabel, vietnamToday } from "./utils/slots.js";

document.querySelector("#app").innerHTML = `
  <header class="topbar"><a class="brand" href="/">TABLE<span> / </span>Restaurant booking</a><span class="local-badge">GANACHE · LOCAL</span></header>
  <section class="intro"><p class="eyebrow">A SEAT FOR YOUR NEXT GET-TOGETHER</p><h1>Pick a time. Pick a table.<br><em>See you at the restaurant.</em></h1><p>Reserve a table for one hour. Your booking lives on the blockchain and belongs to your wallet.</p></section>
  <div class="workspace">
    <aside class="panel wallet-panel"><div class="section-heading"><span class="step">01</span><h2>Wallet & connection</h2></div>
      <p class="muted">Connect MetaMask to Ganache to browse and reserve tables.</p><button id="connect" class="primary">Connect MetaMask</button>
      <dl><dt>Selected account</dt><dd id="account">Not connected</dd><dt>Role</dt><dd id="role">—</dd><dt>Required chain ID</dt><dd id="network">—</dd><dt>Contract</dt><dd id="contract-address">No deployment config</dd></dl>
      <p id="connection-hint" class="hint" role="status"></p><p class="small muted">Use Ganache accounts and test ETH only. Confirm each transaction in your wallet.</p>
    </aside>
    <section class="booking-area">
      <section class="panel"><div class="section-heading"><span class="step">02</span><h2>Choose a time</h2></div>
        <div class="slot-fields"><label>Date<input id="date" type="date" required></label><label>Start time<select id="hour"></select></label><button id="refresh" class="secondary">Refresh tables</button></div>
        <p id="slot-label" class="slot-label"></p><p class="small muted">Slot ID: <span id="slot-id">—</span> · Vietnam time · Test gas only.</p>
      </section>
      <section class="panel tables-panel"><div class="section-heading"><span class="step">03</span><h2>Restaurant tables</h2><span id="table-count" class="count">—</span></div><div id="tables" aria-live="polite"></div></section>
      <section id="owner-panel" class="panel" hidden><div class="section-heading"><span class="step">+</span><h2>Restaurant management</h2></div>
        <form id="register-form"><div class="slot-fields"><label>Table ID<input id="table-id" type="text" inputmode="numeric" pattern="[0-9]+" required placeholder="e.g. 1"></label><label>Seats<input id="capacity" type="text" inputmode="numeric" pattern="[0-9]+" required placeholder="e.g. 4"></label><button type="submit" id="register" class="primary">Register table</button></div></form>
      </section>
    </section>
  </div>
  <section class="panel transaction-panel" aria-live="polite"><div class="section-heading"><span class="status-dot"></span><h2>Transaction status</h2></div><p id="status">Ready. No wallet connection or signature requested.</p><p id="tx-hash" class="hash" hidden></p></section>
  <footer>One restaurant · One-hour slots · One booking per table and slot <span>DS 441 A / Restaurant Table Booking</span></footer>
`;

const $ = id => document.getElementById(id);
const wallet = injectedWallet();
let session = null, epoch = 0, readVersion = 0, pending = false, connecting = false, rows = [], slot = null, loading = false;
function status(message, kind = "idle", hash = "") {
  $("status").textContent = message; $("status").parentElement.dataset.kind = kind;
  $("tx-hash").hidden = !hash; $("tx-hash").textContent = hash ? `Transaction hash: ${hash}` : "";
}
function dispose() { session?.provider.destroy(); session = null; }
function render() {
  $("account").textContent = session?.account ?? "Not connected";
  $("role").textContent = session ? (session.isOwner ? "Restaurant / owner" : "Customer") : "—";
  $("network").textContent = session ? `${session.chainId} · verified` : (deployment?.chainId ?? "—");
  $("owner-panel").hidden = !session?.isOwner;
  $("connect").disabled = connecting || pending || !wallet;
  $("connect").textContent = connecting ? "Connecting…" : session ? "Check wallet" : "Connect MetaMask";
  $("refresh").disabled = !session || connecting || pending || !slot;
  $("register").disabled = !session?.isOwner || pending;
  $("table-count").textContent = session && !loading ? `${rows.length} ${rows.length === 1 ? "table" : "tables"}` : "—";
  $("tables").replaceChildren();
  if (!session || loading || !slot || rows.length === 0) {
    const empty = document.createElement("p"); empty.className = "empty";
    empty.textContent = !session ? "Connect your wallet to the correct network to load tables." : loading ? "Reading tables from the blockchain…" : !slot ? "Choose a valid date and time to view tables." : "No tables registered yet. Connect the owner wallet to add the first table.";
    $("tables").append(empty); return;
  }
  for (const row of rows) {
    const card = document.createElement("article"); card.className = "table-card";
    const mine = row.customer.toLowerCase() === session.account.toLowerCase(), free = row.customer === ZeroAddress;
    const info = document.createElement("div"), title = document.createElement("h3"), capacity = document.createElement("p"), badge = document.createElement("span");
    title.textContent = `Table ${row.id}`; capacity.textContent = `${row.capacity} seats`; capacity.className = "muted small";
    badge.className = `availability ${free ? "free" : "occupied"}`; badge.textContent = free ? "Available" : mine ? "Your booking" : "Reserved";
    info.append(title, capacity, badge);
    if (!free) { const address = document.createElement("p"); address.className = "small hash muted"; address.textContent = `Booked by: ${row.customer}`; info.append(address); }
    card.append(info);
    if (free || mine) {
      const button = document.createElement("button"); button.className = free ? "primary" : "secondary";
      button.textContent = free ? "Reserve table" : "Cancel booking"; button.disabled = pending || loading;
      button.addEventListener("click", () => transact(free ? "reserve" : "cancel", [BigInt(row.id), slot])); card.append(button);
    }
    $("tables").append(card);
  }
}
async function loadTables() {
  const current = session, currentEpoch = epoch, request = ++readVersion;
  if (!current || !slot) { rows = []; loading = false; render(); return false; }
  const selectedSlot = slot; loading = true; rows = []; render();
  try {
    const result = await readTables(current, selectedSlot);
    if (currentEpoch !== epoch || request !== readVersion) return false;
    rows = result; loading = false; render(); return true;
  } catch (error) {
    if (currentEpoch === epoch && request === readVersion) { loading = false; rows = []; render(); status(`Unable to load tables. ${friendlyError(error)}`, "error"); throw error; }
    return false;
  }
}
async function connect(requestAccess = false) {
  const currentEpoch = ++epoch;
  ++readVersion; dispose(); rows = []; loading = false; connecting = true; render();
  try {
    const next = await connectWallet(wallet, requestAccess);
    if (currentEpoch !== epoch) { next.provider.destroy(); return; }
    session = next; $("connection-hint").textContent = "Correct network · contract code and owner verified."; connecting = false;
    const loaded = await loadTables();
    if (loaded && currentEpoch === epoch && !pending) status("Wallet connected. Tables loaded from the blockchain.");
  } catch (error) {
    if (currentEpoch !== epoch) return;
    dispose(); rows = []; $("connection-hint").textContent = friendlyError(error); status(friendlyError(error), "error");
  } finally { if (currentEpoch === epoch) { connecting = false; render(); } }
}
async function transact(method, args) {
  if (!session || pending) return;
  const current = session, currentEpoch = epoch; let hash = "";
  pending = true; render();
  try {
    await assertCurrentSession(current);
    if (currentEpoch !== epoch) throw new Error("Your account or network changed. Please try again.");
    status("Waiting for your confirmation in MetaMask…", "pending");
    const tx = await current.contract.getFunction(method)(...args); hash = tx.hash;
    if (currentEpoch === epoch) status("Transaction submitted. Waiting for confirmation…", "pending", hash);
    const receipt = await tx.wait(1, 120_000);
    if (!receipt || receipt.status !== 1) throw new Error("No successful transaction receipt was received.");
    if (currentEpoch !== epoch) return;
    const loaded = await loadTables();
    if (currentEpoch === epoch && loaded) status("Transaction confirmed. Blockchain data refreshed.", "success", hash);
  } catch (error) { if (currentEpoch === epoch) status(friendlyError(error), "error", hash); }
  finally { pending = false; render(); }
}
function updateSlot() {
  ++readVersion;
  try { slot = toSlotId($("date").value, $("hour").value); $("slot-label").textContent = slotLabel(slot); $("slot-id").textContent = slot.toString(); }
  catch (error) { slot = null; rows = []; loading = false; $("slot-label").textContent = error.message; $("slot-id").textContent = "—"; }
  render(); if (session) loadTables().catch(() => {});
}
$("date").value = vietnamToday();
for (let hour = 0; hour < 24; hour++) { const option = document.createElement("option"); option.value = String(hour); option.textContent = `${String(hour).padStart(2, "0")}:00`; option.selected = hour === 18; $("hour").append(option); }
$("connect").addEventListener("click", () => connect(true));
$("refresh").addEventListener("click", () => loadTables().catch(() => {}));
$("date").addEventListener("change", updateSlot); $("hour").addEventListener("change", updateSlot);
$("register-form").addEventListener("submit", event => {
  event.preventDefault(); if (!session?.isOwner) return;
  const values = [$("table-id").value.trim(), $("capacity").value.trim()];
  if (values.some(v => !/^\d+$/.test(v) || BigInt(v) <= 0n || BigInt(v) >= 2n ** 256n)) { status("Table ID and seats must be positive whole numbers within the uint256 range.", "error"); return; }
  transact("registerTable", values.map(BigInt));
});
const onWalletChange = () => { status("Account or network changed. Checking the connection…"); connect(false); };
const onDisconnect = () => { ++epoch; ++readVersion; dispose(); rows = []; loading = false; connecting = false; $("connection-hint").textContent = "Wallet disconnected. Check your network and reconnect."; status("Wallet disconnected.", "error"); render(); };
wallet?.on?.("accountsChanged", onWalletChange); wallet?.on?.("chainChanged", onWalletChange); wallet?.on?.("disconnect", onDisconnect);
window.addEventListener("pagehide", () => { wallet?.removeListener?.("accountsChanged", onWalletChange); wallet?.removeListener?.("chainChanged", onWalletChange); wallet?.removeListener?.("disconnect", onDisconnect); dispose(); });
try { $("contract-address").textContent = validateDeployment().address; } catch (error) { $("connection-hint").textContent = friendlyError(error); }
if (!wallet) $("connection-hint").textContent = "MetaMask not found. Open this page in a browser with the wallet extension.";
updateSlot();
