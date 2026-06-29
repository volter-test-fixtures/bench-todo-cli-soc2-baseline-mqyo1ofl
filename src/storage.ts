import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { Task, TaskStore } from "./types";

/** Directory where the todo data file lives. */
const DATA_DIR = process.env.TODO_DATA_DIR ?? join(homedir(), ".todo-cli");
const DATA_FILE = join(DATA_DIR, "tasks.json");

function defaultStore(): TaskStore {
  return { nextId: 1, tasks: [] };
}

/** Load tasks from disk.  Returns an empty store if the file doesn't exist yet. */
export function loadTasks(): TaskStore {
  try {
    const raw = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as TaskStore;
  } catch {
    return defaultStore();
  }
}

/** Save tasks to disk.  Creates the data directory if needed. */
export function saveTasks(store: TaskStore): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/** Return the file path (useful in tests). */
export function getDataFilePath(): string {
  return DATA_FILE;
}