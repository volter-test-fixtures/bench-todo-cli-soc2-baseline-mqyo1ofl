# todo-cli

A persistent command-line todo application built with **Bun** (TypeScript).

Tasks are stored as a JSON file at `~/.todo-cli/tasks.json`, so they persist between invocations.

## Quick Start

```bash
# Install dependencies (none required — Bun runs TypeScript natively)
bun install

# Run the CLI
bun run src/cli.ts --help
```

## Usage

```bash
# Add a task
bun run src/cli.ts add "Buy groceries"

# List all tasks
bun run src/cli.ts list

# Mark a task as complete
bun run src/cli.ts complete 1

# Delete a task
bun run src/cli.ts delete 1

# Show help
bun run src/cli.ts --help
```

## Running Tests

```bash
bun test
```

All tests run each CLI command as a separate subprocess, proving that tasks persist across restarts.

## Design Rationale

**Language: TypeScript (Bun runtime)**

TypeScript was chosen for its wide ecosystem, static typing, and excellent developer tooling. Bun was chosen as the runtime because it runs TypeScript natively without a compilation step, provides a built-in test runner, and starts subprocesses very quickly — all of which make the CLI responsive and the tests fast.

**Storage: JSON file**

A JSON file at `~/.todo-cli/tasks.json` was chosen for persistence because:
- It requires no database setup or external dependencies.
- The file is human-readable and editable with any text editor.
- For a personal CLI todo app with dozens (not millions) of tasks, JSON is more than sufficient.
- It naturally survives reboots and concurrent terminal sessions.

## Build

No build step is required. Bun executes the TypeScript source directly.

```bash
# Verify the app works
bun run src/cli.ts --help
```