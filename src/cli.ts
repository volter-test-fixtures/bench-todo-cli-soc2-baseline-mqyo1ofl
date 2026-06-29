#!/usr/bin/env bun
/**
 * todo-cli — a persistent command-line todo application.
 *
 * Usage:
 *   todo add <description>   Add a new task
 *   todo list                List all tasks with done/undone status
 *   todo complete <id>       Mark a task as complete
 *   todo delete <id>         Delete a task
 *   todo clear               Remove all tasks
 *   todo --help              Show this help message
 */

import { loadTasks, saveTasks } from "./storage.ts";

const USAGE = `todo-cli — a simple, persistent todo list

Usage:
  todo add <description>      Add a new task
  todo list                   List all tasks
  todo complete <id>          Mark a task as complete
  todo delete <id>            Delete a task
  todo clear                  Remove all tasks
  todo --help                 Show this help message
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    process.stdout.write(USAGE);
    return;
  }

  const command = args[0];

  switch (command) {
    case "add": {
      if (args.length < 2) {
        process.stderr.write("error: missing description\n");
        process.exit(1);
      }
      const description = args.slice(1).join(" ");
      const tasks = await loadTasks();
      const id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      tasks.push({ id, description, done: false });
      await saveTasks(tasks);
      process.stdout.write(`Added task ${id}: ${description}\n`);
      break;
    }

    case "list": {
      const tasks = await loadTasks();
      if (tasks.length === 0) {
        process.stdout.write("No tasks.\n");
        return;
      }
      for (const task of tasks) {
        const status = task.done ? "[✓]" : "[ ]";
        process.stdout.write(`${status} ${task.id}: ${task.description}\n`);
      }
      break;
    }

    case "complete": {
      if (args.length < 2) {
        process.stderr.write("error: missing task id\n");
        process.exit(1);
      }
      const id = parseInt(args[1], 10);
      if (isNaN(id)) {
        process.stderr.write(`error: invalid task id "${args[1]}"\n`);
        process.exit(1);
      }
      const tasks = await loadTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        process.stderr.write(`error: unknown task id ${id}\n`);
        process.exit(1);
      }
      task.done = true;
      await saveTasks(tasks);
      process.stdout.write(`Completed task ${id}: ${task.description}\n`);
      break;
    }

    case "delete": {
      if (args.length < 2) {
        process.stderr.write("error: missing task id\n");
        process.exit(1);
      }
      const id = parseInt(args[1], 10);
      if (isNaN(id)) {
        process.stderr.write(`error: invalid task id "${args[1]}"\n`);
        process.exit(1);
      }
      const tasks = await loadTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) {
        process.stderr.write(`error: unknown task id ${id}\n`);
        process.exit(1);
      }
      const removed = tasks.splice(idx, 1)[0];
      await saveTasks(tasks);
      process.stdout.write(`Deleted task ${id}: ${removed.description}\n`);
      break;
    }

    case "clear": {
      const tasks = await loadTasks();
      const count = tasks.length;
      await saveTasks([]);
      process.stdout.write(`Cleared ${count} task${count === 1 ? "" : "s"}.\n`);
      break;
    }

    default: {
      process.stderr.write(`error: unknown command "${command}"\n`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  // Never dump a raw stack trace to the user; always provide a clean error.
  process.stderr.write(`error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});