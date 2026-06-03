# BizVerify MCP Server

> KYB for AI agents — verify and search business entities across US state and international company registries, straight from any MCP client.

[![Glama score](https://glama.ai/mcp/servers/BizVerify/bizverify-mcp/badges/score.svg)](https://glama.ai/mcp/servers/BizVerify/bizverify-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[BizVerify](https://bizverify.co) confirms a company's legal existence, status, good standing, registered agent, officers, and filing history by reading official government business registries in real time.

The canonical BizVerify MCP server is **hosted** as a Streamable HTTP endpoint:

```
https://api.bizverify.co/mcp
```

This repository packages that server as a local **stdio bridge** (plus a Docker image) for MCP clients and sandboxes that expect a local process. The bridge is a thin transparent proxy — tool definitions and results come directly from the hosted server, so it never drifts out of sync.

## Tools

| Tool | Auth | What it does |
|------|------|--------------|
| `get_config` | – | Supported jurisdictions, credit pricing, packages, features |
| `list_jurisdictions` | – | All jurisdictions with capabilities and active status |
| `verify_business` | ✅ | Confirm a named business in one jurisdiction — existence, status, good standing (quick), plus entity type, formation date, registered agent, officers, principal address and filings (deep) |
| `search_entities` | ✅ | Discover candidate businesses by name across one or all active jurisdictions |
| `check_job_status` | ✅ | Poll an async verification job (free) |
| `get_entity` | ✅ | Retrieve cached entity data by ID (free) |
| `get_entity_history` | ✅ | Historical verification snapshots for an entity |
| `get_account` | ✅ | Account details and credit balance |
| `purchase_credits` | ✅ | Create a Stripe checkout session for more credits |

Tools marked ✅ require an API key (or OAuth token). `get_config` and `list_jurisdictions` are free and unauthenticated.

## Quick start

### Option A — Hosted endpoint (recommended)

If your client supports remote MCP servers, just point it at `https://api.bizverify.co/mcp` and send your key as an `X-API-Key` header (OAuth 2.1 Bearer tokens are also accepted).

For stdio-only clients, bridge the hosted endpoint with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "bizverify": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://api.bizverify.co/mcp",
        "--header", "X-API-Key:${BIZVERIFY_API_KEY}"
      ],
      "env": { "BIZVERIFY_API_KEY": "your-api-key" }
    }
  }
}
```

### Option B — This bridge (from source)

```bash
git clone https://github.com/BizVerify/bizverify-mcp.git
cd bizverify-mcp
npm install
npm run build
```

Then register it with your client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "bizverify": {
      "command": "node",
      "args": ["/absolute/path/to/bizverify-mcp/dist/index.js"],
      "env": { "BIZVERIFY_API_KEY": "your-api-key" }
    }
  }
}
```

### Option C — Docker

```bash
docker build -t bizverify-mcp .
docker run -i --rm -e BIZVERIFY_API_KEY=your-api-key bizverify-mcp
```

```json
{
  "mcpServers": {
    "bizverify": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BIZVERIFY_API_KEY", "bizverify-mcp"],
      "env": { "BIZVERIFY_API_KEY": "your-api-key" }
    }
  }
}
```

## Configuration

| Env var | Required | Default | Description |
|---------|----------|---------|-------------|
| `BIZVERIFY_API_KEY` | For authenticated tools | – | Your BizVerify API key, sent as `X-API-Key`. `get_config` and `list_jurisdictions` work without it. |
| `BIZVERIFY_MCP_URL` | No | `https://api.bizverify.co/mcp` | Override the upstream MCP endpoint. |

## Getting an API key

Create one in seconds — new accounts get **50 free credits**:

```bash
# 1. Request an access code (sent by email)
curl -X POST https://api.bizverify.co/v1/auth/request-access \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","accept_terms":true}'

# 2. Exchange the 6-digit code for an API key
curl -X POST https://api.bizverify.co/v1/auth/verify-access \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","code":"123456","label":"mcp"}'
```

See the [setup guide](https://bizverify.co/mcp/) and [docs](https://docs.bizverify.co) for full details.

## Development

```bash
npm install
npm run build        # compile to dist/
npm run typecheck    # type-check only
npm start            # run the stdio bridge

# Refresh the offline tool snapshot from the live endpoint
node scripts/gen-snapshot.mjs
```

The bundled `src/tools-snapshot.ts` is used **only** as an offline fallback for `tools/list` (e.g. during a sandboxed container check). Live calls always proxy to the hosted server.

## Links

- 🌐 Website: https://bizverify.co
- 🔌 MCP setup guide: https://bizverify.co/mcp/
- 📚 Docs: https://docs.bizverify.co
- 🧩 Glama connector: https://glama.ai/mcp/connectors/co.bizverify/mcp

## License

[MIT](./LICENSE) © BizVerify
