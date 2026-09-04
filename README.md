# Ahlan Rishta — teaser

An English-language teaser site with a launch countdown, the introductory
gathering's details, and an early-invitation form, built to the *Ahlan Rishta
Brand Guidelines, Edition 01 · 2026*.

Launch and the gathering are the same day: **Friday, 2 October 2026, in
Riyadh**. This first gathering is open to Indian Muslim families living in
Saudi Arabia, and the page says so.

Static HTML, CSS and JavaScript. No build step, no dependencies, no framework —
open `index.html` and it runs.

---

## Before this goes live

### Where invitation requests go

```js
var WAITLIST_ENDPOINT = "";
```

While this is empty the form **falls back to opening the visitor's mail client**
with a pre-filled message to `CONTACT_EMAIL`. That is deliberate — it fails
visibly rather than silently discarding signups — but it is not what you want in
production, and in a sandboxed preview the fallback cannot navigate at all, so
the button appears to do nothing.

Set it to any URL that accepts a JSON `POST` (a Formspree/Buttondown endpoint, a
Cloudflare Worker, an API route). The body is:

```json
{ "email": "…", "role": "candidate" | "guardian" }
```

A non-2xx response shows the failure message and re-enables the button.

### The launch instant

```js
var LAUNCH_ISO = "2026-10-02T00:00:00+03:00";
```

`+03:00` is Arabian Standard Time, which the GCC observes year-round, so no
daylight-saving correction is needed. Change this one value and the countdown
and its `aria-live` summary both follow.

The human-readable date is also written into the markup twice — search
`index.html` for `Friday, 2 October 2026`, which appears under the countdown and
in the gathering band — and into the OG card (see *Regenerating the OG image*).

**Time and venue are deliberately withheld.** The band says they are shared with
registered guests closer to the date, matching the invitation poster. When the
venue is settled, replace that one `fact` in the band rather than adding a row.

---

## Running locally

Any static server will do:

```bash
npx http-server -p 8080 -c-1 .
# then open http://127.0.0.1:8080
```

Opening `index.html` over `file://` works too.

## Deploying

Plain static files with no build step, so the repository root *is* the site.

### GitHub Pages

`.github/workflows/deploy-pages.yml` publishes on every push. It uploads the
checkout as-is and deploys it — there is nothing to build.

Two things must be true on GitHub for it to succeed:

1. **Settings → Pages → Source must be "GitHub Actions".** The workflow's
   `configure-pages` step tries to set this itself, but it cannot if the
   account lacks permission.
2. **The repository is private, so Pages needs a paid plan.** GitHub Pages runs
   on private repositories only under GitHub Pro, Team, or Enterprise. On a Free
   organization the deploy fails until the repository is made public or the plan
   is upgraded. Note that a Pages site built from a private repository is still
   publicly readable unless you are on Enterprise Cloud with private Pages.

The workflow deploys from `claude/ahlanrishta-teaser-website-oandgf`, the only
branch in the repository today. Once this lands on a default branch, change the
`branches:` list in the workflow to that branch.

The live URL is `https://etimad-ai.github.io/ahlanrishta-teaser/`.

### Attaching ahlanrishta.com

The canonical URL, `og:url`, `og:image`, `twitter:image`, and the JSON-LD `url`
and `logo` all point at the GitHub Pages address, because that is where the site
is actually served from today. When the custom domain is attached:

1. Add a `CNAME` file at the repository root containing `ahlanrishta.com`.
2. Point the DNS at GitHub Pages.
3. Change those URLs in `index.html` back to `https://ahlanrishta.com/`.

Paths inside the page are all relative, including in `site.webmanifest`, so
nothing else needs touching when the domain changes.

### Anywhere else

It also deploys as-is to Cloudflare Pages, Netlify, Vercel or S3. There is no
build command; the publish directory is the repository root.

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
guidelines. **Amiri** is loaded for one purpose only — the Arabic wordmark
أهلاً رشتة, which is a logotype rather than translated copy.

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

### The gathering band

The full-bleed gold band under the hero is lifted from the invitation poster:
three facts — date, time and venue, entry — in `--covenant-gold` with evergreen
type, divided by hairline rules that only appear once the facts sit side by
side. The date and entry are set in Newsreader as values; the time-and-venue
line is a sentence, so it steps down to Archivo.

---

## The hero

Deliberately minimal: wordmark, headline, one line of copy, the countdown, the
date, and a single call to action. No eyebrow, no section furniture, and no form
— the invitation form lives in the gathering section, where the event details
give it context, and the hero button is an anchor to it.

The headline is the one loud element on the page, at `clamp(2.9rem, 8vw,
6.5rem)` — 104px at desktop widths. Tight leading (`1.02`) and negative tracking
(`-0.042em`) are what let a serif that large still read as composed. The
countdown carries no boxes, borders or fills: numerals, hairline dividers and
small caps labels only.

The vertical rhythm is tuned so the call to action clears the fold at both
1440×900 and 1280×800. If you add anything to the hero, re-check that.

Two hairline arcs bleed off the upper corner, echoing the ring mark without
competing with the wordmark.

## Voice

The guidelines rule out false urgency ("Only 3 spots left — act now!"), so the
countdown is written as an announcement rather than a scarcity device. There is
no "hurry", no seat count and no artificial deadline anywhere in the copy.
Section copy is taken from the guidelines' positioning, pillars and messaging
pages.

## Accessibility

- Countdown digits are `aria-hidden`; a visually hidden `aria-live="polite"`
  summary announces the remaining time **once a minute** rather than once a
  second, so screen readers are informed without being flooded.
- Skip link, visible focus rings, labelled form fields, and a
  `prefers-reduced-motion` guard around every animation.
- Layout still uses logical properties throughout. Nothing depends on it today,
  but it means a future Arabic edition would not need the CSS rewritten.

---

## Regenerating the OG image

`assets/img/og-image.png` (1200×630) was rendered from HTML with headless
Chromium. If the launch date or headline changes, re-render it rather than
editing the PNG — rebuild it from the hero's type and colour tokens.

## Layout

```
index.html              markup and copy, plus the Eternal Knot symbol
site.webmanifest        PWA metadata
assets/css/styles.css   brand tokens + all styling
assets/js/main.js       countdown and invitation form
assets/img/
  mark.svg              the Eternal Knot, transparent, for press and partners
  favicon.svg           evergreen tile, tuned for 16px
  app-icon.svg          180×180 maskable icon
  og-image.png          1200×630 social card
```
