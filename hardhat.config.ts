import '@typechain/hardhat'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : undefined,
    }
  }
};

export default config;
