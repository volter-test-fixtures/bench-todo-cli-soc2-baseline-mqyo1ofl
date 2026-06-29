# todo-cli

A production-quality command-line todo application built with **TypeScript** on **Bun**.

## Rationale

**Language: TypeScript (Bun)**

TypeScript was chosen for its strong type safety, wide ecosystem, and readability. Bun provides a batteries-included runtime with a built-in test runner, TypeScript transpilation, and fast startup — no build step or separate compiler needed. This keeps the tool lightweight and easy to develop.

**Storage format: JSON**

JSON was chosen as the persistence format because it is human-readable, trivially debuggable, requires no schema management, and is natively supported by the runtime. For a single-user CLI tool with modest data volumes, JSON is far simpler than SQLite or YAML and avoids external dependencies entirely. The data file lives at `~/.todo-cli/tasks.json` by default.

## Commands

| Command | Description |
|---|---|
| `todo add <description>` | Add a new task |
| `todo list` | Show all tasks with status |
| `todo complete <id>` | Mark a task done |
| `todo delete <id>` | Remove a task |
| `todo --help` | Show usage information |

## Build / Run

```bash
# Install dependencies (none required — bun is self-contained)
bun install

# Run the todo CLI
bun run todo add "Buy milk"
bun run todo list
bun run todo complete 1
bun run todo delete 1

# Or use the bin directly
bun run src/cli.ts add "Buy milk"
```

## Test

```bash
bun test
```

Tests exercise every command end-to-end via subprocess invocation, including error paths and persistence across restarts.

## Data Storage

Tasks are persisted to a JSON file at `~/.todo-cli/tasks.json`. The location can be overridden with the `TODO_DATA_DIR` environment variable.

## Exit Codes

- **0** — success
- **1** — error (unknown command, missing arguments, invalid task id, etc.)

The tool never dumps a raw stack trace. All errors produce a clear, user-facing message on stderr.