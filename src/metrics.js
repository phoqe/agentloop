import { execSync } from "child_process";
import { appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const METRICS_FILE = join(__dirname, "..", "metrics.jsonl");

const session = {
  startedAt: Date.now(),
  cycles: 0,
  totalInsertions: 0,
  totalDeletions: 0,
  totalFilesChanged: 0,
};

function git(cmd, cwd) {
  try {
    return execSync(`git ${cmd}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

export function initGit(workspaceDir) {
  if (!git("rev-parse --is-inside-work-tree", workspaceDir)) {
    git("init", workspaceDir);
    git("add -A", workspaceDir);
    git('commit -m "seed"', workspaceDir);
  }
}

export function measure(workspaceDir, cycle, prompt, category) {
  git("add -A", workspaceDir);

  const stat = git("diff --cached --stat", workspaceDir);
  if (!stat) {
    git("reset", workspaceDir);
    return null;
  }

  const filesChanged = (stat.match(/\d+ files? changed/) || ["0"])[0].match(/\d+/)[0];
  const insertions = (stat.match(/(\d+) insertions?/) || [null, "0"])[1];
  const deletions = (stat.match(/(\d+) deletions?/) || [null, "0"])[1];

  git(`commit -m "cycle-${cycle}"`, workspaceDir);

  const entry = {
    cycle,
    timestamp: new Date().toISOString(),
    prompt,
    category,
    filesChanged: parseInt(filesChanged, 10),
    insertions: parseInt(insertions, 10),
    deletions: parseInt(deletions, 10),
  };

  session.cycles++;
  session.totalInsertions += entry.insertions;
  session.totalDeletions += entry.deletions;
  session.totalFilesChanged += entry.filesChanged;

  appendFileSync(METRICS_FILE, JSON.stringify(entry) + "\n");

  return entry;
}

export function printCycle(entry) {
  if (!entry) {
    console.log("  (no changes)");
    return;
  }
  console.log(
    `  +${entry.insertions} -${entry.deletions} in ${entry.filesChanged} file(s)`
  );
}

export function printSummary() {
  const elapsed = ((Date.now() - session.startedAt) / 1000).toFixed(1);
  console.log("\n--- session summary ---");
  console.log(`cycles:      ${session.cycles}`);
  console.log(`insertions:  +${session.totalInsertions}`);
  console.log(`deletions:   -${session.totalDeletions}`);
  console.log(`files:       ${session.totalFilesChanged} total changes`);
  console.log(`duration:    ${elapsed}s`);
  if (session.cycles > 0) {
    console.log(
      `avg/cycle:   +${(session.totalInsertions / session.cycles).toFixed(1)} -${(session.totalDeletions / session.cycles).toFixed(1)}`
    );
  }
  console.log("metrics logged to metrics.jsonl");
}
