import "dotenv/config";
import { deployNexusZero } from "../lib/midnight/contract";
import fs from "fs";
import path from "path";

async function main() {
  try {
    console.log("🚀 Starting NexusZero deployment on Midnight Preprod...");

    // 1. Validate required env vars
    const requiredEnv = ["MIDNIGHT_INDEXER_HTTP_URL", "MIDNIGHT_PROVING_SERVER_URL"];
    for (const env of requiredEnv) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
    }

    // 2. Check that managed/ contract exists
    const contractPath = path.join(process.cwd(), "midnight-contracts", "managed", "NexusZero", "contract", "index.js");
    if (!fs.existsSync(contractPath)) {
      console.error("❌ Error: Contract not compiled. Run: npm run compile");
      process.exit(1);
    }

    // 3. Call deployNexusZero()
    const { contractAddress, txHash } = await deployNexusZero();

    // 4. Print success
    console.log("\n✅ NexusZero deployed on Midnight Preprod");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Transaction: ${txHash}`);
    console.log(`Network: Preprod\n`);
    
    console.log(`Add this to your .env:`);
    console.log(`CONTRACT_ADDRESS=${contractAddress}\n`);

    // 5. Automatically write CONTRACT_ADDRESS to .env file
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const updatedEnv = envContent.includes("CONTRACT_ADDRESS=")
        ? envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`)
        : envContent + `\nCONTRACT_ADDRESS=${contractAddress}`;
      fs.writeFileSync(envPath, updatedEnv);
      console.log("📝 Updated .env with new CONTRACT_ADDRESS");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
