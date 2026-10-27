import { services } from './data.js';

export const interests = new Set(['Growth strategy', 'Not sure yet', ...services.map((s) => s.name)]);

export function validateInquiry(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'Please provide a valid inquiry.' };
  if (data.website_check) return { error: 'The submission could not be accepted.' };
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const company = typeof data.company === 'string' ? data.company.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const service = typeof data.service === 'string' ? data.service.trim() : '';
  if (name.length < 2 || name.length > 100) return { error: 'Please enter a name between 2 and 100 characters.' };
  if (email.length > 254 || !/^\S+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (company.length > 200) return { error: 'Please keep your company details under 200 characters.' };
  if (message.length < 20 || message.length > 5000) return { error: 'Please tell us about your business in 20 to 5,000 characters.' };
  if (!interests.has(service)) return { error: 'Please select an available service.' };
  if (data.consent !== true && data.consent !== 'true' && data.consent !== 'on') return { error: 'Please agree to the privacy policy before submitting.' };
  return { value: { name, email, company, service, message, consent: true } };
}
