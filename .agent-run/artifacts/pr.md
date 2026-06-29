## Add `clear` subcommand to remove all tasks

Adds a `todo clear` command that removes all tasks from persistent storage
and prints how many tasks were removed.

### Changes

- **src/cli.ts**: Added `clear` case to the command switch — loads tasks,
  counts them, saves an empty array, and prints the count.
- **src/cli.test.ts**: Added two tests:
  - `"clears all tasks and reports count"` — adds tasks, clears, verifies
    empty store and correct output.
  - `"clears empty store gracefully"` — clears an already-empty store,
    verifies `"Cleared 0 tasks."`.

### Tests

All 19 tests pass (`bun test`), including the 2 new clear tests.