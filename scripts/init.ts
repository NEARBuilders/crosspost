import ora from "ora";
import { writeFile } from "fs/promises";
import { join } from "path";
import { promptUser, activeSpinners, withCleanup } from "./utils/helpers";
import { validateAccount, createWeb4Account } from "./utils/near";

async function saveConfig(network: string, account: string): Promise<void> {
  const spinner = ora("Saving configuration").start();
  activeSpinners.push(spinner);

  try {
    const config = {
      network,
      account,
    };

    const configPath = join(process.cwd(), "bos.config.json");
    await writeFile(configPath, JSON.stringify(config, null, 2));
    spinner.succeed(`Configuration saved to bos.config.json`);
  } catch (error) {
    spinner.fail(`Failed to save configuration: ${error}`);
    throw error;
  } finally {
    const index = activeSpinners.indexOf(spinner);
    if (index > -1) {
      activeSpinners.splice(index, 1);
    }
  }
}

// Start the main process
withCleanup(async () => {
  console.log("Starting initialization process...");

  const network = await promptUser("Enter the network (mainnet/testnet): ");

  if (network !== "mainnet" && network !== "testnet") {
    throw new Error(
      'Invalid network. Please enter either "mainnet" or "testnet".',
    );
  }

  const accountSuffix = network === "mainnet" ? "near" : "testnet";
  const account = await promptUser(
    `Enter your account name (e.g root.${accountSuffix}): `,
  );

  console.log(`\nValidating your account... ${account}`);
  await validateAccount(network, account);

  console.log(`\nSetting up web4 account... web4.${account}`);
  await createWeb4Account(network, account);

  console.log("\nSaving configuration...");
  await saveConfig(network, account);

  console.log("\nInitialization completed successfully!");
});
