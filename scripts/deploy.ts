import { promptUser, withCleanup } from "./utils/helpers";
import { deployToWeb4, getConfigValues, validateAccount } from "./utils/near";

withCleanup(async () => {
  console.log("Starting deployment process...");

  // Get configuration
  const config = await getConfigValues();

  // Get network
  let network = config.network;
  if (!network) {
    network = await promptUser("Enter the network (mainnet/testnet): ");
  }

  if (network !== "mainnet" && network !== "testnet") {
    throw new Error(
      'Invalid network. Please enter either "mainnet" or "testnet".',
    );
  }

  // Get account
  const accountSuffix = network === "mainnet" ? "near" : "testnet";
  let account = config.account;
  if (!account) {
    account = await promptUser(
      `Enter your account name (e.g root.${accountSuffix}): `,
    );
  }

  // Validate web4 account
  console.log(`\nValidating web4 account... web4.${account}`);
  await validateAccount(network, `web4.${account}`);

  // Deploy to web4
  console.log(`\nDeploying to web4.${account}`);
  await deployToWeb4(network, `web4.${account}`);

  console.log("\nDeployment completed successfully!");
});
