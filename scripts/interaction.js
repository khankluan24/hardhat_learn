import "dotenv/config";
import { Web3 } from "web3";

const tokenAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "_to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const tokenAdress = "0x0953B0A9fBcC362382BaAB8aaA21F2B81Fcd2691";

const privateKey = process.env.PRIVATE_KEY;
const newPrivateKey = "0x" + privateKey;
const walletAdr = "0xfad456F610aA53E1BBDCD389841f441e81dcc9C6";
const receiverAdr = "0xd68e9AD10b80cEfC9d19a6916e0a3e1687e25589";
const main = async () => {
  const web3 = new Web3(process.env.BSC_TEST_NET_URL);
  web3.eth.accounts.wallet.add(newPrivateKey);
  const tokenContract = new web3.eth.Contract(tokenAbi, tokenAdress);
  // // Call
  // const myBalance = await tokenContract.methods.balanceOf(walletAdr).call();

  // Send

  const receiverBalance = await tokenContract.methods
    .balanceOf(receiverAdr)
    .call();

  const result = await tokenContract.methods
    .transfer(receiverAdr, 100000)
    .send({
      from: walletAdr,
      gas: 300000,
    });
  console.log(result);

  const receiverBalanceAfter = await tokenContract.methods
    .balanceOf(receiverAdr)
    .call();

  console.log(result, receiverBalance, receiverBalanceAfter);
};
main().catch((error) => console.log(error));
