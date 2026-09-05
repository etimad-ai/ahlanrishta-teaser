# Ahlan Rishta — teaser

An English-language launch page with a countdown, an explanation of the
platform, the introductory gathering's details, and a seat-reservation form,
built to the *Ahlan Rishta Brand Guidelines, Edition 01 · 2026*.

Launch and the gathering are the same day: **Friday, 2 October 2026, in
Riyadh**. This first gathering is open to Indian Muslim families living in
Saudi Arabia, and the page says so.

## What the page has to answer

The page is ordered around six questions a first-time visitor arrives with, and
each has a section that answers it plainly. If you edit the copy, keep the
answers intact:

| Question | Where it is answered |
| --- | --- |
| What is Ahlan Rishta? | `#what` — the lede, the four "How it works" steps, and the is/is-not ledger |
| Who is it for? | `#who` — three audience cards, plus an explicit *not for you if* |
| What is happening in this program? | `#gathering` — "Run of show" |
| Why should I attend? | `#gathering` — "Why come", three concrete outcomes |
| What will happen there? | `#gathering` and `#faq` — format, seating, obligations |
| How do I attend? | `#attend` — three steps, then the form |

`#faq` exists to answer what the sections cannot: cost, whether to bring
parents, what to bring, whether registration is required, and what happens to
the details a guest gives. Those are the objections that stop a family
registering, so they are answered on the page rather than by email.

The claims in `#what` and `#gathering` describe the real product — verification
layers, curated ranked matches, the staged introduction flow, private photos,
expiring biodata links, and what the Premium plan actually contains. They are
drawn from the platform's own `docs/FEATURES.md`. If the product changes, these
are the lines that go stale first.

Static HTML, CSS and JavaScript. No build step, no dependencies, no framework —
open `index.html` and it runs.

---

## Before this goes live

### Where seat reservations go

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

**The WhatsApp number is sent as an addition, not a change.** The copy promises
that the venue and timing arrive by message, so the form collects a number — but
we cannot know from the browser whether the service rejects unknown keys. So
`submitRequest` posts `{ email, guest, phone }`, and if that comes back **4xx**
— the shape a strict validator returns — it retries once with the two agreed
keys alone. If the service stores `phone`, it is kept; if it does not, the seat
is still reserved. A reservation is never lost to a field the page added.

Once the service accepts `phone` for certain, the retry is dead weight and can
go. A **5xx** is not retried and never quotes the server's message back to the
guest; a 4xx message is quoted, because it is about their submission.

The number field is optional and validated loosely on purpose — Saudi, Indian
and Gulf numbers all arrive written differently, and the check only rejects
input that could not be a phone number at all.

### The launch instant

```js
var LAUNCH_ISO = "2026-10-02T00:00:00+03:00";
```

`+03:00` is Arabian Standard Time, which the GCC observes year-round, so no
daylight-saving correction is needed. Change this one value and the countdown
and its `aria-live` summary both follow.

The human-readable date is also written into the markup by hand — search
`index.html` for `Friday, 2 October 2026` and for `2 October`, which appear in
the gold band, the gathering eyebrow, the "How to attend" steps, the form's
confirmation copy in `main.js`, and the `Event` JSON-LD `startDate` — and into
the OG card (see *Regenerating the OG image*).

**Time and venue are deliberately withheld.** The band's *Entry* fact says they
go to registered guests a few days before, the FAQ says why, and the run of show
is written without timings. When the venue is settled, three things change: that
`fact` in the band, the `Where in Riyadh` answer in the FAQ, and the
`agenda__note` under the run of show. There is a comment in `index.html` at the
agenda marking where timings belong.

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
four facts — date, where, who, entry — in `--covenant-gold` with evergreen type,
divided by hairline rules that only appear once the facts sit side by side. It
goes one column, then two at 640px, then four at 940px.

*Date* and *Where* are short values, set in Newsreader. *Who* and *Entry* are
sentences, so they take `fact__value--note` and step down to Archivo. **Who**
earns its place in the band rather than only in `#who`: a visitor who is not an
Indian Muslim family in Saudi Arabia should learn that in the first screenful,
not three sections down.

---

## The hero

Deliberately minimal: the mark, the Arabic logotype, headline, one line of copy,
the countdown, the date, and the actions. No eyebrow, no section furniture, and no form — the
reservation form lives in `#attend`, after the reasons to attend, and the hero
button is an anchor to it.

There are **two** actions, and only one of them is a button. *Reserve your seat*
is the gold button; *What is Ahlan Rishta?* is a quiet underlined link to
`#what`. Most first-time visitors do not yet know what they would be reserving a
seat at, and giving them a second button would make the page ask twice instead
of offering a way to find out. Resist promoting it.

The lede is one short sentence on purpose. Everything the earlier, longer
version tried to say now lives in `#what`, where there is room for it — and the
hero's vertical budget is tight enough that a third line of lede pushes the
call to action below the fold at 1280×800.

The headline is the one loud element on the page, at `clamp(2.9rem, 8vw,
6.5rem)` — 104px at desktop widths. Tight leading (`1.02`) and negative tracking
(`-0.042em`) are what let a serif that large still read as composed. The
countdown carries no boxes, borders or fills: numerals, hairline dividers and
small caps labels only.

The vertical rhythm is tuned so the call to action clears the fold at both
1440×900 and 1280×800 — measured at **23px** to spare at 1440×900 and **50px**
at 1280×800. 1440×900 is now the tighter of the two, because it sits just above
the 880px breakpoint and so gets the full-size mark. If you add anything to the
hero, lengthen the lede, grow the mark, or let the date line wrap to two lines,
re-check both:

```js
const b = document.querySelector('.hero__actions').getBoundingClientRect().bottom;
innerHeight - b   // must stay positive at 1280x800 AND at 1440x900
```

Two hairline arcs bleed off the upper corner, echoing the ring mark without
competing with the wordmark.

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
65px tall, and the header padding, lockup gap, title margin, countdown and
action margins all tighten together. Below 700px wide the block is off — a phone
scrolls, and there is no fold to clear.

Change the mark's size in **both** places or the two disagree, and re-measure
after: the short-viewport case is the one that breaks.

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
