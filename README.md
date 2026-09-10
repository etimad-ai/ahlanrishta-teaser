# Ahlan Rishta — coming soon

A single-page coming-soon site for **Indian Muslim families in India and across
the Gulf** — India, Saudi Arabia, the UAE, Qatar, Kuwait, Bahrain and Oman. The mark, what the
platform is, the six things it will not trade away, a notify-me form, and how
to reach us. Built to the
*Ahlan Rishta Brand Guidelines, Edition 01 · 2026*.

**There is no launch date on the page, and that is deliberate.** No date is
fixed, and a missed date on a trust-first brand costs more than the urgency it
would buy. The status badge says *Coming soon* and nothing more. If a date is
ever committed to, it goes in the badge and in `COPY.success` — do not put one
in only one of them.

## What the page has to answer

Four questions, in this order, each with the section that answers it. If you
edit the copy, keep the answers intact:

| Question | Where it is answered |
| --- | --- |
| What is Ahlan Rishta? | the hero lede, then `#features`' own lede |
| Who is it for? | the hero lede, then the markets band naming all seven countries |
| What will it do? | `#features` — the six pillars |
| What is it *not*? | `#features` — the is/is-not ledger |
| How do I hear when it opens? | `#notify`, and `contact@ahlanrishta.com` in the footer |

The is/is-not ledger earns its place by answering the single question this
audience arrives with — *is this a dating app?* — in one glance, without making
anyone read six pillars first.

The pillar copy describes the real product: verification layers, curated ranked
matches, the staged introduction flow, private photos and expiring biodata
links. It is drawn from the platform's own `docs/FEATURES.md`. If the product
changes, these are the lines that go stale first.

Static HTML, CSS and JavaScript. No build step, no dependencies, no framework —
open `index.html` and it runs.

---

## Before this goes live

### Where notify requests go

```js
var WAITLIST_ENDPOINT = "https://ahlanrishta-lead-capture-…run.app";
```

Set it to any URL that accepts a JSON `POST`. If it is ever emptied, the form
**falls back to opening the visitor's mail client** with a pre-filled message to
`CONTACT_EMAIL`. That is deliberate — it fails visibly rather than silently
discarding signups — but in a sandboxed preview the fallback cannot navigate at
all, so the button appears to do nothing.

The agreed contract is two keys:

```json
{ "email": "…", "guest": "seeker" | "guardian" }
```

A **5xx** is never quoted back to the visitor — the service's internals are not
their problem, so they get `COPY.failure` and the contact address. A **4xx**
*is* quoted, because it is about their submission; an "invalid email" reply is
turned back into inline field validation.

`role` in the markup and `guest` in the payload are the same thing under two
names — `roleToGuest()` is the only place that mapping lives.

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

**A repository admin has to switch Pages on once, by hand, before the first
deploy can succeed.** This is not optional and the workflow cannot do it:

> Settings → Pages → Build and deployment → Source → **GitHub Actions**

The workflow sets `enablement: true`, which asks `configure-pages` to create the
Pages site over the API. That was tried and GitHub refused it:

```
Create Pages site failed. Error: Resource not accessible by integration
```

The `GITHUB_TOKEN` an Actions run holds cannot create a Pages site, whatever
`permissions:` the workflow declares — only a user with admin rights on the
repository can. Once someone has done it, every later run finds the existing
site and deploys normally, so this is a one-time step.

**The repository is also private, which Pages requires a paid plan for.** Pages
runs on private repositories only under GitHub Pro, Team, or Enterprise. On a
Free organization the setting above will not be available, and the options are
to make the repository public or upgrade the plan. Note also that a Pages site
built from a private repository is still **publicly readable** — the repository
stays private, the published site does not.

The workflow deploys from `main`.

The live URL is `https://ahlanrishta.com/` (see *ahlanrishta.com* below).

### ahlanrishta.com

The domain is attached: `CNAME` at the repository root holds `ahlanrishta.com`,
and the canonical URL, `og:url`, `og:image`, `twitter:image` and the JSON-LD
`url` and `logo` all point at `https://ahlanrishta.com/`. They used to point at
the GitHub Pages address; if you ever see that address reappear in `index.html`,
it is a regression, not a fallback.

Paths inside the page are all relative, including in `site.webmanifest`, so
nothing else needs touching if the domain changes again.

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

---

## Page structure

Five bands, alternating dark and light so each reads as its own thing:

| Band | Surface | Carries |
| --- | --- | --- |
| `.hero` | `--evergreen` | mark, badge, headline, one line, one button |
| `.markets-band` | `--evergreen-dark` | the seven markets |
| `#features` | `--warm-cream` | six pillars, then the is/is-not ledger |
| `#notify` | `--evergreen-deep` | the form |
| `.closing` | `--warm-cream` | the closing line |

The hero used to carry the markets and the form as well, and it was crowded.
If you add anything back to it, put it in a band instead.

## The hero

The mark, the Arabic logotype, the *Coming soon* badge, the headline, one
sentence, and one button that anchors to `#notify`. Nothing else — the form
lives in its own band now, and the button is the only route to it besides the
header pill.

**The background is flat `--evergreen`, deliberately.** There used to be a gold
radial wash pooled behind the wordmark; it was removed. The primary colour is
solid from the top of the header to the bottom of the hero, and the headline
carries the composition on its own. Do not reintroduce a gradient there.

The lede is one sentence at `46ch`. Everything it used to carry lives in
`#features`.

### The markets band

A slim full-bleed strip under the hero, darker than the hero it sits beneath,
with hairlines top and bottom — a rule drawn across the page that happens to
carry seven names, not another block competing with the headline. Label and
names sit side by side from 860px and stack below it.

Seven country names, small caps, separated by **space only**. Hairline
separators were tried and dropped: a `::before` rule lands at the start of a
wrapped row on a phone, and CSS has no selector for "first item on this line".
The names wrap to two centred rows at 375px. If you add an eighth market,
re-check 375px.

### The notify band

`#notify` is on the **section**, because it is the anchor target. The form
inside it has no id, so `main.js` reaches it with `document.querySelector("#notify form")`.
Selecting `#notify` itself would appear to work — submit bubbles — and then
fail on `form.reset()`. Do not change that lookup to `getElementById`.

### The hero lockup

The Eternal Knot opens the hero, with أهلاً رشتة beneath it — `.hero__lockup`
holds the two as one unit, which is also what the entrance stagger animates
(giving the mark and the logotype separate delays pulls the lockup apart as it
arrives). The knot is the largest mark on the page by a wide margin: 87px tall
against the header's 34px.

Its `viewBox` is `0 0 100 56`, so **set width and let height follow** — a height
or a square box letterboxes it.

### Why the hero has a short-viewport block

A large mark and a fold constraint do not both fit on an 800px-tall screen, so
the hero is sized for a tall screen and compressed as a unit under
`@media (max-height: 880px) and (min-width: 700px)`: the mark steps from 87px to
65px tall, and the header padding, lockup gap and title margin tighten together.
Below 700px wide the block is off — a phone scrolls, and there is no fold to
clear.

Change the mark's size in **both** places or the two disagree, and re-measure
after: the short-viewport case is the one that breaks.

## Voice

The guidelines rule out false urgency ("Only 3 spots left — act now!"). There is
no "hurry", no counter, no waitlist position and no artificial deadline anywhere
in the copy — the badge announces, it does not pressure. Section copy is taken
from the guidelines' positioning, pillars and messaging pages.

## Accessibility

- The form's note is `role="status"`, so validation errors and the confirmation
  are announced without moving focus.
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
CNAME                   ahlanrishta.com
index.html              markup and copy, plus the Eternal Knot symbol
site.webmanifest        PWA metadata
assets/css/styles.css   brand tokens + all styling
assets/js/main.js       the notify-me form
assets/img/
  mark.svg              the Eternal Knot, transparent, for press and partners
  favicon.svg           evergreen tile, tuned for 16px
  app-icon.svg          180×180 maskable icon
  og-image.png          1200×630 social card
```
