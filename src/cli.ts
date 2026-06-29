#!/usr/bin/env node

import { init, addTask, listTasks, completeTask, deleteTask } from "./storage.js";

const USAGE = `Usage: todo <command> [options]

Commands:
  add <description>     Add a new task with the given description
  list                  List all tasks with their done/undone status
  complete <id>         Mark a task as complete by its id
  delete <id>           Delete a task by its id
  --help, -h            Show this help message`;

function parseId(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`error: invalid id "${raw}" — must be a positive integer`);
    process.exit(1);
  }
  return n;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];

  try {
    init();

    switch (command) {
      case "add": {
        const desc = args.slice(1).join(" ");
        if (!desc.trim()) {
          console.error("error: missing description — usage: todo add <description>");
          process.exit(1);
        }
        const task = addTask(desc.trim());
        console.log(`added task ${task.id}: ${task.description}`);
        break;
      }

      case "list": {
        const tasks = listTasks();
        if (tasks.length === 0) {
          console.log("no tasks");
          break;
        }
        for (const t of tasks) {
          const check = t.done ? "[✓]" : "[ ]";
          console.log(`${check} ${t.id}: ${t.description}`);
        }
        break;
      }

      case "complete": {
        if (args.length < 2) {
          console.error("error: missing task id — usage: todo complete <id>");
          process.exit(1);
        }
        const id = parseId(args[1]);
        const task = completeTask(id);
        if (!task) {
          console.error(`error: no task with id ${id}`);
          process.exit(1);
        }
        console.log(`completed task ${id}: ${task.description}`);
        break;
      }

      case "delete": {
        if (args.length < 2) {
          console.error("error: missing task id — usage: todo delete <id>");
          process.exit(1);
        }
        const id = parseId(args[1]);
        const task = deleteTask(id);
        if (!task) {
          console.error(`error: no task with id ${id}`);
          process.exit(1);
        }
        console.log(`deleted task ${id}: ${task.description}`);
        break;
      }

      default: {
        console.error(`error: unknown command "${command}"`);
        console.error(USAGE);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error("error: unexpected failure — please try again");
    process.exit(1);
  }
}

main();