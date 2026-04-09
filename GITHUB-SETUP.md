# How to Push This Site to GitHub & Publish It Live

Your repo is already created at:
**https://github.com/hankmengedoht-hue/JunkRemovalWebsite**

---

## Step 1 — Copy the Site Files into the Repo Folder

If you cloned the repo separately, copy all the files from this folder (`charleston-junk-removal/`) into your local `JunkRemovalWebsite/` folder. Or just work directly from this folder and connect it to the existing remote.

---

## Step 2 — Connect This Folder to Your GitHub Repo

Open a terminal (VS Code: Terminal → New Terminal) and run:

```bash
cd "c:/Users/Hcmen/VS Code MCNC/charleston-junk-removal"

git init
git add .
git commit -m "Initial site build"
git branch -M main
git remote add origin https://github.com/hankmengedoht-hue/JunkRemovalWebsite.git
git push -u origin main
```

If the repo already has commits and the push is rejected, use:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## Step 3 — Publish Live with GitHub Pages (Free Hosting)

1. Go to **https://github.com/hankmengedoht-hue/JunkRemovalWebsite**
2. Click **Settings** (top tab)
3. Click **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

Your site will be live in ~1–2 minutes at:
`https://hankmengedoht-hue.github.io/JunkRemovalWebsite/`

---

## Step 4 — Update the Site Later

After any changes, push updates with:

```bash
git add .
git commit -m "Update: describe what you changed"
git push
```

GitHub Pages will automatically update within a minute or two.

---

## Custom Domain (Optional — Recommended)

To use a domain like `www.palmettohaul.com`:

1. Buy a domain from Namecheap, GoDaddy, Cloudflare, etc.
2. In your repo → Settings → Pages → Custom domain → enter your domain
3. In your domain registrar's DNS settings, add:
   - 4 A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - CNAME record: `www` → `hankmengedoht-hue.github.io`
4. Check "Enforce HTTPS" in GitHub Pages settings

---

## Free Contact Form (Formspree)

The contact and booking forms currently just show a success message.
To make them actually send emails to you, use **Formspree** (free):

1. Go to **formspree.io** and sign up
2. Create a form — copy your form endpoint (looks like `https://formspree.io/f/xabcdef`)
3. In each HTML file, update the `<form>` tags to add `action` and `method`:
   ```html
   <form action="https://formspree.io/f/xabcdef" method="POST">
   ```
4. Remove the `id="booking-form"` and `id="contact-form"` preventDefault handlers from main.js for those forms (or just delete them and let Formspree handle submission)

---

## What to Update Before Going Live

- [ ] Replace `(843) 555-0100` with Hank's real number
- [ ] Replace `(843) 555-0101` with Jacob's real number
- [ ] Replace `hello@palmettohaul.com` with your real email
- [ ] Replace `https://www.palmettohaul.com` with your real domain (or GitHub Pages URL)
- [ ] Add your logo to `images/logo.png`
- [ ] Add team photos to `images/`
- [ ] Update placeholder text in About page
- [ ] Add real Instagram/Facebook profile links
- [ ] Set up Formspree for contact forms (see above)
- [ ] Update business name if different from "Palmetto Haul Co."
