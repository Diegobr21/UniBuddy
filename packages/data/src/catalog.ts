import type { Question, Topic, University } from './types';

export const topics: Topic[] = [
  { id: 'academic', label: 'Academic' },
  { id: 'career', label: 'Career and jobs' },
  { id: 'housing', label: 'Housing' },
  { id: 'social', label: 'Social life' },
  { id: 'city', label: 'Barcelona life' },
  { id: 'immigration', label: 'Immigration' },
];

export const questions: Question[] = [
  { id: 'housing-wish', topicId: 'housing', text: 'What do you wish you knew before looking for a flat?' },
  { id: 'housing-areas', topicId: 'housing', text: 'Which neighbourhoods worked well for you?' },
  { id: 'housing-lease', topicId: 'housing', text: 'What would you avoid when signing a lease?' },
  { id: 'career-start', topicId: 'career', text: 'When should you start preparing for internships?' },
  { id: 'career-mistake', topicId: 'career', text: 'What recruiting mistake would you warn others about?' },
  { id: 'academic-first-term', topicId: 'academic', text: 'How did you survive the first term workload?' },
  { id: 'social-section', topicId: 'social', text: 'How did you get to know people outside your section?' },
  { id: 'city-first-week', topicId: 'city', text: 'What should you sort out in your first week in the city?' },
  { id: 'immigration-tie', topicId: 'immigration', text: 'What helped you with the NIE / TIE paperwork?' },
];

/** Placeholder catalogue. IESE is the pilot; Demo University shows what an MCP-ready campus can do. */
export const universities: University[] = [
  {
    id: 'iese',
    name: 'IESE Business School',
    shortName: 'IESE',
    city: 'Barcelona',
    status: 'pilot',
    login: 'sso',
    contacts: {
      housing: { team: 'Student Services', description: 'Student Services can help with housing' },
      career: { team: 'Career Development Center', description: 'The careers team can review your plan' },
      immigration: { team: 'International Office', description: 'The International Office handles visas and TIE' },
    },
  },
  {
    id: 'demo',
    name: 'Demo University',
    shortName: 'DU',
    city: 'Anywhere',
    status: 'demo',
    login: 'email',
    contacts: {
      academic: { team: 'Registry Office', description: 'The Registry can issue certificates' },
    },
  },
];

export const getUniversity = (id: string | null | undefined) => universities.find((u) => u.id === id);
export const getTopic = (id: string) => topics.find((t) => t.id === id);
export const getQuestion = (id: string) => questions.find((q) => q.id === id);
