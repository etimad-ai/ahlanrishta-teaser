# Ahlan Rishta — teaser

A bilingual (English / Arabic) teaser site with a launch countdown and an
early-invitation form, built to the *Ahlan Rishta Brand Guidelines, Edition 01 ·
2026*.

Static HTML, CSS and JavaScript. No build step, no dependencies, no framework —
open `index.html` and it runs.

---

## Before this goes live

One value still needs setting before launch, and one is confirmed. Both are
single-line edits near the top of `assets/js/main.js`.

### 1. The launch date

```js
var LAUNCH_ISO = "2026-10-02T00:00:00+03:00";
```

Launch is **Friday, 2 October 2026**. `+03:00` is Arabian Standard Time, which
the GCC observes year-round, so no daylight-saving correction is needed. Change
this one value and the countdown, the `aria-live` summary and the Arabic
numerals all follow.

The human-readable date is also written into the markup in two places — search
`index.html` for `Friday, 2 October 2026` and `الجمعة ٢ أكتوبر ٢٠٢٦` — and into
the OG card (see *Regenerating the OG image* below).

### 2. Where invitation requests go

```js
var WAITLIST_ENDPOINT = "";
```

While this is empty the form **falls back to opening the visitor's mail client**
with a pre-filled message to `CONTACT_EMAIL`. That is deliberate — it fails
visibly rather than silently discarding signups — but it is not what you want in
production.

Set it to any URL that accepts a JSON `POST` (a Formspree/Buttondown endpoint, a
Cloudflare Worker, an API route). The body is:

```json
{ "email": "…", "role": "candidate" | "guardian", "locale": "en" | "ar" }
```

A non-2xx response shows the failure message and re-enables the button.

---

## Running locally

Any static server will do:

```bash
npx http-server -p 8080 -c-1 .
# then open http://127.0.0.1:8080
```

Opening `index.html` directly via `file://` also works, except that
`localStorage` (used to remember the language choice) is restricted in some
browsers under that scheme.

## Deploying

The site is plain static files, so it deploys as-is to Cloudflare Pages, Netlify,
Vercel, GitHub Pages or S3. There is no build command; the publish directory is
the repository root.

---

## The brand system in code

Every brand value from the guidelines lives in one place: the `:root` block at
the top of `assets/css/styles.css`. Nothing downstream hard-codes a colour or a
font, so a revised palette or type pairing is a single-block edit.

| Token | Value | Role in the guidelines |
| --- | --- | --- |
| `--evergreen` | `#0E362A` | Primary · surfaces, headers |
| `--covenant-gold` | `#C6A15B` | Accent · trust, verified |
| `--warm-cream` | `#F7F2E8` | Base · backgrounds |
| `--ink` | `#16281F` | Text · body copy |
| `--verified-green` | `#1E7A55` | Affirmative ("We are") |
| `--alert-clay` | `#A6432F` | Negative ("We are not"), invalid input |
| `--light-gold` | `#D8BC85` | Countdown numerals, button gradient |
| `--slate` | `#54615A` | Secondary text on cream |

Three evergreen shades (`--evergreen-deep`, `--evergreen-dark`,
`--evergreen-soft`) are derived for layering. They are darker mixes of the
primary, not new hues.

Type is **Newsreader** for display and **Archivo** for body and UI, per the
guidelines. Arabic is set in **Amiri** (display, pairing with Newsreader's
editorial serif) and **IBM Plex Sans Arabic** (body, pairing with Archivo).

### The Eternal Knot

The mark is drawn in SVG, once, as a `<symbol>` in `index.html`, and referenced
by `<use>` everywhere it appears.

Two rings of equal weight overlap and pass through one another. The right ring
is drawn, the left ring covers it at the upper crossing, then the right ring is
repainted through the lower half (`#knot-weave`) so it returns to the surface
there. Neither ring sits on top of the other — they are genuinely linked and
cannot be pulled apart, which is the reading the guidelines give the mark: two
people, two families, one bond.

The mark's viewBox is `0 0 100 56`, so size it with `width` and `height: auto`;
a square box would letterbox it. The favicon and app icon use tighter, heavier
rings to survive 16px browser chrome.

The hero carries two hairline arcs bleeding off the upper corner, anchored to
the inline end so the composition mirrors under RTL.

---

## Voice

The guidelines rule out false urgency ("Only 3 spots left — act now!"), so the
countdown is written as an announcement rather than a scarcity device: *"We open
in"*, followed by the date. There is no "hurry", no seat count and no artificial
deadline anywhere in the copy. Section copy is taken from the guidelines'
positioning, pillars and messaging pages.

## Accessibility

- Countdown digits are `aria-hidden`; a visually hidden `aria-live="polite"`
  summary announces the remaining time **once a minute** rather than once a
  second, so screen readers are informed without being flooded.
- The language toggle sets `lang` and `dir` on `<html>`; layout uses logical
  properties so RTL follows automatically. Purely decorative elements are
  anchored physically so they stay centred in both directions.
- Arabic renders Arabic-Indic numerals (٨٧) in the countdown and dates.
- Skip link, visible focus rings, labelled form fields, and a
  `prefers-reduced-motion` guard around every animation.
- The stored language is applied in a blocking inline script in `<head>` so a
  returning Arabic reader never sees an LTR flash.

---

## Regenerating the OG image

`assets/img/og-image.png` (1200×630) was rendered from HTML with headless
Chromium. If the launch date or headline changes, re-render it rather than
editing the PNG — the source markup is in the commit history for this file, or
rebuild it from the hero's type and colour tokens.

## Layout

```
index.html              markup, bilingual copy, the Eternal Knot symbol
site.webmanifest        PWA metadata
assets/css/styles.css   brand tokens + all styling
assets/js/main.js       countdown, language switch, invitation form
assets/img/
  mark.svg              the Eternal Knot, transparent, for press and partners
  favicon.svg           evergreen tile, tuned for 16px
  app-icon.svg          180×180 maskable icon
  og-image.png          1200×630 social card
```
