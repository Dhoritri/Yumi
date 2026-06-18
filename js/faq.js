/* FAQ page — accordion (default open id = 1).
   Page structure + templates live in faq.html; this clones them, fills data,
   and wires the open/close behavior. */
let faqOpenIndex = 1;

async function initPage() {
  const root = document.getElementById("faq-root");
  const data = await getFAQData();
  applyBindings(root, data);

  const list = document.getElementById("faq-list");

  const syncOpen = () => {
    list.querySelectorAll(".faq__q").forEach((el) => {
      el.classList.toggle("is-open", Number(el.getAttribute("data-faq-id")) === faqOpenIndex);
    });
  };

  data.categories.forEach((category) => {
    const cat = cloneTpl("tpl-faq-cat");
    applyBindings(cat, category);
    const items = cat.querySelector(".faq__items");

    category.questions.forEach((q) => {
      const qEl = cloneTpl("tpl-faq-q");
      applyBindings(qEl, q);
      qEl.setAttribute("data-faq-id", q.id);
      qEl.querySelector(".faq__q-btn").addEventListener("click", () => {
        faqOpenIndex = faqOpenIndex === q.id ? null : q.id;
        syncOpen();
      });
      items.appendChild(qEl);
    });

    list.appendChild(cat);
  });

  syncOpen();
}
