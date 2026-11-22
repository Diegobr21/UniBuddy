// PLACEHOLDER for the AI triage. In the real platform this calls Jev (TypeSafe) with
// questions such as "is it offensive?", "does it contain personal data?", "is it relevant?".
// Here a few simple rules give the moderator something realistic to look at.
import type { AiCheck, Visibility } from '@unibuddy/data';

const offensiveWords = ['idiot', 'stupid', 'hate', 'imbecil', 'estupido'];

export function mockTriage(text: string, chosen: Visibility): AiCheck {
  const lower = text.toLowerCase();

  // A capitalised first name followed by an initial ("Laura M."), an email or a phone number
  const personal =
    /\b[A-ZÁÉÍÓÚ][a-záéíóúñ]+ [A-Z]\./.test(text) ? 'a person’s name'
    : /\S+@\S+\.\S+/.test(text) ? 'an email address'
    : /\+?\d[\d\s]{7,}\d/.test(text) ? 'a phone number'
    : false;

  return {
    offensive: offensiveWords.some((w) => lower.includes(w)),
    personalData: personal,
    relevant: text.trim().length >= 40,
    suggestedVisibility: chosen,
  };
}
