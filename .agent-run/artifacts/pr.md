## todo-cli: greenfield implementation

Implements a persistent command-line todo application per issue #1.

**Commands**: `add`, `list`, `complete`, `delete`, `--help`
**Language**: TypeScript on Bun (no build step required)
**Persistence**: JSON file at `~/.todo-cli/tasks.json`
**Tests**: 16 tests covering all commands, error paths, and persistence

### Files changed
- `src/cli.ts` — main CLI entry point and command dispatch
- `src/types.ts` — Task and TaskStore data types
- `src/storage.ts` — file-based JSON persistence
- `src/cli.test.ts` — end-to-end test suite (via subprocess invocation)
- `README.md` — usage, rationale, build/run/test instructions
- `package.json` — added `todo` and `test` scripts

### Tests run
- `bun test` — all 16 tests passing (39 expect calls)
- Manual smoke test confirmed add/list/complete/delete workflow