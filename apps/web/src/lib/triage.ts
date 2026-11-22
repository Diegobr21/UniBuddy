// First check of every new story, before a human moderator sees it.
// With a Jev key: five questions to Jev in a single call. Without one (or if Jev fails): simple rules.
import { topics, type AiCheck, type TopicId, type Visibility } from '@unibuddy/data';
import { askJev, jevConfigured, type JevEnv } from './jev';

export interface TriageInput {
  text: string;
  question: string;
  topicId: TopicId;
  /** What the author picked. The suggestion never makes a story MORE public than its author wanted. */
  chosenVisibility: Visibility;
}

const USEFUL_LEVELS = ['Not useful or off-topic', 'Somewhat useful', 'Clear, practical advice'];

export async function triage(input: TriageInput, env: JevEnv): Promise<AiCheck> {
  if (jevConfigured(env)) {
    try {
      return await triageWithJev(input, env);
    } catch (error) {
      console.error('Jev triage failed, using the fallback rules:', error);
      return { ...triageWithRules(input), checkedBy: 'rules-jev-unavailable' };
    }
  }
  return triageWithRules(input);
}

async function triageWithJev(input: TriageInput, env: JevEnv): Promise<AiCheck> {
  // The story is data written by a student: Jev only answers closed questions about it
  const state = {
    question_the_student_answered: input.question,
    topic_picked_by_the_student: topics.find((t) => t.id === input.topicId)?.label,
    student_answer: input.text,
  };

  const answers = await askJev(
    state,
    {
      offensive: {
        type: 'noul',
        instructions: 'Does the student answer contain insults, harassment, discrimination, sexual content or spam?',
      },
      personal_data: {
        type: 'noul',
        instructions:
          'Does the answer identify a specific private person other than the author (for example a name, or a name with an initial), or include an email address, phone number or home address?',
      },
      useful: {
        type: 'score',
        instructions: 'How useful is this answer for a future student who asks the same question?',
        criteria: USEFUL_LEVELS,
      },
      topic: {
        type: 'choice',
        instructions: 'Which topic does the answer really talk about?',
        criteria: Object.fromEntries(topics.map((t) => [t.id, t.label])),
      },
      visibility: {
        type: 'choice',
        instructions: 'Who should be able to read this answer?',
        criteria: {
          public: 'General advice that any current or prospective student could read',
          university: 'Mentions internal details of the university (specific staff, internal processes, private events) better kept for its members',
        },
      },
    },
    env,
  );

  const offensive = answers.offensive?.noul ?? 0;
  const personal = answers.personal_data?.noul ?? 0;
  const usefulScore = answers.useful?.score ?? 0;
  const topic = answers.topic;
  const jevVisibility = answers.visibility?.choice === 'public' ? 'public' : 'university';

  return {
    offensive: offensive > 0.5,
    personalData: personal > 0.5 ? 'may identify a person or contact details' : false,
    relevant: usefulScore >= 1,
    suggestedVisibility: input.chosenVisibility === 'university' ? 'university' : jevVisibility,
    checkedBy: 'jev',
    confidence: { offensive, personalData: personal, useful: usefulScore / (USEFUL_LEVELS.length - 1) },
    topicSuggestion:
      topic?.choice && topic.choice !== input.topicId && (topic.confidence ?? 0) > 0.6 ? (topic.choice as TopicId) : undefined,
  };
}

const offensiveWords = ['idiot', 'stupid', 'hate', 'imbecil', 'estupido'];

/** Fallback when there is no Jev key: a few simple rules so the moderator still gets hints. */
export function triageWithRules({ text, chosenVisibility }: TriageInput): AiCheck {
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
    relevant: text.trim().length >= 25,
    suggestedVisibility: chosenVisibility,
    checkedBy: 'rules',
  };
}
