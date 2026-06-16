/* Blog listing page — pagination (12 per page) */
const blogState = { blogs: [], currentPage: 1, perPage: 12 };

function renderBlogList() {
  const root = document.getElementById("blog-list-root");
  const { blogs: all, currentPage, perPage } = blogState;
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const current = all.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(all.length / perPage);

  const cards = current
    .map(
      (post) => `
      <div data-reveal>
        <a href="${routeTo("/blog/" + post.slug)}" class="blog-card">
          <article>
            <div class="blog-card__media">
              <img src="${post.image}" alt="${escapeHtml(post.title)}" />
              <div class="blog-card__tag">${escapeHtml(post.category)}</div>
            </div>
            <div class="blog-card__body">
              <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
              <div class="blog-card__meta">
                <span>By <b>${escapeHtml(post.author)}</b></span>
                <span class="sep">|</span>
                <span>${escapeHtml(post.month)} ${escapeHtml(post.day)}</span>
              </div>
            </div>
          </article>
        </a>
      </div>`
    )
    .join("");

  let pagination = "";
  if (totalPages > 1) {
    let nums = "";
    for (let i = 1; i <= totalPages; i++) {
      nums += `<button data-bpage="${i}" class="pager__num-round${currentPage === i ? " is-active" : ""}">${i}</button>`;
    }
    pagination = `
      <div class="pager pager--blog">
        <button id="blog-prev" class="pager__round" ${currentPage === 1 ? "disabled" : ""}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="pager__nums">${nums}</div>
        <button id="blog-next" class="pager__round" ${currentPage === totalPages ? "disabled" : ""}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
  }

  root.innerHTML = `<div class="blog__grid">${cards}</div>${pagination}`;

  const paginate = (n) => {
    blogState.currentPage = n;
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderBlogList();
  };
  root.querySelectorAll("[data-bpage]").forEach((b) =>
    b.addEventListener("click", () => paginate(parseInt(b.getAttribute("data-bpage"), 10)))
  );
  const prev = root.querySelector("#blog-prev");
  const next = root.querySelector("#blog-next");
  if (prev) prev.addEventListener("click", () => paginate(Math.max(1, currentPage - 1)));
  if (next) next.addEventListener("click", () => paginate(Math.min(totalPages, currentPage + 1)));

  initReveal();
}

async function initPage() {
  const root = document.getElementById("blog-root");
  blogState.blogs = await getBlogs();

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">Blogs</span>
      </div>
    </div>

    <section data-reveal class="blog container">
      <div class="blog__head"><h1>Blogs</h1></div>
      <div id="blog-list-root"></div>
    </section>
  `;

  renderBlogList();
}
