# todo-cli

A production-quality command-line todo application with persistent JSON storage.

## Language & Storage Rationale

**Language: TypeScript (Bun runtime).** TypeScript is chosen for its type safety and wide ecosystem. The Bun runtime provides fast startup, a built-in test runner, and native TypeScript execution without a separate compilation step, making development iteration quick.

**Storage format: JSON.** JSON is human-readable, trivially parseable, and requires no database setup. Data is stored in `~/.todo-cli/tasks.json`, keeping each user's tasks isolated. The format is portable and can be inspected directly with any text editor or JSON tool.

## How to Build

No build step required. The project uses Bun, which runs TypeScript directly:

```bash
bun install
```

## How to Run

```bash
bun run src/cli.ts [command] [options]
```

Or use the npm script alias:

```bash
bun start -- add "Buy milk"
```

## How to Test

```bash
bun test
```

This runs the full test suite (21 tests covering all commands, persistence, error handling, and edge cases).

## Usage

```
todo add <description>     Add a new task with the given description
todo list                  List all tasks with their done/undone status
todo complete <id>         Mark a task as complete by its id
todo delete <id>           Delete a task by its id
todo --help, -h            Show this help message
```

### Examples

```bash
# Add tasks
bun run src/cli.ts add "Buy groceries"
bun run src/cli.ts add "Write documentation"

# List tasks (shows [ ] for undone, [✓] for done)
bun run src/cli.ts list

# Mark a task complete
bun run src/cli.ts complete 1

# Delete a task
bun run src/cli.ts delete 2

# Get help
bun run src/cli.ts --help
```

## Error Handling

Invalid input produces clear error messages on stderr with a non-zero exit code. The tool never dumps a raw stack trace.