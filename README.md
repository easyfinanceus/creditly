# Kreditly.az

Static multilingual credit and personal finance website prepared for GitHub Pages.

## Structure

```text
.
├── assets/
│   ├── app.js
│   ├── favicon.svg
│   └── styles.css
├── en/
│   └── index.html
│   └── privacy-policy/
│       └── index.html
├── privacy-policy/
│   └── index.html
├── ru/
│   └── index.html
│   └── privacy-policy/
│       └── index.html
├── index.html
├── robots.txt
└── sitemap.xml
```

## Features

- Main loan calculator with annuity and differentiated payment modes
- Salary and debt-burden calculator
- Early repayment scenario calculator
- Currency converter with static demo rates
- Three-option loan comparison
- Popular presets, FAQ, localStorage persistence, copy/share result buttons
- Separate AZ, RU, and EN URLs with `hreflang`
- Privacy policy pages for all three languages
- SEO basics: semantic HTML, JSON-LD, `robots.txt`, `sitemap.xml`, Open Graph metadata
- Reserved ad slots that keep layout stable

## Run locally

This project is fully static. You can open the files directly, but a simple local server is better for path handling.

### Python

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder.
5. Save and wait for the Pages URL to appear.

## Before connecting a real domain

- Replace `https://kreditly.az/` in `index.html`, `ru/index.html`, `en/index.html`, `robots.txt`, and `sitemap.xml` with your final domain if it changes.
- Replace the same domain in `privacy-policy/index.html`, `ru/privacy-policy/index.html`, and `en/privacy-policy/index.html`.
- Add your future Open Graph preview image at `assets/og-cover.png` or update the metadata path.
- Privacy policy pages are already included, but you may want to expand them once real analytics or ad scripts are added.

## Next iteration ideas

- Dynamic exchange rates via public API
- Deposit calculator
- Exportable payment schedule on the client side
- Additional SEO articles and glossary pages
