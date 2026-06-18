/* ───────────────────────────────────────────────────────────────────────────
   Shared runtime: route mapping, icons, scroll-reveal, and the global
   Navbar / Footer / ScrollToTop components (ported from the React layout).
   ─────────────────────────────────────────────────────────────────────────── */

/* ─── Utilities ─────────────────────────────────────────────────────────── */

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Map a Next.js route to its static-site URL. */
function routeTo(href) {
  if (!href) return "#";
  if (/^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href === "#") return href;

  const [path, query] = href.split("?");
  const suffix = query ? "?" + query : "";

  const map = {
    "/": "index.html",
    "/shop": "shop.html",
    "/about": "about.html",
    "/contact": "contact.html",
    "/blog": "blog.html",
    "/faq": "faq.html",
    "/terms-conditions": "terms-conditions.html",
    "/privacy-policy": "privacy-policy.html",
    "/stores": "index.html",
  };

  if (map[path]) return map[path] + suffix;

  let m = path.match(/^\/product\/(.+)$/);
  if (m) return "product.html?slug=" + encodeURIComponent(m[1]);

  m = path.match(/^\/blog\/(.+)$/);
  if (m) return "blog-detail.html?slug=" + encodeURIComponent(m[1]);

  return href;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ─── Declarative data binding ───────────────────────────────────────────────
   Markup lives in the .html files (often inside <template> elements). These
   helpers let the JS inject dynamic values into that markup without writing
   HTML strings here.
   ───────────────────────────────────────────────────────────────────────── */

/* Resolve a dotted path (supports "arr[0].field") against an object. */
function getPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((o, key) => {
    if (o == null) return undefined;
    const m = key.match(/^(.*)\[(\d+)\]$/);
    if (m) {
      const arr = m[1] ? o[m[1]] : o;
      return arr ? arr[Number(m[2])] : undefined;
    }
    return o[key];
  }, obj);
}

/* Fill data-* binding hooks found inside `scope` from the `data` object:
     data-text        -> textContent
     data-html        -> innerHTML
     data-src         -> src attribute
     data-alt         -> alt attribute
     data-href        -> href attribute (run through routeTo)
     data-placeholder -> placeholder attribute                                   */
function applyBindings(scope, data) {
  scope.querySelectorAll("[data-text]").forEach((el) => {
    const v = getPath(data, el.getAttribute("data-text"));
    el.textContent = v == null ? "" : v;
  });
  scope.querySelectorAll("[data-html]").forEach((el) => {
    const v = getPath(data, el.getAttribute("data-html"));
    el.innerHTML = v == null ? "" : v;
  });
  scope.querySelectorAll("[data-src]").forEach((el) => {
    const v = getPath(data, el.getAttribute("data-src"));
    if (v != null) el.setAttribute("src", v);
  });
  scope.querySelectorAll("[data-alt]").forEach((el) => {
    const v = getPath(data, el.getAttribute("data-alt"));
    if (v != null) el.setAttribute("alt", v);
  });
  scope.querySelectorAll("[data-href]").forEach((el) => {
    el.setAttribute("href", routeTo(getPath(data, el.getAttribute("data-href"))));
  });
  scope.querySelectorAll("[data-placeholder]").forEach((el) => {
    const v = getPath(data, el.getAttribute("data-placeholder"));
    if (v != null) el.setAttribute("placeholder", v);
  });
}

/* Clone a <template> by id and return its first element child. */
function cloneTpl(id) {
  const tpl = document.getElementById(id);
  return tpl.content.firstElementChild.cloneNode(true);
}

/* Inline lucide-style icons (24x24, stroke currentColor). */
function lucide(name, size) {
  const s = size || 24;
  const paths = {
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "layout-grid": '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

/* ─── Scroll reveal (replaces framer-motion whileInView) ─────────────────── */
function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "-50px" }
  );
  els.forEach((el) => obs.observe(el));
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function renderNavbar() {
  const root = document.getElementById("navbar-root");
  if (!root) return;
  const pathname = window.PAGE_ROUTE || "/";

  const navLinksDesktop = siteConfig.navLinks
    .map((link) => {
      const active = pathname === link.href ? " is-active" : "";
      return `<a href="${routeTo(link.href)}" class="navbar__link${active}">${escapeHtml(link.name)}</a>`;
    })
    .join("");

  const navLinksMobile = siteConfig.navLinks
    .map((link) => {
      const active = pathname === link.href ? " is-active" : "";
      return `<a href="${routeTo(link.href)}" class="drawer__link${active}">${escapeHtml(link.name)}</a>`;
    })
    .join("");

  root.innerHTML = `
    <div class="topbar">${escapeHtml(siteConfig.topBanner)}</div>

    <nav id="main-nav" class="navbar">
      <div class="container navbar__inner">
        <div class="navbar__mobile">
          <button id="nav-menu-btn" aria-label="Toggle Menu" class="navbar__menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h16M4 16h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div class="navbar__links">${navLinksDesktop}</div>

        <div class="navbar__logo-wrap">
          <a href="${routeTo("/")}">
            <img src="images/logo.png" alt="${escapeHtml(siteConfig.name)}" class="navbar__logo" />
          </a>
        </div>

        <div class="navbar__col navbar__col--right">
          <button id="nav-search-btn" aria-label="Search" class="navbar__search">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
      </div>
    </nav>

    <div id="search-overlay" class="search-overlay" hidden>
      <div id="search-backdrop" class="search-overlay__backdrop"></div>
      <div class="search-overlay__panel">
        <div class="container">
          <div class="search-overlay__head">
            <h2 class="search-overlay__title">Search Products</h2>
            <button id="search-close" class="search-overlay__close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <form id="search-form" class="search-form">
            <input id="search-input" type="text" placeholder="What are you looking for?" class="search-input" />
            <div class="search-underline"></div>
          </form>
          <div id="search-results"></div>
        </div>
      </div>
    </div>

    <div id="mobile-menu" class="drawer" hidden>
      <div id="mobile-backdrop" class="drawer__backdrop"></div>
      <div class="drawer__panel">
        <div class="drawer__head">
          <span class="drawer__title">Menu</span>
          <button id="drawer-close" class="drawer__close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <nav class="drawer__nav">${navLinksMobile}</nav>
      </div>
    </div>
  `;

  initNavbarBehavior();
}

function initNavbarBehavior() {
  const nav = document.getElementById("main-nav");
  let lastScrollY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > lastScrollY && y > 80) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastScrollY = y;
  });

  const lockBody = (lock) => { document.body.style.overflow = lock ? "hidden" : "unset"; };

  const searchOverlay = document.getElementById("search-overlay");
  const searchInput = document.getElementById("search-input");
  const openSearch = () => {
    searchOverlay.hidden = false;
    lockBody(true);
    setTimeout(() => searchInput && searchInput.focus(), 100);
  };
  const closeSearch = () => {
    searchOverlay.hidden = true;
    lockBody(false);
    searchInput.value = "";
    renderSearchResults("");
  };
  document.getElementById("nav-search-btn").addEventListener("click", openSearch);
  document.getElementById("search-close").addEventListener("click", closeSearch);
  document.getElementById("search-backdrop").addEventListener("click", closeSearch);
  searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) window.location.href = "shop.html?search=" + encodeURIComponent(q);
  });

  const mobileMenu = document.getElementById("mobile-menu");
  const openMenu = () => { mobileMenu.hidden = false; lockBody(true); };
  const closeMenu = () => { mobileMenu.hidden = true; lockBody(false); };
  document.getElementById("nav-menu-btn").addEventListener("click", openMenu);
  document.getElementById("drawer-close").addEventListener("click", closeMenu);
  document.getElementById("mobile-backdrop").addEventListener("click", closeMenu);
}

function renderSearchResults(query) {
  const container = document.getElementById("search-results");
  const q = (query || "").trim();
  if (q.length === 0) { container.innerHTML = ""; return; }

  const matches = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
  );
  const nameMatches = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const cards = matches
    .slice(0, 4)
    .map(
      (product) => `
      <a href="${routeTo("/product/" + product.slug)}" class="search-card">
        <div class="search-card__media"><img src="${product.image}" alt="${escapeHtml(product.name)}" /></div>
        <div>
          <h3 class="search-card__name">${escapeHtml(product.name)}</h3>
          <p class="search-card__cat">${escapeHtml(product.category)}</p>
        </div>
      </a>`
    )
    .join("");

  let html = `<div class="search-grid">${cards}</div>`;
  if (nameMatches.length === 0) html += `<p class="search-empty">No products matching your search.</p>`;
  html += `<div class="search-viewall-wrap"><button id="search-view-all" class="search-viewall">View All Results</button></div>`;
  container.innerHTML = html;

  const viewAll = document.getElementById("search-view-all");
  if (viewAll) viewAll.addEventListener("click", () => {
    window.location.href = "shop.html?search=" + encodeURIComponent(q);
  });
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function renderFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  const f = footerData;

  const usefulLinks = f.usefulLinks.links
    .map((link) => `<li><a href="${routeTo(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("");
  const infoLinks = f.information.links
    .map((link) => `<li><a href="${routeTo(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("");

  root.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__col">
            <h4 class="footer__title">${escapeHtml(f.company.title)}</h4>
            <div class="footer__company">
              <p>Find a location nearest you.</p>
              <p class="footer__phone">${escapeHtml(f.company.phone)}</p>
              <p>${escapeHtml(f.company.email)}</p>
            </div>
          </div>

          <div class="footer__col">
            <h4 class="footer__title">${escapeHtml(f.usefulLinks.title)}</h4>
            <ul class="footer__links">${usefulLinks}</ul>
          </div>

          <div class="footer__col">
            <h4 class="footer__title">${escapeHtml(f.information.title)}</h4>
            <ul class="footer__links">${infoLinks}</ul>
          </div>

          <div class="footer__col">
            <h2 class="footer__news-title">${escapeHtml(f.newsletter.title)}</h2>
            <p class="footer__news-desc">${escapeHtml(f.newsletter.description)}</p>
            <div class="footer__news-form">
              <input type="email" placeholder="${escapeHtml(f.newsletter.placeholder)}" class="footer__news-input" />
              <button class="footer__news-btn">${escapeHtml(f.newsletter.buttonText)}</button>
            </div>
          </div>
        </div>

        <div class="footer__bottom">
          <div class="footer__copy">&copy; Yumi 2026 | Powered by <a href="https://thebigdogdigital.com/" target="_blank">BigDog Digital</a></div>

          <div class="footer__logo-wrap">
            <a href="${routeTo("/")}"><img src="images/logo.png" alt="${escapeHtml(siteConfig.name)}" class="footer__logo" /></a>
          </div>

          <div class="footer__socials">
            <a href="https://instagram.com">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://tiktok.com">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </a>
            <a href="https://facebook.com">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/* ─── Scroll To Top ──────────────────────────────────────────────────────── */
function renderScrollToTop() {
  const root = document.getElementById("scrolltop-root");
  if (!root) return;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  root.innerHTML = `
    <div id="scrolltop" class="scrolltop">
      <button id="scrolltop-btn" class="scrolltop__btn" aria-label="Scroll to top">
        <svg class="scrolltop__ring" viewBox="0 0 50 50">
          <circle class="scrolltop__track" cx="25" cy="25" r="${radius}" fill="transparent" stroke="currentColor" stroke-width="1.5"/>
          <circle id="scrolltop-progress" class="scrolltop__progress" cx="25" cy="25" r="${radius}" fill="transparent" stroke="currentColor" stroke-width="1.5" stroke-dasharray="${circumference}" style="stroke-dashoffset:${circumference}"/>
        </svg>
        <div class="scrolltop__arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </button>
    </div>
  `;

  const wrap = document.getElementById("scrolltop");
  const btn = document.getElementById("scrolltop-btn");
  const progress = document.getElementById("scrolltop-progress");

  const onScroll = () => {
    if (window.scrollY > 300) wrap.classList.add("is-visible");
    else wrap.classList.remove("is-visible");
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(100, Math.ceil((window.scrollY / totalHeight) * 100));
    progress.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  };
  window.addEventListener("scroll", onScroll);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ─── ProductCard (shared) ───────────────────────────────────────────────────
   Markup lives in <template id="tpl-product-card"> inside the pages that show
   product cards. This clones that template and fills in the product data.
   Returns a DOM node (the .product-card element).
   ───────────────────────────────────────────────────────────────────────── */
function renderProductCard(product) {
  const card = cloneTpl("tpl-product-card");
  card.setAttribute("data-slug", product.slug);
  card.querySelector(".product-card__link").setAttribute("href", routeTo("/product/" + product.slug));

  const badge = card.querySelector(".product-card__badge");
  if (product.badge) {
    badge.classList.add(product.badge === "New" ? "product-card__badge--new" : "product-card__badge--sale");
    badge.querySelector("span").textContent = product.badge;
  } else {
    badge.remove();
  }

  const mainImg = card.querySelector(".product-card__img--main");
  mainImg.src = product.image;
  mainImg.alt = product.name;

  const altImg = card.querySelector(".product-card__img--alt");
  const hasAlt = product.gallery && product.gallery[1];
  if (hasAlt) {
    mainImg.classList.add("product-card__img--has-alt");
    altImg.src = product.gallery[1];
    altImg.alt = product.name + " alternate view";
  } else {
    mainImg.classList.add("product-card__img--zoom");
    altImg.remove();
  }

  const prices = card.querySelector(".product-card__prices");
  const oldEl = prices.querySelector(".product-card__old");
  const priceEl = prices.querySelector(".product-card__price");
  if (product.oldPrice) {
    oldEl.querySelector(".product-card__old-val").textContent = product.oldPrice.toFixed(2);
    priceEl.classList.add("product-card__price--discount");
  } else {
    oldEl.remove();
  }
  priceEl.querySelector(".product-card__price-val").textContent = product.price.toFixed(2);

  card.querySelector(".product-card__name").textContent = product.name;
  return card;
}

/* QuickView modal — markup lives in <template id="tpl-quickview">. */
function openQuickView(product) {
  const overlay = cloneTpl("tpl-quickview");

  const badge = overlay.querySelector(".qv__badge");
  if (product.badge) {
    badge.classList.add(product.badge === "New" ? "product-card__badge--new" : "product-card__badge--sale");
    badge.querySelector("span").textContent = product.badge;
  } else {
    badge.remove();
  }

  const media = overlay.querySelector(".qv__media img");
  media.src = product.image;
  media.alt = product.name;

  overlay.querySelector(".qv__cat").textContent = product.category;
  overlay.querySelector(".qv__name").textContent = product.name;

  const oldEl = overlay.querySelector(".qv__old");
  if (product.oldPrice) {
    oldEl.querySelector(".qv__old-val").textContent = product.oldPrice.toFixed(2);
  } else {
    oldEl.remove();
  }
  overlay.querySelector(".qv__price-val").textContent = product.price.toFixed(2);

  overlay.querySelector(".qv__desc").textContent =
    `Take a closer look at our ${product.name.toLowerCase()}. This elegant piece from our ${product.category.toLowerCase()} collection is designed for those who appreciate refined beauty and exceptional quality.`;

  overlay.querySelector(".qv__btn--primary").setAttribute("href", routeTo("/product/" + product.slug));
  overlay.querySelector(".qv__btn--ghost").setAttribute("href", product.purchaseLink || "#");

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const close = () => {
    overlay.remove();
    document.body.style.overflow = "unset";
  };
  overlay.querySelectorAll("[data-qv-close]").forEach((el) => el.addEventListener("click", close));
}

function bindQuickViews(container, lookup) {
  (container || document).querySelectorAll("[data-product-card]").forEach((card) => {
    const slug = card.getAttribute("data-slug");
    const product = (lookup || products).find((p) => p.slug === slug);
    card.querySelectorAll(".quickview-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product) openQuickView(product);
      });
    });
  });
}

/* ─── Boot ───────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-anim");
  renderNavbar();
  renderFooter();
  renderScrollToTop();
  if (typeof initPage === "function") {
    Promise.resolve(initPage()).then(() => initReveal());
  } else {
    initReveal();
  }
});
