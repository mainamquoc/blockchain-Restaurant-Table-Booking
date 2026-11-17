import { BrowserProvider, Contract, Interface, ZeroAddress, getAddress, isAddress } from "ethers";

const files = import.meta.glob("../generated/contract.json", { eager: true, import: "default" });
export const deployment = files["../generated/contract.json"] ?? null;

export function validateDeployment(config = deployment) {
  if (!config || !isAddress(config.address) || !Array.isArray(config.abi) || !/^\d+$/.test(config.chainId) || BigInt(config.chainId) <= 0n) throw new Error("Missing or invalid deployment configuration. Complete step 03 to generate contract.json, then reload.");
  return config;
}

export function injectedWallet() {
  return window.ethereum?.providers?.find(p => p.isMetaMask) ?? window.ethereum ?? null;
}

export async function connectWallet(wallet, requestAccess = false) {
  const config = validateDeployment();
  if (!wallet) throw new Error("Wallet not found. Open this page in a browser with MetaMask installed.");
  const accounts = await wallet.request({ method: requestAccess ? "eth_requestAccounts" : "eth_accounts" });
  if (!accounts.length) throw new Error("No account connected. Click Connect MetaMask and approve access in your wallet.");
  const chainId = BigInt(await wallet.request({ method: "eth_chainId" })).toString();
  if (chainId !== config.chainId) throw new Error(`Wrong network: wallet chain ${chainId}. Switch to Ganache chain ${config.chainId} and reconnect.`);
  const provider = new BrowserProvider(wallet, "any");
  try {
    const account = getAddress(accounts[0]);
    const signer = await provider.getSigner(account);
    const contract = new Contract(config.address, config.abi, signer);
    if (await provider.getCode(config.address) === "0x") throw new Error("No contract code at the configured address. Check the Ganache workspace or deploy again.");
    const owner = getAddress(await contract.owner());
    if (owner === ZeroAddress) throw new Error("Invalid contract owner.");
    if (config.deploymentTransactionHash) {
      const receipt = await provider.getTransactionReceipt(config.deploymentTransactionHash);
      if (!receipt || receipt.status !== 1 || !receipt.contractAddress || getAddress(receipt.contractAddress) !== getAddress(config.address) || getAddress(receipt.from) !== owner) throw new Error("Contract does not match the saved deployment. Check Ganache and the generated configuration.");
    }
    return { wallet, provider, contract, account, owner, chainId, isOwner: account === owner };
  } catch (error) { provider.destroy(); throw error; }
}

export async function assertCurrentSession(session) {
  const [accounts, chain] = await Promise.all([session.wallet.request({ method: "eth_accounts" }), session.wallet.request({ method: "eth_chainId" })]);
  if (!accounts.length || getAddress(accounts[0]) !== session.account || BigInt(chain).toString() !== session.chainId) throw new Error("Your account or network changed. Reconnect before sending a transaction.");
}

export async function readTables(session, slotId) {
  const ids = await session.contract.getTableIds();
  return Promise.all(ids.map(async id => {
    const [table, customer] = await Promise.all([session.contract.tables(id), session.contract.bookings(id, slotId)]);
    return { id: id.toString(), capacity: table.capacity.toString(), customer: getAddress(customer) };
  }));
}

const messages = {
  NotOwner: "Only the restaurant owner can register tables.", InvalidTableId: "Table ID must be greater than zero.", InvalidCapacity: "Seats must be greater than zero.",
  TableAlreadyExists: "This table ID is already registered.", TableNotFound: "This table has not been registered.", InvalidSlotId: "Invalid time slot.",
  SlotAlreadyBooked: "This table is already booked for the selected time slot.", BookingNotFound: "There is no booking for this time slot.", NotBookingOwner: "Only the customer who holds this booking can cancel it.",
};
export function friendlyError(error) {
  const nested = error?.info?.error ?? error?.error;
  if ([error?.code, nested?.code].some(code => code === 4001 || code === "ACTION_REJECTED")) return "You rejected the wallet request. No transaction was confirmed.";
  if ([error?.code, nested?.code].includes(-32002)) return "A wallet request is already pending. Open MetaMask to review it.";
  for (const data of [error?.data, nested?.data, nested?.data?.result, error?.cause?.data]) {
    if (typeof data !== "string") continue;
    try { const name = new Interface(deployment?.abi ?? []).parseError(data)?.name; if (messages[name]) return messages[name]; } catch { /* Not ABI revert data. */ }
  }
  if (messages[error?.revert?.name]) return messages[error.revert.name];
  if (error?.code === "INSUFFICIENT_FUNDS") return "Your wallet needs more test ETH to pay for gas.";
  if (["NETWORK_ERROR", "SERVER_ERROR", "TIMEOUT", "UNKNOWN_ERROR"].includes(error?.code)) return "Unable to reach the network or RPC. Check Ganache and your wallet network, then try again.";
  if (error?.code === "CALL_EXCEPTION") return "The contract rejected this action. The booking may have changed; refresh the tables.";
  return error?.shortMessage ?? error?.message ?? "The action failed. Please try again.";
}
export { ZeroAddress };
