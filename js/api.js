/* ───────────────────────────────────────────────────────────────────────────
   API layer — mirrors /src/services/api.ts.
   Each function currently returns mock data from data.js. The commented-out
   fetch() calls show exactly where to plug in the real backend later.
   ─────────────────────────────────────────────────────────────────────────── */

const API_BASE = window.NEXT_PUBLIC_API_URL || "";

// ─── Products ────────────────────────────────────────────────────────
async function getProducts() {
  /*
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
  */
  return products;
}

async function getProductBySlug(slug) {
  /*
  const res = await fetch(`${API_BASE}/products?slug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  const data = await res.json();
  return data[0];
  */
  return products.find((p) => p.slug === slug);
}

async function getFeaturedProducts() {
  /*
  const res = await fetch(`${API_BASE}/products?featured=true`);
  if (!res.ok) throw new Error("Failed to fetch featured products");
  return res.json();
  */
  return products.filter((p) => p.featured);
}

// ─── Blogs ───────────────────────────────────────────────────────────
async function getBlogs() {
  /*
  const res = await fetch(`${API_BASE}/blogs`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
  */
  return blogs;
}

async function getBlogBySlug(slug) {
  /*
  const res = await fetch(`${API_BASE}/blogs?slug=${slug}`);
  if (!res.ok) throw new Error("Failed to fetch blog");
  const data = await res.json();
  return data[0];
  */
  return blogs.find((b) => b.slug === slug);
}

// ─── Homepage ────────────────────────────────────────────────────────
async function getHeroSlides() {
  /*
  const res = await fetch(`${API_BASE}/hero-slides`);
  if (!res.ok) throw new Error("Failed to fetch hero slides");
  return res.json();
  */
  return heroSlides;
}

async function getSiteConfig() {
  /*
  const res = await fetch(`${API_BASE}/site-config`);
  if (!res.ok) throw new Error("Failed to fetch site config");
  return res.json();
  */
  return siteConfig;
}

async function getPromoBanners() {
  /*
  const res = await fetch(`${API_BASE}/promo-banners`);
  if (!res.ok) throw new Error("Failed to fetch promo banners");
  return res.json();
  */
  return promoBanners;
}

async function getDiscoveryData() {
  /*
  const res = await fetch(`${API_BASE}/discovery`);
  if (!res.ok) throw new Error("Failed to fetch discovery data");
  return res.json();
  */
  return discoveryData;
}

// ─── Static Pages ────────────────────────────────────────────────────
async function getContactData() {
  /* const res = await fetch(`${API_BASE}/contact`); return res.json(); */
  return contactData;
}

async function getPrivacyPolicyData() {
  /* const res = await fetch(`${API_BASE}/privacy-policy`); return res.json(); */
  return privacyPolicyData;
}

async function getTermsConditionsData() {
  /* const res = await fetch(`${API_BASE}/terms-conditions`); return res.json(); */
  return termsConditionsData;
}

async function getFAQData() {
  /* const res = await fetch(`${API_BASE}/faq`); return res.json(); */
  return faqData;
}

async function getAboutData() {
  /* const res = await fetch(`${API_BASE}/about`); return res.json(); */
  return aboutData;
}

async function getFooterData() {
  /* const res = await fetch(`${API_BASE}/footer`); return res.json(); */
  return footerData;
}
