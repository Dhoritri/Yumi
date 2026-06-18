/* Home page — HeroBanner, FeaturedProducts, BannerSection, DiscoverySection.
   Page structure + templates live in index.html; this clones them, fills data,
   and wires the carousels. */

function renderHero(slides) {
  const isMobile = window.innerWidth < 768;
  const hero = document.getElementById("hero-banner");
  const dots = document.getElementById("hero-dots");

  slides.forEach((slide, index) => {
    const node = cloneTpl("tpl-hero-slide");
    node.setAttribute("data-index", index);
    if (index === 0) node.classList.add("is-active");

    const bg = isMobile && slide.mobileImage ? slide.mobileImage : slide.backgroundImage;
    const bgEl = node.querySelector(".hero-bg");
    bgEl.style.backgroundImage = `url(${bg})`;
    bgEl.style.transform = index === 0 ? "scale(1.1)" : "scale(1)";

    node.querySelector(".hero-text__sub").textContent = slide.subtitle;
    node.querySelector(".hero-text__title").textContent = slide.title;
    node.querySelector(".hero-text__desc").textContent = slide.description;
    const btn = node.querySelector(".hero-text__btn");
    btn.setAttribute("href", routeTo(slide.buttonLink));
    btn.textContent = slide.buttonText;

    hero.insertBefore(node, dots);
  });

  slides.forEach((_, index) => {
    const dot = cloneTpl("tpl-hero-dot");
    dot.setAttribute("data-index", index);
    dot.setAttribute("aria-label", "Go to slide " + (index + 1));
    dots.appendChild(dot);
  });
}

function initHero(slides) {
  let current = 0;
  const slideEls = Array.from(document.querySelectorAll(".hero-slide"));
  const dotEls = Array.from(document.querySelectorAll(".hero-dot"));

  const renderDots = () => {
    dotEls.forEach((dot, i) => {
      dot.innerHTML =
        i === current
          ? `<div class="hero-dot__active"><span></span></div>`
          : `<div class="hero-dot__idle"></div>`;
    });
  };

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slideEls.forEach((el, i) => {
      const isActive = i === current;
      el.classList.toggle("is-active", isActive);
      el.querySelector(".hero-bg").style.transform = isActive ? "scale(1.1)" : "scale(1)";
    });
    renderDots();
  };

  renderDots();
  dotEls.forEach((dot) =>
    dot.addEventListener("click", () => show(parseInt(dot.getAttribute("data-index"), 10)))
  );

  setInterval(() => show(current + 1), 5000);

  let wasMobile = window.innerWidth < 768;
  window.addEventListener("resize", () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile !== wasMobile) {
      wasMobile = isMobile;
      slideEls.forEach((el, i) => {
        const slide = slides[i];
        const url = isMobile && slide.mobileImage ? slide.mobileImage : slide.backgroundImage;
        el.querySelector(".hero-bg").style.backgroundImage = `url(${url})`;
      });
    }
  });
}

function renderFeatured(featured, config) {
  document.getElementById("featured-title").textContent = config.featuredProducts.title;
  document.getElementById("featured-sub").textContent = config.featuredProducts.subtitle;

  const total = featured.length;
  const track = document.getElementById("featured-track");
  track.style.width = `${(total / 4) * 100}%`;
  track.style.transform = "translateX(0%)";

  featured.forEach((product) => {
    const item = cloneTpl("tpl-featured-item");
    item.style.width = `${100 / total}%`;
    item.appendChild(renderProductCard(product));
    track.appendChild(item);
  });
}

function initFeatured(featured) {
  const total = featured.length;
  const track = document.getElementById("featured-track");
  let visibleItems = 4;
  let currentIndex = 0;
  let timer = null;

  const computeVisible = () => {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const apply = () => {
    track.style.width = `${(total / visibleItems) * 100}%`;
    track.style.transform = `translateX(-${(currentIndex * 100) / total}%)`;
  };

  const start = () => {
    if (timer) clearInterval(timer);
    if (total > visibleItems) {
      timer = setInterval(() => {
        const maxIndex = total - visibleItems;
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        apply();
      }, 3000);
    } else {
      currentIndex = 0;
      apply();
    }
  };

  const handleResize = () => {
    visibleItems = computeVisible();
    if (currentIndex > total - visibleItems) currentIndex = Math.max(0, total - visibleItems);
    apply();
    start();
  };

  visibleItems = computeVisible();
  apply();
  start();
  window.addEventListener("resize", handleResize);

  bindQuickViews(document.getElementById("featured-section"), featured);
}

function renderBanners(banners) {
  const grid = document.getElementById("banners-grid");
  banners.forEach((banner) => {
    const node = cloneTpl("tpl-banner");
    const tintClass = banner.bgColor === "bg-[#CCDCD2]" ? "banner__tint--green" : "banner__tint--gray";
    node.querySelector(".banner__tint").classList.add(tintClass);

    const img = node.querySelector(".banner__img");
    img.src = banner.image;
    img.alt = banner.title;

    const sub = node.querySelector(".banner__sub");
    if (banner.subtitle) sub.textContent = banner.subtitle; else sub.remove();

    node.querySelector(".banner__title").textContent = banner.title;

    const desc = node.querySelector(".banner__desc");
    if (banner.description) desc.textContent = banner.description; else desc.remove();

    const btn = node.querySelector(".banner__btn");
    btn.setAttribute("href", routeTo(banner.buttonLink));
    btn.textContent = banner.buttonText;

    grid.appendChild(node);
  });
}

function renderDiscovery(data) {
  document.getElementById("discovery-title").textContent = data.heading;
  document.getElementById("discovery-desc").textContent = data.description;

  const grid = document.getElementById("discovery-grid");
  data.items.forEach((item) => {
    const node = cloneTpl("tpl-discovery-item");
    node.querySelector(".discovery__media").setAttribute("href", routeTo(item.linkUrl));

    const img = node.querySelector("img");
    img.src = item.image;
    img.alt = item.title;

    node.querySelector(".discovery__name").textContent = item.title;
    node.querySelector(".discovery__link").setAttribute("href", routeTo(item.linkUrl));
    node.querySelector(".discovery__link-text").textContent = item.linkText;

    grid.appendChild(node);
  });
}

async function initPage() {
  const [slides, featured, config, banners, discovery] = await Promise.all([
    getHeroSlides(),
    getFeaturedProducts(),
    getSiteConfig(),
    getPromoBanners(),
    getDiscoveryData(),
  ]);

  renderHero(slides);
  renderFeatured(featured, config);
  renderBanners(banners);
  renderDiscovery(discovery);

  initHero(slides);
  initFeatured(featured);
}
