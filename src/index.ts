#!/usr/bin/env node
/**
 * BizVerify MCP server (local stdio bridge).
 *
 * BizVerify's canonical MCP server is hosted as a Streamable HTTP endpoint at
 * https://api.bizverify.co/mcp. This package exposes that server over stdio so
 * it can run inside MCP clients (Claude Desktop, Cursor, etc.) and containerised
 * environments that expect a local stdio server.
 *
 * It is a thin transparent proxy: tool definitions and results come straight
 * from the hosted server, so the local bridge never drifts out of sync. A
 * bundled snapshot of the tool list is used as a fallback for introspection
 * when the hosted endpoint is briefly unreachable (e.g. during a sandboxed
 * container check), so `initialize` + `tools/list` always succeed.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolResultSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { INSTRUCTIONS, TOOLS_SNAPSHOT } from "./tools-snapshot.js";

const VERSION = "0.1.0";
const DEFAULT_URL = "https://api.bizverify.co/mcp";
const CALL_TIMEOUT_MS = 120_000;

const endpoint = process.env.BIZVERIFY_MCP_URL ?? DEFAULT_URL;
const apiKey = process.env.BIZVERIFY_API_KEY;

/** Lazily-established connection to the hosted BizVerify MCP server. */
let upstream: Client | null = null;
let upstreamPromise: Promise<Client | null> | null = null;

async function connectUpstream(): Promise<Client | null> {
  if (upstream) return upstream;
  if (!upstreamPromise) {
    upstreamPromise = (async (): Promise<Client | null> => {
      try {
        const headers: Record<string, string> = {};
        if (apiKey) headers["X-API-Key"] = apiKey;

        const client = new Client(
          { name: "bizverify-mcp-bridge", version: VERSION },
          { capabilities: {} },
        );
        await client.connect(
          new StreamableHTTPClientTransport(new URL(endpoint), {
            requestInit: { headers },
          }),
        );
        upstream = client;
        return client;
      } catch (error) {
        // Reset so a later tool call can retry the connection.
        upstreamPromise = null;
        console.error(
          "[bizverify-mcp] upstream connect failed (will retry on demand):",
          error instanceof Error ? error.message : error,
        );
        return null;
      }
    })();
  }
  return upstreamPromise;
}

async function main(): Promise<void> {
  const server = new Server(
    { name: "bizverify", version: VERSION },
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS },
  );

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const client = await connectUpstream();
    if (client) {
      try {
        return await client.listTools(request.params);
      } catch (error) {
        console.error(
          "[bizverify-mcp] live tools/list failed, serving snapshot:",
          error instanceof Error ? error.message : error,
        );
      }
    }
    return { tools: TOOLS_SNAPSHOT };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const client = await connectUpstream();
    if (!client) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Unable to reach the BizVerify MCP endpoint at ${endpoint}. Check your network connection or BIZVERIFY_MCP_URL.`,
          },
        ],
      };
    }
    return client.callTool(request.params, CallToolResultSchema, {
      timeout: CALL_TIMEOUT_MS,
    });
  });

  await server.connect(new StdioServerTransport());

  // Warm the upstream connection in the background; failures are non-fatal.
  void connectUpstream();

  const shutdown = async (): Promise<void> => {
    await server.close().catch(() => {});
    await upstream?.close().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  // stderr only: stdout is reserved for the MCP stdio protocol.
  console.error("[bizverify-mcp] fatal:", error);
  process.exit(1);
});
