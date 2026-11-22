import { useState } from 'react';
import type { ActionProposal, ActionResult } from '../lib/action-types';

// A university procedure the assistant prepared from the student's message.
// The form is pre-filled but NOTHING is sent until the student presses Confirm.

type Status = 'editing' | 'sending' | 'done' | 'failed' | 'cancelled';

export default function ActionCard({ proposal, onDone }: { proposal: ActionProposal; onDone?: () => void }) {
  const [values, setValues] = useState(proposal.values);
  const [status, setStatus] = useState<Status>('editing');
  const [result, setResult] = useState<ActionResult | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const locked = status !== 'editing' && status !== 'failed';

  async function confirm(event: { preventDefault(): void }) {
    event.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch('/api/uni-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: proposal.tool, values }),
      });
      const data: ActionResult = await response.json();
      setResult(data);
      setStatus(data.ok ? 'done' : 'failed');
    } catch {
      setResult({ ok: false, text: 'Something went wrong. Please try again.' });
      setStatus('failed');
    } finally {
      onDone?.();
    }
  }

  return (
    <form className="card action" onSubmit={confirm} aria-label={proposal.title}>
      <div className="action__head">
        <strong>{proposal.title}</strong>
        <span className="badge badge--red">{proposal.university} · via MCP</span>
      </div>

      {proposal.fields.map((field) => {
        const id = `${proposal.tool}-${field.name}`;
        const set = (value: string) => setValues((v) => ({ ...v, [field.name]: value }));
        return (
          <div className="field" key={field.name}>
            <label className="label" htmlFor={id}>{field.label}</label>
            {field.kind === 'select' ? (
              <select id={id} className="select" value={values[field.name] ?? ''} onChange={(e) => set(e.target.value)} disabled={locked} required={field.required}>
                {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                id={id}
                className="input"
                type={field.kind === 'date' ? 'date' : 'text'}
                min={field.kind === 'date' ? today : undefined}
                value={values[field.name] ?? ''}
                onChange={(e) => set(e.target.value)}
                disabled={locked}
                required={field.required}
              />
            )}
          </div>
        );
      })}

      {result && (
        <p className={`notice ${result.ok ? 'action__ok' : 'action__error'}`} role="status">{result.text}</p>
      )}

      {status === 'cancelled' && <p className="small">Cancelled. Nothing was sent to the university.</p>}

      {(status === 'editing' || status === 'failed' || status === 'sending') && (
        <div className="action__buttons">
          <button type="button" className="btn" onClick={() => setStatus('cancelled')} disabled={status === 'sending'}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Confirm and send'}</button>
        </div>
      )}
      {status === 'editing' && <span className="small">Nothing is sent until you confirm.</span>}
    </form>
  );
}
