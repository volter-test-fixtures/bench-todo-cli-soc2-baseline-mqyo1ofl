#!/usr/bin/env bun
/**
 * todo-cli – a small, persistent command-line todo application.
 *
 * Usage:
 *   todo add <description>    Add a new task
 *   todo list                 List all tasks
 *   todo complete <id>        Mark a task done
 *   todo delete <id>          Remove a task
 *   todo --help               Show this message
 */

import { loadTasks, saveTasks } from "./storage";
import type { Task } from "./types";

const USAGE = `
Usage: todo <command> [arguments]

Commands:
  add <description>       Add a new task with the given description
  list                    List all tasks with their status
  complete <id>           Mark a task as completed
  delete <id>             Delete a task

Options:
  --help                  Show this usage message
`.trim();

function formatTask(t: Task): string {
  const status = t.done ? "[✓]" : "[ ]";
  return `${status} ${t.id}: ${t.description}`;
}

function cmdAdd(args: string[]): never {
  if (args.length === 0) {
    console.error("Error: missing description.\n");
    console.error(USAGE);
    process.exit(1);
  }
  const desc = args.join(" ");
  const store = loadTasks();
  const task: Task = { id: store.nextId++, description: desc, done: false };
  store.tasks.push(task);
  saveTasks(store);
  console.log(`Added task ${task.id}: "${desc}"`);
  process.exit(0);
}

function cmdList(): never {
  const store = loadTasks();
  if (store.tasks.length === 0) {
    console.log("No tasks.");
  } else {
    for (const t of store.tasks) {
      console.log(formatTask(t));
    }
  }
  process.exit(0);
}

function cmdComplete(args: string[]): never {
  if (args.length === 0) {
    console.error("Error: missing task id.\n");
    console.error(USAGE);
    process.exit(1);
  }
  const id = parseInt(args[0], 10);
  if (isNaN(id)) {
    console.error(`Error: invalid task id "${args[0]}".`);
    process.exit(1);
  }
  const store = loadTasks();
  const task = store.tasks.find((t) => t.id === id);
  if (!task) {
    console.error(`Error: no task with id ${id}.`);
    process.exit(1);
  }
  task.done = true;
  saveTasks(store);
  console.log(`Completed task ${task.id}: "${task.description}"`);
  process.exit(0);
}

function cmdDelete(args: string[]): never {
  if (args.length === 0) {
    console.error("Error: missing task id.\n");
    console.error(USAGE);
    process.exit(1);
  }
  const id = parseInt(args[0], 10);
  if (isNaN(id)) {
    console.error(`Error: invalid task id "${args[0]}".`);
    process.exit(1);
  }
  const store = loadTasks();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    console.error(`Error: no task with id ${id}.`);
    process.exit(1);
  }
  const removed = store.tasks.splice(idx, 1)[0];
  saveTasks(store);
  console.log(`Deleted task ${removed.id}: "${removed.description}"`);
  process.exit(0);
}

function main(): never {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case "add":
      cmdAdd(commandArgs);
    case "list":
      cmdList();
    case "complete":
      cmdComplete(commandArgs);
    case "delete":
      cmdDelete(commandArgs);
    default: {
      console.error(`Error: unknown command "${command}".\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }
}

main();