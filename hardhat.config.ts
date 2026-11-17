import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";

export default defineConfig({
  plugins: [hardhatEthers, hardhatNodeTestRunner],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    hardhatTest: {
      type: "edr-simulated",
      chainType: "l1",
      throwOnTransactionFailures: false,
    },
    ganache: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: "remote",
      timeout: 10_000,
    },
  },
});
