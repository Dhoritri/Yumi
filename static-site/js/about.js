/* About page */
async function initPage() {
  const root = document.getElementById("about-root");
  const data = await getAboutData();

  const sections = data.sections
    .map((section) => {
      const rowMod = section.imagePosition === "right" ? " about-row--img-right" : "";
      return `
      <div data-reveal class="container">
        <div class="about-row${rowMod}">
          <div class="about-row__media">
            <img src="${section.image}" alt="${escapeHtml(section.title)}" />
          </div>
          <div class="about-row__text">
            <h2 class="about-row__title">${escapeHtml(section.title)}</h2>
            <p class="about-row__desc">${escapeHtml(section.description)}</p>
          </div>
        </div>
      </div>`;
    })
    .join("");

  root.innerHTML = `
    <section data-reveal class="about-hero">
      <div class="container about-hero__content">
        <div class="about-hero__inner">
          <span class="about-hero__sub">${escapeHtml(data.hero.subtitle)}</span>
          <h1 class="about-hero__title">${escapeHtml(data.hero.title)}</h1>
        </div>
      </div>
      <div class="about-hero__bg">
        <img src="${data.hero.backgroundImage}" alt="About Hero" />
      </div>
    </section>

    <section data-reveal class="about-mission container">
      <div class="about-mission__inner">
        <div class="about-mission__icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 10C30 10 24 20 24 28C24 34 28 38 30 38C32 38 36 34 36 28C36 20 30 10 30 10Z" fill="#A8BCA1"/>
            <path d="M18 25C18 25 12 33 12 40C12 45 15 48 18 48C21 48 24 45 24 40C24 33 18 25 18 25Z" fill="#A8BCA1" opacity="0.5"/>
            <path d="M42 25C42 25 48 33 48 40C48 45 45 48 42 48C39 48 36 45 36 40C36 33 42 25 42 25Z" fill="#A8BCA1" opacity="0.5"/>
          </svg>
        </div>
        <h2 class="about-mission__title">${escapeHtml(data.missionStatement.title)}</h2>
        <div class="about-mission__desc-wrap">
          <p class="about-mission__desc">${escapeHtml(data.missionStatement.description)}</p>
        </div>
      </div>
    </section>

    <section class="about-sections">${sections}</section>
  `;
}
