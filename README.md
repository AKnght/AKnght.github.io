# AKnght Studios website

The studio's site: AKnght2Write first, then a little about the studio, Randy and Jesse, and
the games that came before. Plain HTML, CSS and JavaScript. **There is no build step**, no
framework and no package to install; what is in this repository is exactly what gets served.

This repository is `AKnght/AKnght.github.io`, so GitHub Pages serves its `main` branch at
<https://aknght.github.io/>. Push to `main` and the site updates about a minute later.

```
index.html          the studio's front page
aknght2write.html   everything about the app; the page a store listing should point at
privacy.html        the privacy policy a store listing needs (marked Draft)
404.html            GitHub Pages serves this for a missing page
.nojekyll           tells GitHub Pages to serve the files as they are
assets/
  site.css          every style, light and dark
  site.js           theme switch, the narrow-screen menu, the footer's year
  demo.js           the animated phone in the hero
  favicon.svg       the mark: a knight's helm that is also a pen nib
  img/team/         Randy and Jesse
  img/games/        the seven game images, from the old aknghtstudios.com
  img/app/          three renders of the app's own screens, and icon.svg, the app's icon
```

Every link and asset path is **relative**, so the site works from a custom domain, from a
`github.io` address, and by double-clicking `index.html`. The one exception is `404.html`,
which has to use `/` and so assumes the site sits at the root of its domain. It does.

Nothing is loaded from anywhere else: no fonts, no scripts, no analytics, no cookies. The
footer says so, and the privacy page says so, so keep it true.

## House rule: no em dashes

There is not one em dash anywhere on this site, and there never will be. Recast the
sentence instead: a period, a colon, parentheses, or "and". Page titles use ` | `. The
app's spoken command `em dash` is listed by name, since that is what you say, but it is
described in words and the character itself is never printed.

To check, search the repository for the character. The search should come back empty.

## Looking at it on your own PC

```bash
python -m http.server 4173
```

Run that from inside this folder, then open <http://localhost:4173>. A browser keeps old
copies of images and styles, so after replacing a file under the same name, refresh with
Ctrl+F5.

## Pointing aknghtstudios.com at it

1. On GitHub: **Settings → Pages → Custom domain**, enter `aknghtstudios.com` and Save.
   GitHub adds a file named `CNAME` to the repository; pull it so your copy has it too.
2. At the domain's registrar, replace the old host's records with GitHub's:

   | Type  | Name  | Value               |
   |-------|-------|---------------------|
   | A     | `@`   | `185.199.108.153`   |
   | A     | `@`   | `185.199.109.153`   |
   | A     | `@`   | `185.199.110.153`   |
   | A     | `@`   | `185.199.111.153`   |
   | CNAME | `www` | `aknght.github.io`  |

   Check them against GitHub's page, *Managing a custom domain for your GitHub Pages site*,
   before saving. They have not changed in years, but it is their list, not ours.
3. Once the DNS check on the Pages screen goes green, tick **Enforce HTTPS**.

**Mind the email.** `admin@aknghtstudios.com` is on the contact button, the app page and
the privacy page. If that mailbox lives with the old web host, moving the domain's records
can cut it off: leave the `MX` records alone, or move the mailbox first.

## Still to do

- **The email address.** `admin@aknghtstudios.com` came from the old site. If it is not
  the one to use, search the repository for it; it appears in three files.
- **Pricing.** The app page says what is free (dictation in one document, with a reminder
  past 2,000 dictated words a week) and what a subscription adds (dictation in every
  document, no reminders), monthly or yearly, with no prices. Add them when the store
  products exist, and keep the page in step with the app if the model changes again.
- **The privacy page** is marked Draft. It was written from how the app actually behaves,
  but it is a legal page: read it, then remove the Draft notice.
- **The logo.** The helm-and-nib mark was drawn for this site. If a real one comes along,
  replace `assets/favicon.svg` and the `brand__mark` drawing in each page's header and
  footer.
- **A preview image for links.** There is no `og:image` yet, so a link pasted into a chat
  shows text only. It wants a 1200 × 630 PNG and the site's final address.

## Where some of the facts came from

"Portland, Oregon" in the footer is the old site's mailing address, and "for more than a
decade" rests on the Wayback Machine's first capture of the old site, in May 2013. The old
games are described as having left Google Play because every one of the old listings now
answers "not found", and doctorsmash.com is a parked domain, so none of them is linked.
