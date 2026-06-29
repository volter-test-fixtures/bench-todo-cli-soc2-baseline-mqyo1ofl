import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DATA_DIR = join(homedir(), ".todo-cli");
const DATA_FILE = join(DATA_DIR, "tasks.json");

export interface Task {
  id: number;
  description: string;
  done: boolean;
  createdAt: string;
}

let nextId = 1;
let tasks: Task[] = [];

export function loadTasks(): Task[] {
  if (!existsSync(DATA_FILE)) {
    tasks = [];
    nextId = 1;
    return tasks;
  }
  const raw = readFileSync(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as { tasks: Task[]; nextId: number };
  tasks = parsed.tasks;
  nextId = parsed.nextId ?? (tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1);
  return tasks;
}

export function saveTasks(): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify({ tasks, nextId }, null, 2), "utf-8");
}

export function addTask(description: string): Task {
  const task: Task = {
    id: nextId++,
    description,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks();
  return task;
}

export function listTasks(): Task[] {
  return tasks;
}

export function completeTask(id: number): Task | null {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.done = true;
  saveTasks();
  return task;
}

export function deleteTask(id: number): Task | null {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const [removed] = tasks.splice(idx, 1);
  saveTasks();
  return removed;
}

// Ensure loadTasks is called before any operations in CLI context
export function init(): void {
  loadTasks();
}