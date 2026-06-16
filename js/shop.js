/* Shop page — category filter, sort, pagination, search query, quick view */

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

function categoryItemHtml(name, count, isActive) {
  const label = name === null ? "All Collections" : escapeHtml(name);
  return `
    <li data-cat="${name === null ? "" : escapeHtml(name)}" class="cat-item${isActive ? " is-active" : ""}">
      <span class="cat-item__name">${label}</span>
      <span class="cat-item__count">${count}</span>
    </li>`;
}

function renderShop() {
  const root = document.getElementById("shop-root");
  const cats = shopCategories();
  const filtered = shopFiltered();
  const sorted = shopSorted(filtered);
  const totalPages = Math.ceil(sorted.length / shopState.productsPerPage);
  const indexOfLast = shopState.currentPage * shopState.productsPerPage;
  const indexOfFirst = indexOfLast - shopState.productsPerPage;
  const current = sorted.slice(indexOfFirst, indexOfLast);
  const totalCount = shopState.products.length;

  const searchBanner = shopState.searchBarQuery
    ? `<div class="shop__searchbar">
        <p>Showing results for <b>"${escapeHtml(shopState.searchBarQuery)}"</b><span class="shop__searchbar-count">(${filtered.length} items found)</span></p>
        <a href="shop.html" class="shop__searchbar-clear">Clear Search</a>
      </div>`
    : "";

  const desktopCats =
    categoryItemHtml(null, totalCount, shopState.selectedCategory === null) +
    cats.map((c) => categoryItemHtml(c.name, c.count, shopState.selectedCategory === c.name)).join("");

  const grid = current.map((p) => `<div data-reveal>${productCardHtml(p)}</div>`).join("");

  let pagination = "";
  if (totalPages > 1) {
    let nums = "";
    for (let i = 1; i <= totalPages; i++) {
      nums += `<button data-page="${i}" class="pager__num${shopState.currentPage === i ? " is-active" : ""}">${i}</button>`;
    }
    pagination = `
      <div class="pager">
        <button id="shop-prev" class="pager__btn" ${shopState.currentPage === 1 ? "disabled" : ""}>${lucide("chevron-left", 18)}</button>
        ${nums}
        <button id="shop-next" class="pager__btn" ${shopState.currentPage === totalPages ? "disabled" : ""}>${lucide("chevron-right", 18)}</button>
      </div>`;
  }

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">Products</span>
      </div>
    </div>

    <section class="shop container">
      ${searchBanner}
      <div class="shop__layout">

        <div class="shop__tab">
          <button id="shop-mobile-tab" class="shop__tab-btn">
            ${lucide("list", 18)}
            <span class="shop__tab-label">Categories</span>
          </button>
        </div>

        <div id="shop-mobile-sidebar" class="shop__mobile-sidebar" hidden>
          <div id="shop-mobile-overlay" class="shop__mobile-overlay"></div>
          <aside class="shop__mobile-aside">
            <div class="shop__mobile-head">
              <h4>Collections</h4>
              <button id="shop-mobile-close" class="shop__mobile-close">${lucide("x", 20)}</button>
            </div>
            <ul class="shop__catlist shop__catlist--mobile" data-cat-list="mobile">${desktopCats}</ul>
          </aside>
        </div>

        <aside class="shop__aside">
          <div class="shop__aside-sticky">
            <h4 class="shop__aside-title"><span></span>Filter By Category</h4>
            <ul class="shop__catlist" data-cat-list="desktop">${desktopCats}</ul>
          </div>
        </aside>

        <div class="shop__main">
          <div class="shop__toolbar">
            <div>
              <button class="shop__view-btn">${lucide("layout-grid", 18)}</button>
            </div>
            <div class="shop__sort-wrap">
              <select id="shop-sort" class="shop__sort">
                <option value="a-z">Alphabetically, A-Z</option>
                <option value="z-a">Alphabetically, Z-A</option>
                <option value="low-high">Price, low to high</option>
                <option value="high-low">Price, high to low</option>
              </select>
              <span class="shop__sort-icon">${lucide("chevron-down", 14)}</span>
            </div>
          </div>

          <div class="shop__grid">${grid}</div>
          ${pagination}
        </div>
      </div>
    </section>
  `;

  document.getElementById("shop-sort").value = shopState.sortOrder;
  bindShopEvents();
  bindQuickViews(root, shopState.products);
  initReveal();
}

function bindShopEvents() {
  const root = document.getElementById("shop-root");

  const selectCategory = (cat) => {
    shopState.selectedCategory = cat;
    shopState.currentPage = 1;
    closeMobileSidebar();
    window.scrollTo({ top: 400, behavior: "smooth" });
    renderShop();
  };

  root.querySelectorAll("[data-cat-list] .cat-item").forEach((li) => {
    li.addEventListener("click", () => {
      const cat = li.getAttribute("data-cat");
      selectCategory(cat === "" ? null : cat);
    });
  });

  root.querySelector("#shop-sort").addEventListener("change", (e) => {
    shopState.sortOrder = e.target.value;
    shopState.currentPage = 1;
    renderShop();
  });

  root.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => changePage(parseInt(btn.getAttribute("data-page"), 10)));
  });
  const prev = root.querySelector("#shop-prev");
  const next = root.querySelector("#shop-next");
  if (prev) prev.addEventListener("click", () => changePage(Math.max(1, shopState.currentPage - 1)));
  if (next) {
    const totalPages = Math.ceil(shopSorted(shopFiltered()).length / shopState.productsPerPage);
    next.addEventListener("click", () => changePage(Math.min(totalPages, shopState.currentPage + 1)));
  }

  const tab = root.querySelector("#shop-mobile-tab");
  if (tab) tab.addEventListener("click", openMobileSidebar);
  const overlay = root.querySelector("#shop-mobile-overlay");
  if (overlay) overlay.addEventListener("click", closeMobileSidebar);
  const close = root.querySelector("#shop-mobile-close");
  if (close) close.addEventListener("click", closeMobileSidebar);
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
  renderShop();
}
