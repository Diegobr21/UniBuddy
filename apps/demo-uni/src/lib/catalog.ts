// Fixed data of the fictional university, safe to use in the browser and on the server.

export const professors = ['Prof. Ana Ruiz (Finance)', 'Prof. Mark Klein (Strategy)', 'Prof. Sara Haddad (Operations)'];

export const certificateTypes = { enrolment: 'Enrolment certificate', transcript: 'Academic transcript' } as const;
export type CertificateType = keyof typeof certificateTypes;

export const certificateLanguages = { en: 'English', es: 'Spanish' } as const;
export type CertificateLanguage = keyof typeof certificateLanguages;

// Fictional deadlines for the demo
export const deadlines = [
  { item: 'Course selection, spring term', date: '2027-01-15' },
  { item: 'Exchange programme applications', date: '2027-02-01' },
  { item: 'Thesis topic proposal', date: '2027-03-01' },
];

/** Where a request came from: the portal's own form, an agent in the browser, or MBA Buddy's chat. */
export type Channel = 'portal' | 'webmcp' | 'mba-buddy';

export const channelLabels: Record<Channel, string> = {
  portal: 'Portal form',
  webmcp: 'Browser assistant (WebMCP)',
  'mba-buddy': 'MBA Buddy chat (MCP)',
};
