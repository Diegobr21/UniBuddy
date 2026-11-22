// The shapes every app shares. When the real database arrives, its tables follow these types.

export type Role = 'visitor' | 'student' | 'moderator' | 'admin';

/** Who is using the app right now. In the prototype it lives in a cookie; later it comes from the university SSO. */
export interface Session {
  role: Role;
  universityId: string | null;
}

export type Visibility = 'public' | 'university';

export type TopicId = 'academic' | 'career' | 'housing' | 'social' | 'city' | 'immigration';

export interface Topic {
  id: TopicId;
  label: string;
}

export interface Question {
  id: string;
  topicId: TopicId;
  text: string;
}

export interface Contact {
  team: string;
  /** Shown in the chat when the assistant suggests talking to a person */
  description: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  status: 'pilot' | 'demo' | 'coming-soon';
  /** How members sign in: the university portal (SSO) or a code sent to their university email */
  login: 'sso' | 'email';
  contacts: Partial<Record<TopicId, Contact>>;
}

export interface AiCheck {
  offensive: boolean;
  /** false, or a short description of what may be personal data */
  personalData: false | string;
  relevant: boolean;
  suggestedVisibility: Visibility;
  /** Who produced this check: Jev, the fallback rules (no key), or the rules because Jev did not answer */
  checkedBy?: 'jev' | 'rules' | 'rules-jev-unavailable';
  /** Jev's probabilities (0 to 1), shown to the moderator */
  confidence?: { offensive: number; personalData: number; useful: number };
  /** Set when Jev thinks the story belongs to a different topic than the one picked */
  topicSuggestion?: TopicId;
}

export interface Story {
  id: string;
  universityId: string;
  topicId: TopicId;
  questionId: string;
  text: string;
  /** Language the story was written in (ISO code) */
  language: string;
  authorType: 'student' | 'alumnus';
  visibility: Visibility;
  status: 'pending' | 'approved' | 'rejected';
  aiCheck: AiCheck;
  submittedAt: string;
}

export interface Release {
  version: string;
  status: 'live' | 'previous' | 'next';
  date: string;
  storyIds: string[];
}
