/* Home page — HeroBanner, FeaturedProducts, BannerSection, DiscoverySection */

function heroBannerHtml(slides) {
  const isMobile = window.innerWidth < 768;
  const slidesHtml = slides
    .map((slide, index) => {
      const bg = isMobile && slide.mobileImage ? slide.mobileImage : slide.backgroundImage;
      const active = index === 0;
      return `
      <div class="hero-slide ${active ? "is-active" : ""}" data-index="${index}">
        <div class="hero-bg" style="background-image:url(${bg});transform:${active ? "scale(1.1)" : "scale(1)"}"></div>
        <div class="hero__content">
          <div class="container">
            <div class="hero-text">
              <span class="hero-text__sub">${escapeHtml(slide.subtitle)}</span>
              <h1 class="hero-text__title">${escapeHtml(slide.title)}</h1>
              <p class="hero-text__desc">${escapeHtml(slide.description)}</p>
              <a href="${routeTo(slide.buttonLink)}" class="hero-text__btn">${escapeHtml(slide.buttonText)}</a>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const dots = slides
    .map((_, index) => `<button class="hero-dot" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`)
    .join("");

  return `
    <section class="hero" id="hero-banner">
      ${slidesHtml}
      <div class="hero__dots" id="hero-dots">${dots}</div>
    </section>
  `;
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

function featuredProductsHtml(featured, config) {
  const total = featured.length;
  const cards = featured
    .map((product) => `<div class="featured__item" style="width:${100 / total}%">${productCardHtml(product)}</div>`)
    .join("");

  return `
    <section data-reveal class="featured container" id="featured-section">
      <div class="featured__head">
        <h2 class="featured__title">${escapeHtml(config.featuredProducts.title)}</h2>
        <p class="featured__sub">${escapeHtml(config.featuredProducts.subtitle)}</p>
      </div>
      <div class="featured__viewport">
        <div id="featured-track" class="featured__track" style="width:${(total / 4) * 100}%;transform:translateX(0%)">
          ${cards}
        </div>
      </div>
    </section>
  `;
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

function bannerSectionHtml(banners) {
  const items = banners
    .map((banner) => {
      const tintClass = banner.bgColor === "bg-[#CCDCD2]" ? "banner__tint--green" : "banner__tint--gray";
      const subtitle = banner.subtitle ? `<span class="banner__sub">${escapeHtml(banner.subtitle)}</span>` : "";
      const description = banner.description ? `<p class="banner__desc">${escapeHtml(banner.description)}</p>` : "";
      return `
      <div class="banner">
        <img src="${banner.image}" alt="${escapeHtml(banner.title)}" class="banner__img" />
        <div class="banner__tint ${tintClass}"></div>
        <div class="banner__content">
          ${subtitle}
          <h2 class="banner__title">${escapeHtml(banner.title)}</h2>
          ${description}
          <a href="${routeTo(banner.buttonLink)}" class="banner__btn">${escapeHtml(banner.buttonText)}</a>
        </div>
      </div>`;
    })
    .join("");

  return `
    <section data-reveal class="banners container">
      <div class="banners__grid">${items}</div>
    </section>
  `;
}

function discoverySectionHtml(data) {
  const items = data.items
    .map(
      (item) => `
      <div class="discovery__item">
        <a href="${routeTo(item.linkUrl)}" class="discovery__media">
          <div class="discovery__media-inner">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" />
          </div>
        </a>
        <div class="discovery__body">
          <h3 class="discovery__name">${escapeHtml(item.title)}</h3>
          <a href="${routeTo(item.linkUrl)}" class="discovery__link">
            ${escapeHtml(item.linkText)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>`
    )
    .join("");

  return `
    <section data-reveal class="discovery container">
      <div class="discovery__head">
        <h2 class="discovery__title">${escapeHtml(data.heading)}</h2>
        <p class="discovery__desc">${escapeHtml(data.description)}</p>
      </div>
      <div class="discovery__grid">${items}</div>
    </section>
  `;
}

async function initPage() {
  const root = document.getElementById("home-root");
  const [slides, featured, config, banners, discovery] = await Promise.all([
    getHeroSlides(),
    getFeaturedProducts(),
    getSiteConfig(),
    getPromoBanners(),
    getDiscoveryData(),
  ]);

  root.innerHTML =
    heroBannerHtml(slides) +
    featuredProductsHtml(featured, config) +
    bannerSectionHtml(banners) +
    discoverySectionHtml(discovery);

  initHero(slides);
  initFeatured(featured);
}
