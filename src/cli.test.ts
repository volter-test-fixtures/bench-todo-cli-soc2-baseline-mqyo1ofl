import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_TS = join(__dirname, "cli.ts");

// Use a temp home directory so tests don't affect real data
const TMPDIR = join(tmpdir(), "todo-cli-test-" + Date.now());

beforeAll(() => {
  mkdirSync(TMPDIR, { recursive: true });
});

afterAll(() => {
  rmSync(TMPDIR, { recursive: true, force: true });
});

function todo(...args: string[]) {
  const result = spawnSync("bun", ["run", CLI_TS, ...args], {
    env: { ...process.env, HOME: TMPDIR },
    encoding: "utf-8",
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? 1,
  };
}

describe("todo CLI", () => {
  describe("ac/01: add, list, complete, delete", () => {
    it("adds a task", () => {
      const { stdout, stderr, exitCode } = todo("add", "Buy milk");
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/added task 1: Buy milk/);
      expect(stderr).toBe("");
    });

    it("adds another task", () => {
      const { stdout, stderr, exitCode } = todo("add", "Write docs");
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/added task 2: Write docs/);
    });

    it("lists tasks with done/undone status", () => {
      const { stdout, stderr, exitCode } = todo("list");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("[ ] 1: Buy milk");
      expect(stdout).toContain("[ ] 2: Write docs");
      expect(stderr).toBe("");
    });

    it("marks a task complete", () => {
      const { stdout, stderr, exitCode } = todo("complete", "1");
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/completed task 1: Buy milk/);
      expect(stderr).toBe("");
    });

    it("shows completed task with [✓]", () => {
      const { stdout, stderr, exitCode } = todo("list");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("[✓] 1: Buy milk");
      expect(stdout).toContain("[ ] 2: Write docs");
      expect(stderr).toBe("");
    });

    it("deletes a task", () => {
      const { stdout, stderr, exitCode } = todo("delete", "2");
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/deleted task 2: Write docs/);
      expect(stderr).toBe("");
    });

    it("lists after delete shows only remaining tasks", () => {
      const { stdout, stderr, exitCode } = todo("list");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("1: Buy milk");
      expect(stdout).not.toContain("2: Write docs");
      expect(stderr).toBe("");
    });
  });

  describe("ac/02: persistence across invocations", () => {
    beforeAll(() => {
      rmSync(TMPDIR, { recursive: true, force: true });
      mkdirSync(TMPDIR, { recursive: true });
    });

    it("add task exists when listed in a separate invocation", () => {
      const addResult = todo("add", "Persistent task");
      expect(addResult.exitCode).toBe(0);

      const listResult = todo("list");
      expect(listResult.exitCode).toBe(0);
      expect(listResult.stdout).toContain("Persistent task");
    });

    it("complete persists across invocations", () => {
      todo("add", "Task to complete");
      todo("complete", "2");
      const { stdout } = todo("list");
      expect(stdout).toContain("[✓] 2: Task to complete");
    });

    it("delete persists across invocations", () => {
      todo("add", "Keep me");
      todo("add", "Delete me");
      todo("delete", "4");
      const { stdout } = todo("list");
      expect(stdout).toContain("Keep me");
    });
  });

  describe("ac/03: error handling and --help", () => {
    it("returns non-zero and usage for unknown command", () => {
      const { stdout, stderr, exitCode } = todo("bogus");
      expect(exitCode).toBe(1);
      expect(stderr).toContain('unknown command "bogus"');
    });

    it("returns non-zero for missing add description", () => {
      const { stderr, exitCode } = todo("add");
      expect(exitCode).toBe(1);
      expect(stderr).toContain("missing description");
    });

    it("returns non-zero for complete with missing id", () => {
      const { stderr, exitCode } = todo("complete");
      expect(exitCode).toBe(1);
      expect(stderr).toContain("missing task id");
    });

    it("returns non-zero for delete with missing id", () => {
      const { stderr, exitCode } = todo("delete");
      expect(exitCode).toBe(1);
      expect(stderr).toContain("missing task id");
    });

    it("returns non-zero for complete with nonexistent id", () => {
      const { stderr, exitCode } = todo("complete", "999");
      expect(exitCode).toBe(1);
      expect(stderr).toContain("no task with id 999");
    });

    it("returns non-zero for delete with nonexistent id", () => {
      const { stderr, exitCode } = todo("delete", "999");
      expect(exitCode).toBe(1);
      expect(stderr).toContain("no task with id 999");
    });

    it("returns non-zero for invalid (non-integer) id", () => {
      const { stderr, exitCode } = todo("complete", "abc");
      expect(exitCode).toBe(1);
      expect(stderr).toContain('invalid id "abc"');
    });

    it("--help prints usage and exits 0", () => {
      const { stdout, stderr, exitCode } = todo("--help");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
      expect(stderr).toBe("");
    });

    it("-h prints usage and exits 0", () => {
      const { stdout, stderr, exitCode } = todo("-h");
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
      expect(stderr).toBe("");
    });

    it("no arguments prints usage and exits 0", () => {
      const { stdout, stderr, exitCode } = todo();
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
      expect(stderr).toBe("");
    });

    it("does not emit a raw stack trace on errors", () => {
      for (const cmd of [
        ["add"],
        ["complete"],
        ["complete", "999"],
        ["delete"],
        ["delete", "999"],
        ["bogus"],
      ]) {
        const { stderr } = todo(...cmd);
        expect(stderr).not.toMatch(/at\s+\S+\.(ts|js):\d+:\d+/);
        expect(stderr).not.toMatch(/Error:/);
        expect(stderr).not.toMatch(/stack trace/i);
      }
    });
  });
});