import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import figlet from "figlet";
import { seed } from "./seed.js";
import { nextPrompt, humanDelay } from "./prompts.js";
import { initGit, measure, printCycle, printSummary } from "./metrics.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, "..", "workspace");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { delay: null, model: "gemini-3-flash" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--delay" && args[i + 1]) {
      opts.delay = parseInt(args[i + 1], 10);
      i++;
    }
    if (args[i] === "--model" && args[i + 1]) {
      opts.model = args[i + 1];
      i++;
    }
  }
  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runAgent(prompt, model) {
  const modelFlag = model ? ` --model "${model}"` : "";
  const cmd = `agent -p --force${modelFlag} "${prompt.replace(/"/g, '\\"')}"`;
  try {
    execSync(cmd, {
      cwd: WORKSPACE,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 300_000,
    });
    return true;
  } catch (e) {
    const stderr = (e.stderr || "").trim();
    const stdout = (e.stdout || "").trim();
    if (e.status !== null) {
      console.log(`  agent exited with code ${e.status}`);
    } else {
      console.log(`  agent error: ${e.message.split("\n")[0]}`);
    }
    if (stderr)
      console.log(
        `  stderr: ${stderr.split("\n").slice(0, 3).join("\n          ")}`,
      );
    if (!stderr && stdout)
      console.log(
        `  stdout: ${stdout.split("\n").slice(-3).join("\n          ")}`,
      );
    return false;
  }
}

let stopping = false;

process.on("SIGINT", () => {
  if (stopping) process.exit(1);
  stopping = true;
  console.log("\nstopping after current cycle...");
});

async function main() {
  const opts = parseArgs();

  console.log(figlet.textSync("agentloop", { font: "Small" }));
  console.log();
  console.log(`workspace: ${WORKSPACE}`);
  console.log(`delay:     ${opts.delay ? opts.delay + "ms (fixed)" : "human-like (random)"}`);
  if (opts.model) console.log(`model:     ${opts.model}`);
  console.log();

  seed(WORKSPACE);
  initGit(WORKSPACE);

  let cycle = 0;

  while (!stopping) {
    cycle++;
    const { prompt, category } = nextPrompt(WORKSPACE);
    console.log(`[cycle ${cycle}] (${category}) ${prompt}`);

    const ok = runAgent(prompt, opts.model);

    if (ok) {
      const entry = measure(WORKSPACE, cycle, prompt, category);
      printCycle(entry);
    }

    if (!stopping) {
      const delay = opts.delay || humanDelay();
      console.log(`  waiting ${(delay / 1000).toFixed(1)}s...`);
      await sleep(delay);
    }
  }

  printSummary();
}

main();
