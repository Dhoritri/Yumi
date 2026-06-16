/* Product detail page — by ?slug=, with variants, gallery, tabs, related */
const productState = {
  products: [],
  product: null,
  selectedVariant: null,
  mainImage: "",
  activeTab: "description",
};

function renderGallery() {
  const product = productState.product;
  const activeGallery = productState.selectedVariant ? productState.selectedVariant.gallery : product.gallery;
  const mainImage = productState.mainImage;

  document.getElementById("pd-main-image").src = mainImage;

  document.getElementById("pd-thumbs").innerHTML = activeGallery
    .map(
      (img, idx) => `
      <div data-thumb="${escapeHtml(img)}" class="pd__thumb${mainImage === img ? " is-active" : ""}">
        <img src="${img}" alt="Gallery ${idx}" />
      </div>`
    )
    .join("");

  document.querySelectorAll("[data-thumb]").forEach((el) => {
    el.addEventListener("click", () => {
      productState.mainImage = el.getAttribute("data-thumb");
      renderGallery();
    });
  });
}

function renderVariants() {
  const product = productState.product;
  if (!product.variants || product.variants.length === 0) return;
  document.querySelectorAll("#pd-variants [data-variant]").forEach((btn) => {
    const name = btn.getAttribute("data-variant");
    const isActive = productState.selectedVariant && productState.selectedVariant.name === name;
    btn.classList.toggle("is-active", isActive);
  });
}

function renderTabs() {
  const product = productState.product;
  const tab = productState.activeTab;
  document.getElementById("pd-tab-description").classList.toggle("is-active", tab === "description");
  document.getElementById("pd-tab-videos").classList.toggle("is-active", tab === "videos");

  const panel = document.getElementById("pd-tab-panel");
  if (tab === "description") {
    panel.innerHTML = `<div class="animate-fadeIn"><p>${escapeHtml(product.description)}</p></div>`;
  } else {
    const vids = product.videos
      .map(
        (vidId, idx) => `
        <div class="pd__video">
          <iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${escapeHtml(vidId)}" title="Product Video ${idx + 1}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>`
      )
      .join("");
    panel.innerHTML = `<div class="pd__videos animate-fadeIn">${vids}</div>`;
  }
}

async function initPage() {
  const root = document.getElementById("product-root");
  const slug = getQueryParam("slug");
  productState.products = await getProducts();
  const product = productState.products.find((p) => p.slug === slug);

  if (!product) {
    root.innerHTML = `
      <div class="container pd__notfound">
        <h2>Product Not Found</h2>
        <a href="shop.html">Back to Shop</a>
      </div>`;
    return;
  }

  productState.product = product;
  productState.selectedVariant = (product.variants && product.variants[0]) || null;
  productState.mainImage = (productState.selectedVariant && productState.selectedVariant.image) || product.image;
  document.title = product.name;

  const otherCategories = productState.products.filter((p) => p.category !== product.category && p.id !== product.id);
  const shuffled = otherCategories.sort(() => 0.5 - Math.random());
  const relatedProducts = shuffled.slice(0, 4);

  const badgeClass = product.badge === "New" ? "product-card__badge--new" : "product-card__badge--sale";
  const badge = product.badge
    ? `<div class="pd__badge ${badgeClass}"><span>${escapeHtml(product.badge)}</span></div>`
    : "";

  const oldPrice = product.oldPrice
    ? `<span class="pd__old"><span class="taka">৳ </span>${product.oldPrice.toFixed(2)}</span>`
    : "";

  let variantsHtml = "";
  if (product.variants && product.variants.length > 0) {
    const buttons = product.variants
      .map((variant) => `<button data-variant="${escapeHtml(variant.name)}" class="pd__variant">${escapeHtml(variant.name)}</button>`)
      .join("");
    variantsHtml = `
      <div class="pd__variants">
        <span class="pd__variants-label">${escapeHtml(product.variantType || "Choose Option")}</span>
        <div class="pd__variant-btns" id="pd-variants">${buttons}</div>
      </div>`;
  }

  const related =
    relatedProducts.length > 0
      ? `<div class="pd__related">
          <h2 class="pd__related-title">You May Also Like</h2>
          <div class="pd__related-grid">${relatedProducts.map((p) => productCardHtml(p)).join("")}</div>
        </div>`
      : "";

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <a href="shop.html">Shop</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current crumb__current--cap">${escapeHtml(product.name)}</span>
      </div>
    </div>

    <div class="container pd">
      <div class="pd__top">
        <div class="pd__gallery">
          <div class="pd__main">
            ${badge}
            <img id="pd-main-image" src="${productState.mainImage}" alt="${escapeHtml(product.name)}" />
          </div>
          <div class="pd__thumbs" id="pd-thumbs"></div>
        </div>

        <div class="pd__info">
          <div class="pd__prices">
            ${oldPrice}
            <span class="pd__price"><span class="taka">৳ </span>${product.price.toFixed(2)}</span>
          </div>
          <h1 class="pd__name">${escapeHtml(product.name)}</h1>

          ${variantsHtml}

          <div class="pd__buy-wrap">
            <a href="${product.purchaseLink || "#"}" target="_blank" rel="noopener noreferrer" class="pd__buy">Buy it now</a>
          </div>

          <div class="pd__meta">
            <p>Category: <span>${escapeHtml(product.category)}</span></p>
            <p>Tags: <span>${escapeHtml(product.tags.join(", "))}</span></p>
          </div>
        </div>
      </div>

      <div class="pd__tabs">
        <div class="pd__tabnav">
          <button id="pd-tab-description" class="pd__tab">Description</button>
          <button id="pd-tab-videos" class="pd__tab">Videos</button>
        </div>
        <div class="pd__panel" id="pd-tab-panel"></div>
      </div>

      ${related}
    </div>
  `;

  renderGallery();
  renderVariants();
  renderTabs();

  const variantsContainer = document.getElementById("pd-variants");
  if (variantsContainer) {
    variantsContainer.querySelectorAll("[data-variant]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-variant");
        productState.selectedVariant = product.variants.find((v) => v.name === name) || null;
        productState.mainImage = productState.selectedVariant ? productState.selectedVariant.image : product.image;
        renderVariants();
        renderGallery();
      });
    });
  }

  document.getElementById("pd-tab-description").addEventListener("click", () => {
    productState.activeTab = "description";
    renderTabs();
  });
  document.getElementById("pd-tab-videos").addEventListener("click", () => {
    productState.activeTab = "videos";
    renderTabs();
  });

  bindQuickViews(root, productState.products);
}
