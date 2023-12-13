import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'
import "tsconfig-paths/register";


const config: HardhatUserConfig = {
  solidity: "0.8.23",
  networks: {
    bsctest: {
      url: process.env.BSC_TEST_NET_URL,
      accounts: [process.env.PRIVATE_KEY ?? ''],
    },
  },
  etherscan: {
    apiKey: process.env.API_KEY,
  },
  sourcify: {
    enabled: true,
  },
};
export default config;
