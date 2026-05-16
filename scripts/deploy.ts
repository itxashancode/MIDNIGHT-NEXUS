import "dotenv/config";
import { deployContract } from "../lib/midnight/contract";

async function main() {
  try {
    const { contractAddress, txHash } = await deployContract();
    console.log("\n✅ Contract deployed!");
    console.log(`Address: ${contractAddress}`);
    console.log(`TxHash: ${txHash}`);
    console.log(`\nAdd this to your .env: CONTRACT_ADDRESS=${contractAddress}`);
    process.exit(0);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();