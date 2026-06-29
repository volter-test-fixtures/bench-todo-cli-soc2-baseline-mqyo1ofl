import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtempSync } from "fs";

// We'll run the CLI as a subprocess to test end-to-end.
const CLI = join(import.meta.dir, "cli.ts");

let tmpDir: string;

/** Path to the temp data file that the process's TODO_DATA_DIR will point at. */
function dataFile(): string {
  return join(tmpDir, "tasks.json");
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "todo-test-"));
  // Seed an initial empty store so we can predict nextId.
  writeFileSync(dataFile(), JSON.stringify({ nextId: 1, tasks: [] }));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function run(...args: string[]) {
  return Bun.spawnSync([process.execPath, "run", CLI, ...args], {
    env: { TODO_DATA_DIR: tmpDir },
  });
}

describe("add", () => {
  test("adds a task and prints confirmation", () => {
    const proc = run("add", "Buy milk");
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain("Added task 1");
    expect(proc.stdout.toString()).toContain("Buy milk");
  });

  test("requires a description", () => {
    const proc = run("add");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("missing description");
  });
});

describe("list", () => {
  test("shows 'No tasks.' when empty", () => {
    const proc = run("list");
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain("No tasks.");
  });

  test("shows added tasks with undone status", () => {
    run("add", "Task A");
    run("add", "Task B");
    const proc = run("list");
    expect(proc.exitCode).toBe(0);
    const out = proc.stdout.toString();
    expect(out).toContain("[ ] 1: Task A");
    expect(out).toContain("[ ] 2: Task B");
  });
});

describe("complete", () => {
  test("marks a task done", () => {
    run("add", "Write tests");
    const proc = run("complete", "1");
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain("Completed task 1");
    // Verify via list
    const list = run("list");
    expect(list.stdout.toString()).toContain("[✓] 1: Write tests");
  });

  test("errors on unknown id", () => {
    const proc = run("complete", "999");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("no task with id 999");
  });

  test("errors on missing id", () => {
    const proc = run("complete");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("missing task id");
  });

  test("errors on non-numeric id", () => {
    const proc = run("complete", "abc");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("invalid task id");
  });
});

describe("delete", () => {
  test("deletes a task", () => {
    run("add", "Delete me");
    const proc = run("delete", "1");
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain("Deleted task 1");
    const list = run("list");
    expect(list.stdout.toString()).toContain("No tasks.");
  });

  test("errors on unknown id", () => {
    const proc = run("delete", "999");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("no task with id 999");
  });
});

describe("persistence", () => {
  test("tasks survive across invocations", () => {
    run("add", "Persistent task");
    // Second invocation should see it
    const proc = run("list");
    expect(proc.stdout.toString()).toContain("Persistent task");
  });

  test("completion persists", () => {
    run("add", "Will be done");
    run("complete", "1");
    const proc = run("list");
    expect(proc.stdout.toString()).toContain("[✓]");
  });

  test("deletion persists", () => {
    run("add", "Will be deleted");
    run("delete", "1");
    const proc = run("list");
    expect(proc.stdout.toString()).toContain("No tasks.");
  });
});

describe("--help and unknown commands", () => {
  test("--help prints usage and exits 0", () => {
    const proc = run("--help");
    expect(proc.exitCode).toBe(0);
    // Should contain command descriptions
    expect(proc.stdout.toString()).toContain("Usage:");
    expect(proc.stdout.toString()).toContain("add");
    expect(proc.stdout.toString()).toContain("list");
    expect(proc.stdout.toString()).toContain("complete");
    expect(proc.stdout.toString()).toContain("delete");
  });

  test("unknown command exits non-zero with clear message", () => {
    const proc = run("bogus");
    expect(proc.exitCode).toBe(1);
    expect(proc.stderr.toString()).toContain("unknown command");
  });

  test("no raw stack trace on error", () => {
    // Test several error paths for raw stack traces — our "Error:" prefix is
    // intentional user-facing output, not a raw stack trace.
    const errors = [
      run("bogus"),
      run("add"),
      run("complete", "999"),
      run("delete", "abc"),
    ];
    for (const proc of errors) {
      const all = proc.stdout.toString() + proc.stderr.toString();
      // Stack traces contain "  at " (with leading spaces) and file paths.
      expect(all).not.toContain("  at ");
    }
  });
});