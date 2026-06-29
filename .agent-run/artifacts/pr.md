## Summary

Greenfield implementation of a production-quality CLI todo application from the one-line brief.

### What changed

- **src/task.ts** — Task interface (`id`, `description`, `done`)
- **src/storage.ts** — JSON file persistence at `~/.todo-cli/tasks.json` (load/save with directory creation)
- **src/cli.ts** — CLI entry point supporting `add`, `list`, `complete`, `delete`, and `--help` commands; handles bad input with clean error messages and exit code 1; no raw stack trace dumps
- **src/cli.test.ts** — 17 end-to-end tests running each command as a subprocess (proving persistence across invocations)
- **package.json** — Added `start` and `test` scripts
- **README.md** — Full documentation with usage, test instructions, and design rationale

### Tests run

- `bun test` — 17 pass, 0 fail, 66 expect() calls (756ms)