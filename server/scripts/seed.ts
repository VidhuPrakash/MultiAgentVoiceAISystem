import "dotenv/config";
import { seedAdmin } from "./admin";
import { seedDummyData } from "./data";

async function main() {
  try {
    console.log("[seed] Starting...");

    await seedAdmin();
    await seedDummyData();

    console.log("[seed] Completed");
    process.exit(0);
  } catch (err) {
    console.error("[seed] Failed:", err);
    process.exit(1);
  }
}

main();
