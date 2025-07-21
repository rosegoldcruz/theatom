// calls/flashLoan.ts

// FlashLoan Contract ABI
const abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "requestFlashLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Flash Loan Transaction Calls
export const calls = [
  {
    address: "0xb3800E6bC7847E5d5a71a03887EDc5829DF4133b", // Your deployed FlashLoan contract
    abi,
    functionName: "requestFlashLoan",
    args: [
      "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
      "1000000" // 1 USDC (6 decimals)
    ]
  }
];

// Export ABI for other components
export { abi as flashLoanABI };
