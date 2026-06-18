/* Blog listing page — pagination (12 per page).
   Structure + templates live in blog.html; this clones cards/pager and wires
   the paging behavior. */
const blogState = { blogs: [], currentPage: 1, perPage: 12 };

function renderBlogList() {
  const grid = document.getElementById("blog-grid");
  const pagerWrap = document.getElementById("blog-pager");
  const { blogs: all, currentPage, perPage } = blogState;
  const indexOfLast = currentPage * perPage;
  const current = all.slice(indexOfLast - perPage, indexOfLast);
  const totalPages = Math.ceil(all.length / perPage);

  const paginate = (n) => {
    blogState.currentPage = n;
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderBlogList();
  };

  grid.innerHTML = "";
  current.forEach((post) => {
    const node = cloneTpl("tpl-blog-card");
    applyBindings(node, post);
    node.querySelector(".blog-card").setAttribute("href", routeTo("/blog/" + post.slug));
    grid.appendChild(node);
  });

  pagerWrap.innerHTML = "";
  if (totalPages > 1) {
    const pager = cloneTpl("tpl-blog-pager");
    const nums = pager.querySelector(".pager__nums");
    for (let i = 1; i <= totalPages; i++) {
      const b = cloneTpl("tpl-blog-pagenum");
      b.textContent = i;
      if (currentPage === i) b.classList.add("is-active");
      b.addEventListener("click", () => paginate(i));
      nums.appendChild(b);
    }
    const prev = pager.querySelector("[data-prev]");
    const next = pager.querySelector("[data-next]");
    prev.disabled = currentPage === 1;
    next.disabled = currentPage === totalPages;
    prev.addEventListener("click", () => paginate(Math.max(1, currentPage - 1)));
    next.addEventListener("click", () => paginate(Math.min(totalPages, currentPage + 1)));
    pagerWrap.appendChild(pager);
  }

  initReveal();
}

async function initPage() {
  blogState.blogs = await getBlogs();
  renderBlogList();
}
