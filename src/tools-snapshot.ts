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
    "description": "Returns public configuration including supported jurisdictions, credit pricing, available packages, and features.",
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
    "description": "Returns all registered jurisdictions with their verification capabilities (quick, deep, search, entity lookup) and active status.",
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
    "description": "Confirm a specific, named business in one jurisdiction — the PRIMARY tool whenever the user wants to verify, check, confirm, or look up a company's existence, status, good standing, or details (e.g. \"verify Acme LLC in Delaware\", \"is Acme registered in FL?\", \"I need to verify a company in Delaware\"). If the user has verification intent but has not given the exact company name, ASK them for the name and use THIS tool — do NOT fall back to search_entities. Two tiers: quick (1 credit) returns existence + status + good-standing. Deep (15 credits, or 25 with force_refresh) adds entity type, formation date, registered agent, officers, principal address, and filing history. Deep is available in a subset of jurisdictions; requesting deep where unavailable returns a quick result with a reason.",
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
    "description": "Discover candidate businesses when the exact entity is UNKNOWN — a listing/discovery tool, NOT a verification tool. Use only when the user wants to browse or list multiple companies matching a partial or fuzzy name, or does not yet know which specific entity they mean. If the user can name one specific company they want to confirm or check, use verify_business instead (ask them for the name first if needed). Costs 2 credits per jurisdiction searched.",
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
    "description": "Poll an async verification job. Free — no credits charged.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "job_id": {
          "type": "string",
          "description": "Job ID from verify_business async response"
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
    "description": "Retrieve cached entity data by ID. Free — no credits charged.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "entity_id": {
          "type": "string",
          "description": "Entity ID from verify or search results"
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
    "description": "Get historical verification snapshots for an entity. Costs 5 credits.",
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
    "description": "Returns account details including credit balance and API keys.",
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
    "description": "Creates a Stripe checkout session and returns a payment URL. Present the URL to the user to complete payment.",
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
          "description": "Package ID: credits_100, credits_500, credits_2000, or credits_10000"
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
