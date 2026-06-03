import { writeFileSync } from "node:fs";

const ENDPOINT = "https://api.bizverify.co/mcp";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

async function rpc(method, params, id) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  const line = text.split("\n").find((l) => l.startsWith("data:"));
  if (!line) throw new Error(`no data line for ${method}: ${text.slice(0, 200)}`);
  const msg = JSON.parse(line.slice(line.indexOf(":") + 1).trim());
  if (msg.error) throw new Error(`${method} error: ${JSON.stringify(msg.error)}`);
  return msg.result;
}

const init = await rpc(
  "initialize",
  {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "snapshot-gen", version: "0.0.0" },
  },
  1,
);
const list = await rpc("tools/list", {}, 2);

const instructions = init.instructions ?? "";
const tools = list.tools ?? [];
if (tools.length === 0) throw new Error("no tools returned");

const banner =
  "// AUTO-GENERATED from " +
  ENDPOINT +
  " — do not edit by hand.\n" +
  "// Regenerate with: node scripts/gen-snapshot.mjs\n" +
  "// Used only as an offline fallback for tools/list; live calls always proxy\n" +
  "// to the hosted server.\n";

const body =
  banner +
  'import type { Tool } from "@modelcontextprotocol/sdk/types.js";\n\n' +
  "export const INSTRUCTIONS: string = " +
  JSON.stringify(instructions) +
  ";\n\n" +
  "export const TOOLS_SNAPSHOT: Tool[] = " +
  JSON.stringify(tools, null, 2) +
  ";\n";

writeFileSync(new URL("../src/tools-snapshot.ts", import.meta.url), body);
console.log(`wrote tools-snapshot.ts with ${tools.length} tools`);
