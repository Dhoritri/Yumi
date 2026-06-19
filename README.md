# Yumi — Static (HTML / CSS / JavaScript) build

A 1:1, pixel-for-pixel port of the Next.js `Yumi` storefront to plain
**HTML + CSS + vanilla JavaScript**. No build step, no framework — just open it
through a static file server.

## How it's built

No framework and no runtime engine — just plain **HTML, hand-written CSS, and
vanilla JavaScript**. The original was styled with Tailwind v4; every utility
class has been translated into a single hand-authored stylesheet
(`css/styles.css`) using readable, semantic class names (e.g. `.navbar__link`,
`.product-card`, `.hero-text`). The responsive design uses the same breakpoints
as the original (sm 640px · md 768px · lg 1024px), and the custom `container`
(responsive padding, `max-width: 1400px`) and Urbanist font are reproduced
directly in CSS.

Framer Motion's scroll/entrance animations are reproduced with an
`IntersectionObserver` + CSS transitions (see `css/styles.css`).

## Run it

It must be served over HTTP (the pages load JS modules and the Tailwind CDN);
opening the files via `file://` will not work reliably.

```bash
cd static-site
npx serve .
# or:  python -m http.server 8000
```

Then visit the printed URL (e.g. http://localhost:3000 or http://localhost:8000).

## Pages

| File                      | Original route        |
| ------------------------- | --------------------- |
| `index.html`              | `/`                   |
| `shop.html`               | `/shop`               |
| `product.html?slug=…`     | `/product/[slug]`     |
| `blog.html`               | `/blog`               |
| `blog-detail.html?slug=…` | `/blog/[slug]`        |
| `about.html`              | `/about`              |
| `contact.html`            | `/contact`            |
| `faq.html`                | `/faq`                |
| `privacy-policy.html`     | `/privacy-policy`     |
| `terms-conditions.html`   | `/terms-conditions`   |

## Structure

```
static-site/
├── *.html              # one file per route
├── css/styles.css      # custom (non-Tailwind) styles + animations
├── images/             # logo + favicon (copied from public/images)
└── js/
    ├── data.js         # mock data — ports /public/datas/*.ts
    ├── api.js          # data-access layer — ports /src/services/api.ts
    ├── main.js         # shared Navbar, Footer, ScrollToTop, ProductCard, quick-view
    ├── home.js         # hero carousel, featured slider, banners, discovery
    ├── shop.js         # filtering, sorting, pagination, grid/list views
    ├── product.js      # gallery, variants, tabs, related
    ├── blog.js         # listing + pagination
    ├── blog-detail.js  # article + prev/next + related
    ├── about.js  contact.js  faq.js  policy.js
```

## Wiring up a backend later

`js/api.js` mirrors the original `src/services/api.ts` one-to-one. Each function
returns mock data from `data.js` and contains the commented-out `fetch()` call
showing exactly where the real endpoint goes. Set the API base by defining
`window.NEXT_PUBLIC_API_URL` before `api.js` loads, then uncomment the `fetch`
blocks and delete the mock `return`.

Each product carries a `shortDescription` field. It is rendered on the product
detail page (`.pd__short-desc`) and, dynamically from the same field, under the
product name in the shop **list view** — so a single backend value drives both.
If your API returns only a long `description`, change the fallback in
`renderProductCard` (`js/main.js`) to `product.shortDescription || product.description`.
