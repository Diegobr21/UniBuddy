// Browser side of the portal: talks to the portal's own API (/api/requests).
import type { PortalRequest } from '../lib/procedures';

export async function submit(body: Record<string, string>): Promise<PortalRequest> {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Error ${response.status}`);
  return data;
}

export async function fetchRequests(): Promise<PortalRequest[]> {
  const response = await fetch('/api/requests');
  return (await response.json()).requests;
}
