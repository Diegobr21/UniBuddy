// Jev (TypeSafe) answers closed questions about a text with numbers the code can use directly:
// `noul` = probability of "yes", `choice` = one option + confidence, `score` = a level on a scale.
// It does not write text, so it is fast and cheap for checks like moderation.

export interface JevEnv {
  JEV_API_KEY?: string;
  /** Defaults to TypeSafe's API. Can point to a proxy that adds the key, as in the MWC workshop. */
  JEV_API_URL?: string;
  JEV_MODEL?: string;
}

export type JevQuestion =
  | { type: 'noul'; instructions: unknown }
  | { type: 'choice'; instructions: unknown; criteria: Record<string, string> }
  | { type: 'score'; instructions: unknown; criteria: string[] };

export interface JevAnswer {
  noul?: number;
  choice?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  score?: number;
}

export const jevConfigured = (env: JevEnv) => Boolean(env.JEV_API_KEY);

/** Sends a state and several questions in ONE call. Returns the answers by question name. */
export async function askJev(
  state: unknown,
  questions: Record<string, JevQuestion>,
  env: JevEnv,
): Promise<Record<string, JevAnswer>> {
  const url = env.JEV_API_URL || 'https://api.typesafe.ai/v1/systemone';
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.JEV_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: env.JEV_MODEL || 'jev-latest', state, questions }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Jev answered ${response.status}: ${data.error?.message ?? JSON.stringify(data.detail ?? data)}`);
  }
  return data.answers;
}
