// AUTO-GENERATED from https://api.bizverify.co/mcp — do not edit by hand.
// Regenerate with: node scripts/gen-snapshot.mjs
// Used only as an offline fallback for tools/list; live calls always proxy
// to the hosted server.
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const INSTRUCTIONS: string = "BizVerify is a business entity verification API. You can search and verify businesses across 50 US states and international jurisdictions.\n\nAvailable tools:\n- get_config: Get service configuration and available jurisdictions\n- list_jurisdictions: List supported jurisdictions with active status\n- verify_business: Confirm a specific named business's existence, status, and good standing in one jurisdiction — the primary verification tool (requires auth)\n- search_entities: Discover/list candidate businesses when the exact entity is unknown (requires auth)\n- check_job_status: Check the status of a verification job (requires auth)\n- get_entity: Get entity details from cache (requires auth)\n- get_entity_history: Get verification history for an entity (requires auth)\n- get_account: View your account info and credit balance (requires auth)\n- purchase_credits: Purchase additional credits (requires auth)\n\nChoosing between verify and search: use verify_business whenever the user wants to verify, check, or confirm a specific company — even if they have not named it yet (ask for the name, then verify). Use search_entities only to discover candidates when the exact entity is genuinely unknown. Do not substitute search_entities for verify_business.\n\nTools marked (requires auth) need an OAuth access token via Authorization: Bearer header.";

export const TOOLS_SNAPSHOT: Tool[] = [
  {
    "name": "get_config",
    "title": "Get Configuration",
    "description": "Returns BizVerify's public configuration as readable text: active US and international jurisdictions, per-operation credit costs, the free-tier allowance, credit packages with pricing, feature flags, and documentation/legal links. Free and requires no authentication. Call this first to discover what jurisdictions are supported and what each operation costs before verifying.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    },
    "annotations": {
      "readOnlyHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "list_jurisdictions",
    "title": "List Jurisdictions",
    "description": "Lists every registered jurisdiction with its code, active/inactive status, and supported capabilities — search, entity lookup, quick verification, and deep verification. Free and requires no authentication. Use it to confirm a state or country is supported and which verification tiers it offers before calling verify_business or search_entities.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    },
    "annotations": {
      "readOnlyHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "verify_business",
    "title": "Verify Business",
    "description": "Confirm a specific, named business in one jurisdiction — the PRIMARY tool whenever the user wants to verify, check, confirm, or look up a company's existence, status, good standing, or details (e.g. \"verify Acme LLC in Delaware\", \"is Acme registered in FL?\", \"I need to verify a company in Delaware\"). If the user has verification intent but has not given the exact company name, ASK them for the name and use THIS tool — do NOT fall back to search_entities. Two tiers: quick (1 credit) returns existence + status + good-standing. Deep (15 credits, or 25 with force_refresh) adds entity type, formation date, registered agent, officers, principal address, and filing history. Deep is available in a subset of jurisdictions; requesting deep where unavailable returns a quick result with a reason. Requires authentication; deducts credits only on a successful match.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "entity_name": {
          "type": "string",
          "description": "Business entity name to verify"
        },
        "jurisdiction": {
          "type": "string",
          "description": "Jurisdiction code or name (e.g., \"us-fl\", \"Florida\", \"FL\")"
        },
        "entity_type": {
          "description": "Optional entity type filter to narrow results",
          "type": "string",
          "enum": [
            "llc",
            "corporation",
            "lp",
            "llp",
            "sole_proprietorship",
            "nonprofit",
            "general_partnership",
            "other"
          ]
        },
        "level": {
          "default": "quick",
          "description": "Verification tier: quick (1 credit, always available) or deep (15 credits, availability varies by jurisdiction)",
          "type": "string",
          "enum": [
            "quick",
            "deep"
          ]
        },
        "force_refresh": {
          "default": false,
          "description": "Bypass cache to return the most current result (deep tier only; adds 10 credits)",
          "type": "boolean"
        },
        "webhook_url": {
          "description": "URL to receive async results",
          "type": "string",
          "format": "uri"
        }
      },
      "required": [
        "entity_name",
        "jurisdiction"
      ]
    },
    "annotations": {
      "readOnlyHint": false,
      "openWorldHint": true,
      "destructiveHint": false,
      "idempotentHint": false
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "search_entities",
    "title": "Search Entities",
    "description": "Discover candidate businesses when the exact entity is UNKNOWN — a listing/discovery tool, NOT a verification tool. Use only when the user wants to browse or list multiple companies matching a partial or fuzzy name, or does not yet know which specific entity they mean. If the user can name one specific company they want to confirm or check, use verify_business instead (ask them for the name first if needed). Costs 2 credits per jurisdiction searched and requires authentication.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Business name search query"
        },
        "jurisdiction": {
          "description": "Jurisdiction code or name (omit to search all active)",
          "type": "string"
        },
        "entity_type": {
          "description": "Filter by entity type",
          "type": "string"
        },
        "limit": {
          "default": 50,
          "description": "Maximum number of results to return (1-200, default 50)",
          "type": "integer",
          "minimum": 1,
          "maximum": 200
        },
        "offset": {
          "default": 0,
          "description": "Number of results to skip for pagination (default 0)",
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "query"
      ]
    },
    "annotations": {
      "readOnlyHint": false,
      "openWorldHint": true,
      "destructiveHint": false,
      "idempotentHint": false
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "check_job_status",
    "title": "Check Job Status",
    "description": "Poll a long-running (async) verification job created by verify_business. Returns the full verification result once complete, a failure reason if it failed, or a \"still processing\" status to poll again. Free — no credits charged — but requires authentication. Pass the job_id from the verify_business async response.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "job_id": {
          "type": "string",
          "description": "Job ID returned by verify_business when it runs asynchronously"
        }
      },
      "required": [
        "job_id"
      ]
    },
    "annotations": {
      "readOnlyHint": true,
      "openWorldHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "get_entity",
    "title": "Get Entity",
    "description": "Fetch a previously verified business entity from BizVerify's cache by its ID — returns name, jurisdiction, status, type, good-standing, formation date, registered agent, and the number of snapshots on record. Free and read-only; does NOT run a fresh scrape (use verify_business with force_refresh for live data). Requires authentication. Pass an entity_id returned by a prior verify_business or search_entities call.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "entity_id": {
          "type": "string",
          "description": "Entity ID returned by a prior verify_business or search_entities result"
        }
      },
      "required": [
        "entity_id"
      ]
    },
    "annotations": {
      "readOnlyHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "get_entity_history",
    "title": "Get Entity History",
    "description": "Returns the chronological verification snapshots recorded for an entity — each with a timestamp, name, and status — newest first, with pagination. Costs 5 credits and requires authentication. Use it to see how a company's status or details have changed over time.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "entity_id": {
          "type": "string",
          "description": "Entity ID to retrieve history for"
        },
        "limit": {
          "default": 10,
          "description": "Maximum number of history snapshots to return (1-100, default 10)",
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        },
        "offset": {
          "default": 0,
          "description": "Number of snapshots to skip for pagination (default 0)",
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "entity_id"
      ]
    },
    "annotations": {
      "readOnlyHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "get_account",
    "title": "Get Account",
    "description": "Returns your BizVerify account summary: email and verification status, plan, current credit balance, member-since date, and your active and revoked API keys. Free and read-only; requires authentication. Use it to check your remaining credit balance before running paid verifications.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {}
    },
    "annotations": {
      "readOnlyHint": true,
      "idempotentHint": true
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  },
  {
    "name": "purchase_credits",
    "title": "Purchase Credits",
    "description": "Starts a credit purchase: creates a Stripe checkout session for the chosen package and returns a payment URL to present to the user. Does NOT charge immediately and does NOT add credits until the user completes payment — credits are then added automatically. Requires authentication. Packages: credits_100, credits_500, credits_2000, credits_10000 (see get_config for current prices).",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "package_id": {
          "type": "string",
          "enum": [
            "credits_100",
            "credits_500",
            "credits_2000",
            "credits_10000"
          ],
          "description": "Credit package to purchase: credits_100, credits_500, credits_2000, or credits_10000"
        }
      },
      "required": [
        "package_id"
      ]
    },
    "annotations": {
      "readOnlyHint": false,
      "openWorldHint": true,
      "idempotentHint": false
    },
    "execution": {
      "taskSupport": "forbidden"
    }
  }
];
