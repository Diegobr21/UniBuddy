// The university's procedures, run on the server. The portal form, WebMCP and the MCP server all call
// these functions, so every channel does exactly the same thing and shares one list of requests.
// PROTOTYPE storage: in memory, reset when the server restarts.
import {
  certificateLanguages,
  certificateTypes,
  deadlines,
  professors,
  type CertificateLanguage,
  type CertificateType,
  type Channel,
} from './catalog';

export interface PortalRequest {
  reference: string;
  title: string;
  detail: string;
  status: string;
  channel: Channel;
  createdAt: string;
}

const requests: PortalRequest[] = [];
let counter = 1000;

const record = (request: Omit<PortalRequest, 'reference' | 'createdAt'>, prefix: string) => {
  counter += 1;
  const saved = { ...request, reference: `${prefix}-${counter}`, createdAt: new Date().toISOString() };
  requests.unshift(saved);
  return saved;
};

export function listRequests(): PortalRequest[] {
  return requests.slice(0, 20);
}

export function requestCertificate(type: CertificateType, language: CertificateLanguage, channel: Channel) {
  if (!(type in certificateTypes)) throw new Error(`Unknown certificate type. Use one of: ${Object.keys(certificateTypes).join(', ')}`);
  if (!(language in certificateLanguages)) throw new Error('Language must be en or es');
  return record(
    {
      title: certificateTypes[type],
      detail: `In ${certificateLanguages[language]}`,
      status: 'Requested: it will arrive by email within 1 working day',
      channel,
    },
    'CERT',
  );
}

export function bookOfficeHours(professor: string, date: string, channel: Channel) {
  if (!professors.includes(professor)) throw new Error(`Unknown professor. Choose one of: ${professors.join('; ')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must be YYYY-MM-DD');
  if (date < new Date().toISOString().slice(0, 10)) throw new Error('The date must be today or later');
  return record(
    { title: 'Office hours', detail: `${professor} · ${date}`, status: 'Booked: 15 minutes, room details by email', channel },
    'MEET',
  );
}

export function getDeadlines() {
  return deadlines;
}
