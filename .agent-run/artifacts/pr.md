## Summary

Implements a production-quality CLI todo application from scratch with add, list, complete, and delete commands and persistent JSON storage.

### What changed

- `src/cli.ts` — Main CLI entry point with add/list/complete/delete commands, `--help`/`-h` support, error handling with descriptive messages on stderr, and non-zero exit codes for invalid input
- `src/storage.ts` — Task model and JSON persistence to `~/.todo-cli/tasks.json` with load/save cycle
- `src/cli.test.ts` — 21 end-to-end tests covering all commands (ac/01), persistence across invocations (ac/02), error handling and `--help` (ac/03), and verification that no raw stack traces are emitted
- `package.json` — Added `start` and `test` scripts
- `README.md` — Documents build/run/test instructions, usage examples, language and storage rationale

### Tests run

All 21 tests pass via `bun test`:

```
 21 pass
 0 fail
 69 expect() calls
```