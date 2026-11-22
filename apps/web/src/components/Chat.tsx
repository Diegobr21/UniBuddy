import { useRef, useState } from 'react';
import type { Answer } from '../lib/answer';

interface Message {
  from: 'student' | 'assistant';
  text: string;
  details?: Answer;
}

interface Props {
  suggestions: string[];
  universityName: string | null;
  isMember: boolean;
  signInHref: string;
}

const Svg = ({ d, size = 16 }: { d: string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((path) => (
      <path key={path} d={path} />
    ))}
  </svg>
);

export default function Chat({ suggestions, universityName, isMember, signInHref }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setDraft('');
    setBusy(true);
    setMessages((m) => [...m, { from: 'student', text }]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data: Answer = await response.json();
      setMessages((m) => [...m, { from: 'assistant', text: data.answer, details: data }]);
    } catch {
      setMessages((m) => [...m, { from: 'assistant', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
    }
  }

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    ask(draft);
  }

  return (
    <div className="chat">
      <div className="chat__messages" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat__empty">Ask anything about student life: housing, recruiting, paperwork, classes. Answers come from people who have been there.</p>
        )}

        {messages.map((m, i) =>
          m.from === 'student' ? (
            <div key={i} className="bubble bubble--student">{m.text}</div>
          ) : (
            <div key={i} className="chat__answer">
              <div className="bubble bubble--assistant">
                <p>{m.text}</p>
                {m.details && m.details.sources.length > 0 && (
                  <div className="chips">
                    <span className="badge"><Svg d={['M4 19V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z']} size={14} />Based on {m.details.sources.length} {m.details.sources.length === 1 ? 'story' : 'stories'}</span>
                    {m.details.sources.some((s) => s.visibility === 'university') && (
                      <span className="badge badge--warn"><Svg d={['M8 11V8a4 4 0 0 1 8 0v3', 'M5 11h14v9H5z']} size={14} />{universityName} students only</span>
                    )}
                    {m.details.sources.every((s) => s.visibility === 'public') && <span className="badge badge--red">Public stories</span>}
                  </div>
                )}
              </div>

              {m.details && !isMember && m.details.hiddenCount > 0 && universityName && (
                <div className="card card--dashed locked">
                  <strong>More answers for {universityName} students</strong>
                  <span className="small">Some stories on this topic are shared only with {universityName} students and alumni.</span>
                  <a className="btn btn--outline-red" href={signInHref}>Sign in with {universityName}</a>
                </div>
              )}

              {m.details?.contact && isMember && (
                <div className="card card--tint handoff">
                  <Svg d={['M4 21a8 8 0 0 1 16 0', 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8']} size={22} />
                  <div className="handoff__text">
                    <strong>Want to talk to a person?</strong>
                    <span>{m.details.contact.description}</span>
                  </div>
                  <button type="button" className="btn btn--primary handoff__btn" title="Prototype: the university's official contact goes here">Contact</button>
                </div>
              )}
            </div>
          ),
        )}
        {busy && <p className="small">MBA Buddy is thinking…</p>}
        <div ref={endRef} />
      </div>

      <div className="chips chat__suggestions">
        {suggestions.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => ask(s)} disabled={busy}>{s}</button>
        ))}
      </div>

      <form className="chat__composer" onSubmit={onSubmit}>
        <label htmlFor="ask" className="visually-hidden">Ask a question</label>
        <input id="ask" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask anything, in any language" maxLength={500} autoComplete="off" />
        <button type="submit" className="btn btn--primary chat__send" aria-label="Send" disabled={busy || !draft.trim()}>
          <Svg d={['M5 12h14', 'M13 6l6 6-6 6']} size={18} />
        </button>
      </form>
    </div>
  );
}
