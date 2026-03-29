# Ruflo Integration — Esenza Site

## What was installed

[Ruflo](https://github.com/ruvnet/ruflo) v3.5.x — multi-agent orchestration platform for Claude Code.

### Files generated

| Path | Description |
|------|-------------|
| `.claude-flow/` | Runtime config, data, logs, sessions |
| `.claude/settings.json` | Claude Code hooks (7 hook types) |
| `.claude/skills/` | 30 specialized skills |
| `.claude/commands/` | 10 slash commands |
| `.claude/agents/` | 99 pre-configured agents |
| `.claude/helpers/` | Helper utilities |
| `.mcp.json` | MCP server configuration |

### MCP Integration

Ruflo was added as a local MCP server for Claude Code:

```
claude mcp add ruflo -- npx -y ruflo@latest mcp start
```

## How to start again

```bash
# Check health
npm run ruflo:doctor

# Start MCP server (auto-starts when Claude Code connects)
npm run ruflo:mcp

# List available agents
npm run ruflo:agents

# General help
npm run ruflo:help
```

## Usage in this project

Inside Claude Code, Ruflo tools are available automatically via MCP. You can:

- Use swarm orchestration for complex multi-file tasks
- Access 99 specialized agents (code review, testing, architecture, etc.)
- Use memory persistence across sessions
- Run parallel agent workflows

### Quick commands

```bash
npx ruflo@latest doctor --fix    # Fix environment issues
npx ruflo@latest daemon start    # Start background workers
npx ruflo@latest memory init     # Initialize memory database
npx ruflo@latest swarm init      # Initialize a swarm
```

## Notes

- Ruflo runs via `npx` (not installed as a dependency) to keep the project clean
- MCP server starts on-demand when Claude Code connects
- No production code was modified during integration
