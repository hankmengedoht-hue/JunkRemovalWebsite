/**
 * Charleston Tree Concierge form handler (Cloudflare Worker)
 *
 * Receives the site's booking, contact and review forms and emails them
 * through Cloudflare Email Service. Sending to addresses verified in
 * Email Routing is free and does not count against any quota.
 *
 * Recipients are set in wrangler.jsonc ("vars"):
 *   TO_DEFAULT  comma-separated list used for every form
 *   TO_BOOKING / TO_CONTACT / TO_REVIEW  optional per-form overrides
 */

const FORMS = {
  'booking-form': { key: 'BOOKING', label: 'Booking request' },
  'contact-form': { key: 'CONTACT', label: 'Contact message' },
  'review-form':  { key: 'REVIEW',  label: 'New review' },
};

// Friendly labels for the email body (unknown fields fall back to their name)
const FIELD_LABELS = {
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  service: 'Service',
  tree_height: 'Tree height',
  tree_stand: 'Tree stand',
  date: 'Preferred date',
  time: 'Preferred time',
  notes: 'Notes',
  subject: 'Subject',
  message: 'Message',
  rating: 'Rating',
  location: 'Location',
  review: 'Review',
};

const MAX_FIELD_LENGTH = 5000;
const MAX_FIELDS = 40;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const originOk = allowed.includes(origin);

    const cors = {
      'Access-Control-Allow-Origin': originOk ? origin : allowed[0] || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Vary': 'Origin',
    };

    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    const fail = (message, status = 400) => json({ ok: false, errors: [{ message }] }, status);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return fail('Method not allowed', 405);
    if (!originOk) return fail('Forbidden', 403);

    let data;
    try {
      data = await request.formData();
    } catch {
      return fail('Could not read the form. Please try again.');
    }

    // Honeypot: real people never see or fill this field. Pretend success so bots move on.
    if ((data.get('_gotcha') || '').toString().trim() !== '') return json({ ok: true });

    const formId = (data.get('_form') || '').toString();
    const form = FORMS[formId] || { key: 'OTHER', label: 'Website form' };
    const page = (data.get('_page') || '').toString().slice(0, 300);

    // Collect fields (skip internal _ fields and file uploads)
    const fields = [];
    for (const [name, value] of data.entries()) {
      if (name.startsWith('_') || typeof value !== 'string') continue;
      if (fields.length >= MAX_FIELDS) break;
      const v = value.trim().slice(0, MAX_FIELD_LENGTH);
      if (v === '' || (name === 'rating' && v === '0')) continue;
      fields.push([name, v]);
    }
    if (fields.length === 0) return fail('The form was empty. Please fill it out and try again.');

    const get = (n) => (fields.find(([k]) => k === n) || [])[1] || '';
    const customerName = get('name');
    const customerEmail = get('email');

    // Subject line
    let subject = `${form.label}`;
    if (form.key === 'REVIEW' && get('rating')) subject += ` (${get('rating')} stars)`;
    if (customerName) subject += `: ${customerName}`;
    subject = subject.replace(/[\r\n]+/g, ' ').slice(0, 200);

    // Body
    const when = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const lines = fields.map(([k, v]) => {
      const label = FIELD_LABELS[k] || k;
      return v.includes('\n') ? `${label}:\n${v}\n` : `${label}: ${v}`;
    });
    const text =
      `${form.label} from charlestontreeconcierge.com\n` +
      `Received ${when} ET\n\n` +
      lines.join('\n') +
      (page ? `\n\nSubmitted from: ${page}` : '') +
      (customerEmail ? `\n\nHit reply to respond directly to ${customerName || 'the customer'}.` : '');

    const html =
      `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2937">` +
      `<h2 style="margin:0 0 4px">${esc(form.label)}</h2>` +
      `<p style="margin:0 0 16px;color:#6b7280">Received ${esc(when)} ET</p>` +
      `<table cellpadding="6" style="border-collapse:collapse">` +
      fields.map(([k, v]) =>
        `<tr><td style="vertical-align:top;font-weight:bold;white-space:nowrap">${esc(FIELD_LABELS[k] || k)}</td>` +
        `<td style="white-space:pre-wrap">${linkify(k, v)}</td></tr>`
      ).join('') +
      `</table>` +
      (page ? `<p style="margin-top:16px;color:#6b7280;font-size:13px">Submitted from ${esc(page)}</p>` : '') +
      `</div>`;

    const recipients = (env[`TO_${form.key}`] || env.TO_DEFAULT || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (recipients.length === 0) return fail('Form is not configured yet. Please call or text us.', 500);

    const message = {
      to: recipients,
      from: { email: env.FROM_EMAIL, name: env.FROM_NAME || 'Website Forms' },
      subject,
      text,
      html,
    };
    if (isEmail(customerEmail)) {
      message.replyTo = customerName
        ? { email: customerEmail, name: customerName.replace(/[\r\n"<>]/g, '').slice(0, 100) }
        : customerEmail;
    }

    try {
      await env.EMAIL.send(message);
    } catch (err) {
      console.error('Email send failed:', err && (err.code || err.message || err));
      return fail('Something went wrong sending your request. Please call or text us directly.', 502);
    }

    return json({ ok: true });
  },
};

function isEmail(s) {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(s) && s.length <= 254;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function linkify(name, v) {
  if (name === 'email' && isEmail(v)) return `<a href="mailto:${esc(v)}">${esc(v)}</a>`;
  if (name === 'phone') {
    const digits = v.replace(/[^\d+]/g, '');
    if (digits.length >= 10) return `<a href="tel:${esc(digits)}">${esc(v)}</a>`;
  }
  return esc(v);
}
