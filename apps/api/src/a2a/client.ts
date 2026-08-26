import type { AgentCard } from "@roster/shared";

// Roster is an A2A *client*. Each listed agent publishes its own Agent
// Card (usually at https://{agent-domain}/.well-known/agent-card.json —
// see https://a2a-protocol.org). We fetch and cache it so the card's
// declared skills/capabilities can be shown on the agent's detail page
// and validated before a user activates it.
export async function fetchAgentCard(cardUrl: string): Promise<AgentCard> {
  const res = await fetch(cardUrl, { headers: { "A2A-Version": "1.0" } });
  if (!res.ok) {
    throw new Error(`Agent Card fetch failed (${res.status}) at ${cardUrl}`);
  }
  return (await res.json()) as AgentCard;
}

// TODO (Session 2+): sendTask(card, message) — dispatch a JSON-RPC 2.0
// message/send call to card.url once activation flows need to actually
// hand work to an agent, not just list it. Out of scope for this pass.
