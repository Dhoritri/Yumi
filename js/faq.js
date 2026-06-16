/* FAQ page — accordion (default open id = 1) */
let faqOpenIndex = 1;

async function initPage() {
  const root = document.getElementById("faq-root");
  const data = await getFAQData();

  const renderAccordion = () => {
    const categories = data.categories
      .map((category) => {
        const questions = category.questions
          .map((q) => {
            const isOpen = faqOpenIndex === q.id;
            return `
            <div class="faq__q${isOpen ? " is-open" : ""}">
              <button data-faq="${q.id}" class="faq__q-btn">
                <span class="faq__q-text">${escapeHtml(q.question)}</span>
                <span class="faq__q-icon">+</span>
              </button>
              <div class="faq__a"><p>${escapeHtml(q.answer)}</p></div>
            </div>`;
          })
          .join("");
        return `
        <div class="faq__cat">
          <h2 class="faq__cat-title">${escapeHtml(category.name)}</h2>
          <div class="faq__items">${questions}</div>
        </div>`;
      })
      .join("");

    document.getElementById("faq-list").innerHTML = categories;
    document.querySelectorAll("[data-faq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-faq"), 10);
        faqOpenIndex = faqOpenIndex === id ? null : id;
        renderAccordion();
      });
    });
  };

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">FAQ</span>
      </div>
    </div>

    <section data-reveal class="faq container">
      <div class="faq__head">
        <h1 class="faq__title">${escapeHtml(data.title)}</h1>
        <p class="faq__desc">${escapeHtml(data.description)}</p>
      </div>
      <div class="faq__list" id="faq-list"></div>
    </section>
  `;

  renderAccordion();
}
