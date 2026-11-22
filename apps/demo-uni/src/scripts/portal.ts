// The portal's procedures as plain functions. The forms on the page AND the WebMCP tools call the same code,
// so an AI agent does exactly what a person would do, and the person sees it happen on screen.

export interface CertificateRequest {
  type: 'enrolment' | 'transcript';
  language: 'en' | 'es';
}

export interface Booking {
  professor: string;
  date: string;
}

export const professors = ['Prof. Ana Ruiz (Finance)', 'Prof. Mark Klein (Strategy)', 'Prof. Sara Haddad (Operations)'];

// Fictional deadlines for the demo
export const deadlines = [
  { item: 'Course selection, spring term', date: '2027-01-15' },
  { item: 'Exchange programme applications', date: '2027-02-01' },
  { item: 'Thesis topic proposal', date: '2027-03-01' },
];

let counter = 1000;

export function requestCertificate({ type, language }: CertificateRequest) {
  counter += 1;
  return {
    reference: `CERT-${counter}`,
    type,
    language,
    status: 'Requested: it will arrive by email within 1 working day',
  };
}

export function bookOfficeHours({ professor, date }: Booking) {
  if (!professors.includes(professor)) throw new Error(`Unknown professor. Choose one of: ${professors.join('; ')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must be YYYY-MM-DD');
  counter += 1;
  return { reference: `MEET-${counter}`, professor, date, status: 'Booked: 15 minutes, room details by email' };
}

export function getDeadlines() {
  return { deadlines };
}
