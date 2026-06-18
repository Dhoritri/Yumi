/* Shop page — category filter, sort, pagination, search query, quick view.
   The page layout lives in shop.html; this fills the dynamic regions
   (search banner, category lists, product grid, pager) from data. */

const shopState = {
  products: [],
  currentPage: 1,
  selectedCategory: null,
  sortOrder: "a-z",
  searchBarQuery: "",
  productsPerPage: 9,
};

function shopCategories() {
  const seen = [];
  shopState.products.forEach((p) => { if (!seen.includes(p.category)) seen.push(p.category); });
  return seen.map((cat) => ({ name: cat, count: shopState.products.filter((p) => p.category === cat).length }));
}

function shopFiltered() {
  const { products, selectedCategory, searchBarQuery } = shopState;
  return products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const q = searchBarQuery.toLowerCase();
    const matchesSearch = searchBarQuery
      ? p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      : true;
    return matchesCategory && matchesSearch;
  });
}

function shopSorted(list) {
  return [...list].sort((a, b) => {
    switch (shopState.sortOrder) {
      case "a-z": return a.name.localeCompare(b.name);
      case "z-a": return b.name.localeCompare(a.name);
      case "low-high": return a.price - b.price;
      case "high-low": return b.price - a.price;
      default: return 0;
    }
  });
}

function selectCategory(cat) {
  shopState.selectedCategory = cat;
  shopState.currentPage = 1;
  closeMobileSidebar();
  window.scrollTo({ top: 400, behavior: "smooth" });
  renderShop();
}

function renderCategoryList(ul, cats, totalCount) {
  ul.innerHTML = "";
  const items = [{ name: null, count: totalCount }].concat(cats);
  items.forEach((c) => {
    const li = cloneTpl("tpl-cat-item");
    li.setAttribute("data-cat", c.name === null ? "" : c.name);
    li.querySelector(".cat-item__name").textContent = c.name === null ? "All Collections" : c.name;
    li.querySelector(".cat-item__count").textContent = c.count;
    if (shopState.selectedCategory === c.name) li.classList.add("is-active");
    li.addEventListener("click", () => selectCategory(c.name));
    ul.appendChild(li);
  });
}

function renderShopPager(totalPages) {
  const wrap = document.getElementById("shop-pager");
  wrap.innerHTML = "";
  if (totalPages <= 1) return;

  const pager = cloneTpl("tpl-shop-pager");
  const prevBtn = pager.querySelector("[data-prev]");
  const nextBtn = pager.querySelector("[data-next]");

  for (let i = 1; i <= totalPages; i++) {
    const b = cloneTpl("tpl-shop-pagenum");
    b.textContent = i;
    if (shopState.currentPage === i) b.classList.add("is-active");
    b.addEventListener("click", () => changePage(i));
    pager.insertBefore(b, nextBtn);
  }

  prevBtn.disabled = shopState.currentPage === 1;
  nextBtn.disabled = shopState.currentPage === totalPages;
  prevBtn.addEventListener("click", () => changePage(Math.max(1, shopState.currentPage - 1)));
  nextBtn.addEventListener("click", () => changePage(Math.min(totalPages, shopState.currentPage + 1)));
  wrap.appendChild(pager);
}

function renderShop() {
  const cats = shopCategories();
  const filtered = shopFiltered();
  const sorted = shopSorted(filtered);
  const totalPages = Math.ceil(sorted.length / shopState.productsPerPage);
  const indexOfLast = shopState.currentPage * shopState.productsPerPage;
  const current = sorted.slice(indexOfLast - shopState.productsPerPage, indexOfLast);
  const totalCount = shopState.products.length;

  const countNum = document.querySelector(".shop__count-num");
  if (countNum) countNum.textContent = filtered.length;

  const sb = document.getElementById("shop-searchbar");
  sb.innerHTML = "";
  if (shopState.searchBarQuery) {
    const node = cloneTpl("tpl-shop-searchbar");
    node.querySelector(".shop__searchbar-q").textContent = `"${shopState.searchBarQuery}"`;
    node.querySelector(".shop__searchbar-count").textContent = `(${filtered.length} items found)`;
    sb.appendChild(node);
  }

  renderCategoryList(document.getElementById("shop-cats-mobile"), cats, totalCount);

  const grid = document.getElementById("shop-grid");
  grid.innerHTML = "";
  current.forEach((p) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("data-reveal", "");
    wrap.appendChild(renderProductCard(p));
    grid.appendChild(wrap);
  });

  renderShopPager(totalPages);

  bindQuickViews(document.getElementById("shop-root"), shopState.products);
  initReveal();
}

function changePage(page) {
  shopState.currentPage = page;
  window.scrollTo({ top: 400, behavior: "smooth" });
  renderShop();
}

function openMobileSidebar() {
  const el = document.getElementById("shop-mobile-sidebar");
  if (el) el.hidden = false;
}
function closeMobileSidebar() {
  const el = document.getElementById("shop-mobile-sidebar");
  if (el) el.hidden = true;
}

async function initPage() {
  shopState.searchBarQuery = getQueryParam("search") || "";
  shopState.selectedCategory = getQueryParam("category");
  shopState.products = await getProducts();

  const sortSel = document.getElementById("shop-sort");
  sortSel.value = shopState.sortOrder;
  sortSel.addEventListener("change", (e) => {
    shopState.sortOrder = e.target.value;
    shopState.currentPage = 1;
    renderShop();
  });

  document.getElementById("shop-filter-btn").addEventListener("click", openMobileSidebar);
  document.getElementById("shop-mobile-overlay").addEventListener("click", closeMobileSidebar);
  document.getElementById("shop-mobile-close").addEventListener("click", closeMobileSidebar);

  const setView = (mode) => {
    document.getElementById("shop-view-grid").classList.toggle("is-active", mode === "grid");
    document.getElementById("shop-view-list").classList.toggle("is-active", mode === "list");
    document.getElementById("shop-grid").classList.toggle("shop__grid--list", mode === "list");
  };
  document.getElementById("shop-view-grid").addEventListener("click", () => setView("grid"));
  document.getElementById("shop-view-list").addEventListener("click", () => setView("list"));

  renderShop();
}
