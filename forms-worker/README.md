# Charleston Tree Concierge form handler

Replaces Formspree. A Cloudflare Worker at `https://forms.charlestontreeconcierge.com`
receives the booking, contact and review forms and emails them to you.

Cost: $0. Cloudflare doesn't charge for email sent to addresses you've verified,
and the Workers free plan allows 100,000 requests a day.

## One-time setup (about 15 minutes)

Do these in order. Deploy the Worker **before** pushing the site changes,
otherwise the live forms will point at an endpoint that doesn't exist yet.

### 1. Verify the inbox(es) that should receive forms

Cloudflare dashboard > `charlestontreeconcierge.com` > **Email** > **Email Routing**

- If Email Routing isn't on yet, turn it on and let it add its DNS records.
- Under **Destination addresses**, add `hankmengedoht@gmail.com` and click the
  link in the verification email. Do the same for Jacob or anyone else who
  should get forms.

### 2. Turn on sending for the domain

In the dashboard, open **Email Service** (Email Sending) and add
`charlestontreeconcierge.com` as a sending domain. Let Cloudflare add the
SPF/DKIM records it asks for. This lets the Worker send *from*
`forms@charlestontreeconcierge.com` so the emails don't land in spam.

### 3. Set who gets what

Open `wrangler.jsonc`:

- `allowed_destination_addresses`: every address the Worker is allowed to
  email. Add Jacob here once his address is verified in step 1.
- `TO_DEFAULT`: who gets every form.
- `TO_BOOKING`, `TO_CONTACT`, `TO_REVIEW`: uncomment any of these to send that
  form to a different person or list (comma-separated).

### 4. Deploy

From this folder:

```bash
npx wrangler login      # opens a browser, sign in to Cloudflare
npx wrangler deploy
```

Wrangler creates the `forms.` DNS record and SSL certificate automatically.

### 5. Test it

```bash
curl -X POST https://forms.charlestontreeconcierge.com \
  -H "Origin: https://charlestontreeconcierge.com" \
  -F _form=contact-form -F name="Test" -F message="Hello from curl"
```

You should get `{"ok":true}` and an email within a few seconds.

### 6. Push the site changes, then cancel Formspree

Commit and push the rest of the repo. GitHub Pages redeploys and the forms
start using the Worker. Submit one real form on the live site, then cancel
Formspree.

## Troubleshooting

- **Logs:** Cloudflare dashboard > Workers & Pages > `charlestontreeconcierge-forms`
  > Logs. Failed sends log the Cloudflare error code.
- `E_RECIPIENT_NOT_ALLOWED`: the address isn't in `allowed_destination_addresses`.
- `E_SENDER_NOT_VERIFIED` / `E_SENDER_DOMAIN_NOT_AVAILABLE`: step 2 isn't finished.
- **Forms say "Forbidden":** the site is being served from a domain that isn't
  in `ALLOWED_ORIGINS`.
- **Spam getting through:** add a rate limiting rule for `forms.charlestontreeconcierge.com`
  under Security > WAF (free plan includes one), or ask Claude to add Turnstile.

## Reusing for another site

Copy this folder, change `name`, the `routes` domain, `FROM_EMAIL`,
`FROM_NAME`, the `FORMS` map at the top of `src/index.js` if the form IDs
differ, and `ALLOWED_ORIGINS`. Each domain needs steps 1 and 2 once.
