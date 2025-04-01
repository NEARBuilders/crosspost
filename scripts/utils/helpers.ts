import { ChildProcess, spawn } from "child_process";
import ora, { Ora } from "ora";

export async function withSpinner<T>(
  message: string,
  fn: (spinner: Ora) => Promise<T>,
): Promise<T> {
  const spinner = ora(message).start();
  activeSpinners.push(spinner);

  try {
    return await fn(spinner);
  } catch (error) {
    spinner.fail(error.message);
    throw error;
  } finally {
    const index = activeSpinners.indexOf(spinner);
    if (index > -1) {
      activeSpinners.splice(index, 1);
    }
  }
}
import treeKill from "tree-kill";

// Track all active processes and spinners
export const activeProcesses: ChildProcess[] = [];
export const activeSpinners: Ora[] = [];
export let isCleaningUp = false;

export async function promptUser(question: string): Promise<string> {
  const { default: readline } = await import("readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Handle cleanup if interrupted
  const cleanup = () => {
    try {
      rl.close();
    } catch (err) {
      console.error("Failed to close readline interface:", err);
    }
  };
  process.once("SIGINT", cleanup);

  try {
    return await rl.question(question);
  } finally {
    cleanup();
    process.removeListener("SIGINT", cleanup);
  }
}

export async function executeCommand(
  command: string[],
  cwd: string = process.cwd(),
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isCleaningUp) {
      reject(new Error("Operation cancelled"));
      return;
    }

    console.log("\nExecuting command:", command.join(" "));

    // Create process in its own group to make cleanup easier
    const proc = spawn(command[0], command.slice(1), {
      cwd,
      stdio: "inherit",
      shell: true,
      detached: true,
      // This ensures the process group can be killed together
      windowsHide: true,
    });

    // Track the process
    activeProcesses.push(proc);

    // Handle SIGINT for this specific process
    const sigintHandler = () => {
      if (proc.pid) {
        try {
          // Kill the entire process group
          process.kill(-proc.pid, "SIGINT");
        } catch (err) {
          // Fallback to tree-kill if process group kill fails
          treeKill(proc.pid, "SIGINT");
        }
      }
    };
    process.on("SIGINT", sigintHandler);

    proc.on("close", (code) => {
      // Clean up
      const index = activeProcesses.indexOf(proc);
      if (index > -1) {
        activeProcesses.splice(index, 1);
      }
      // Remove the SIGINT handler
      process.removeListener("SIGINT", sigintHandler);

      if (isCleaningUp) {
        reject(new Error("Operation cancelled"));
        return;
      }

      if (code === 0) {
        resolve();
      } else if (code === null || isCleaningUp) {
        reject(new Error("Command was interrupted"));
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on("error", (err) => {
      const index = activeProcesses.indexOf(proc);
      if (index > -1) {
        activeProcesses.splice(index, 1);
      }
      process.removeListener("SIGINT", sigintHandler);
      reject(new Error(`Failed to start command: ${err.message}`));
    });
  });
}

export async function withCleanup<T>(fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    await cleanupAndExit(0);
    return result;
  } catch (error) {
    console.error("\nOperation failed:", error.message);
    await cleanupAndExit(1);
    throw error;
  }
}

export async function cleanupAndExit(exitCode = 1) {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log("\nCleaning up...");

  // Stop all spinners
  activeSpinners.forEach((spinner) => spinner.stop());
  activeSpinners.length = 0;

  // Kill all processes
  await Promise.all(
    activeProcesses.map(async (proc) => {
      if (!proc.pid) return;

      try {
        // Try SIGINT first
        process.kill(-proc.pid, "SIGINT");

        // Wait briefly for graceful shutdown
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Force kill if still running
        if (proc.pid) {
          process.kill(-proc.pid, "SIGKILL");
        }
      } catch {
        // Fallback to tree-kill
        if (proc.pid) {
          treeKill(proc.pid, "SIGKILL");
        }
      }
    }),
  );

  process.exit(exitCode);
}
