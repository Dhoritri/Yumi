/* Product detail page — by ?slug=, with variants, gallery, tabs, related.
   Page structure + templates live in product.html; this fills the bind hooks,
   clones the dynamic pieces, and wires the interactions. */
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

  const thumbs = document.getElementById("pd-thumbs");
  thumbs.innerHTML = "";
  activeGallery.forEach((img, idx) => {
    const node = cloneTpl("tpl-pd-thumb");
    node.setAttribute("data-thumb", img);
    if (mainImage === img) node.classList.add("is-active");
    const im = node.querySelector("img");
    im.src = img;
    im.alt = "Gallery " + idx;
    node.addEventListener("click", () => {
      productState.mainImage = img;
      renderGallery();
    });
    thumbs.appendChild(node);
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
  panel.innerHTML = "";
  if (tab === "description") {
    const node = cloneTpl("tpl-pd-description");
    node.querySelector("p").textContent = product.description;
    panel.appendChild(node);
  } else {
    const wrap = cloneTpl("tpl-pd-videos");
    (product.videos || []).forEach((vidId, idx) => {
      const v = cloneTpl("tpl-pd-video");
      const iframe = v.querySelector("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + vidId;
      iframe.title = "Product Video " + (idx + 1);
      wrap.appendChild(v);
    });
    panel.appendChild(wrap);
  }
}

async function initPage() {
  const slug = getQueryParam("slug");
  productState.products = await getProducts();
  const product = productState.products.find((p) => p.slug === slug);

  if (!product) {
    document.getElementById("pd-notfound").hidden = false;
    return;
  }

  const content = document.getElementById("pd-content");
  content.hidden = false;

  productState.product = product;
  productState.selectedVariant = (product.variants && product.variants[0]) || null;
  productState.mainImage = (productState.selectedVariant && productState.selectedVariant.image) || product.image;
  document.title = product.name;

  applyBindings(content, product);

  if (product.badge) {
    const badge = document.getElementById("pd-badge");
    badge.hidden = false;
    badge.classList.add(product.badge === "New" ? "product-card__badge--new" : "product-card__badge--sale");
    badge.querySelector("span").textContent = product.badge;
  }

  document.getElementById("pd-price-val").textContent = product.price.toFixed(2);
  if (product.oldPrice) {
    document.getElementById("pd-old").hidden = false;
    document.getElementById("pd-old-val").textContent = product.oldPrice.toFixed(2);
  }

  document.getElementById("pd-buy").setAttribute("href", product.purchaseLink || "#");
  document.getElementById("pd-category").textContent = product.category;
  document.getElementById("pd-tags").textContent = product.tags.join(", ");

  if (product.variants && product.variants.length > 0) {
    const wrap = cloneTpl("tpl-pd-variants");
    wrap.querySelector(".pd__variants-label").textContent = product.variantType || "Choose Option";
    const btns = wrap.querySelector("#pd-variants");
    product.variants.forEach((variant) => {
      const b = cloneTpl("tpl-pd-variant");
      b.setAttribute("data-variant", variant.name);
      b.textContent = variant.name;
      b.addEventListener("click", () => {
        productState.selectedVariant = product.variants.find((v) => v.name === variant.name) || null;
        productState.mainImage = productState.selectedVariant ? productState.selectedVariant.image : product.image;
        renderVariants();
        renderGallery();
      });
      btns.appendChild(b);
    });
    document.getElementById("pd-variants-wrap").appendChild(wrap);
  }

  const otherCategories = productState.products.filter((p) => p.category !== product.category && p.id !== product.id);
  const relatedProducts = otherCategories.sort(() => 0.5 - Math.random()).slice(0, 4);
  if (relatedProducts.length > 0) {
    document.getElementById("pd-related").hidden = false;
    const grid = document.getElementById("pd-related-grid");
    relatedProducts.forEach((p) => grid.appendChild(renderProductCard(p)));
  }

  if (!product.videos || product.videos.length === 0) {
    document.getElementById("pd-tab-videos").hidden = true;
  }

  renderGallery();
  renderVariants();
  renderTabs();

  document.getElementById("pd-tab-description").addEventListener("click", () => {
    productState.activeTab = "description";
    renderTabs();
  });
  document.getElementById("pd-tab-videos").addEventListener("click", () => {
    productState.activeTab = "videos";
    renderTabs();
  });

  bindQuickViews(content, productState.products);
}
