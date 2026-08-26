// Types for the Agent2Agent (A2A) protocol — https://a2a-protocol.org
// Roster acts as an A2A *client*: it discovers each listed agent's own
// Agent Card (served by that agent's operator, typically via BNB Agent
// Studio) and, later, dispatches tasks to it. Roster does not implement
// the A2A *server* role for individual agents — that's owned by whoever
// deployed the agent. A2A covers discovery/messaging only, not payment —
// see the README for how that gap is handled.

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export interface AgentCard {
  name: string;
  description: string;
  url: string; // primary A2A service endpoint
  version: string;
  preferredTransport: "JSONRPC" | "GRPC" | "HTTP+JSON";
  capabilities: {
    streaming?: boolean;
    pushNotifications?: boolean;
    stateTransitionHistory?: boolean;
  };
  authentication?: { schemes: string[] };
  skills: AgentSkill[];
}

export type A2ATaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "auth-required"
  | "completed"
  | "failed"
  | "canceled"
  | "rejected";

export interface A2ATaskStatus {
  taskId: string;
  contextId: string | null;
  state: A2ATaskState;
}
