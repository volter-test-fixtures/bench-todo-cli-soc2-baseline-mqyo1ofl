import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Task } from "./task.ts";

const DIR = join(homedir(), ".todo-cli");
const PATH = join(DIR, "tasks.json");

/** Load tasks from disk. Returns an empty array if no file exists. */
export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await readFile(PATH, "utf-8");
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

/** Save tasks to disk, creating the directory if needed. */
export async function saveTasks(tasks: Task[]): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(PATH, JSON.stringify(tasks, null, 2), "utf-8");
}