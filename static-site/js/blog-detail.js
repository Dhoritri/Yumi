/* Blog detail page — by ?slug=, with prev/next + related posts */
async function initPage() {
  const root = document.getElementById("blog-detail-root");
  const slug = getQueryParam("slug");
  const all = await getBlogs();

  const postIndex = all.findIndex((p) => p.slug === slug);
  const post = all[postIndex];

  if (!post) {
    root.innerHTML = `<div class="notfound-screen"><h1>Post not found</h1></div>`;
    return;
  }

  const prevPost = postIndex > 0 ? all[postIndex - 1] : null;
  const nextPost = postIndex < all.length - 1 ? all[postIndex + 1] : null;
  const relatedPosts = all.filter((p) => p.id !== post.id).slice(0, 3);

  const prevHtml = prevPost
    ? `<a href="${routeTo("/blog/" + prevPost.slug)}" class="article__nav-link">
        <div class="article__nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <div>
          <span class="article__nav-label">Previous</span>
          <p class="article__nav-title">${escapeHtml(prevPost.title)}</p>
        </div>
      </a>`
    : "";

  const nextHtml = nextPost
    ? `<a href="${routeTo("/blog/" + nextPost.slug)}" class="article__nav-link article__nav-link--next">
        <div>
          <span class="article__nav-label">Next</span>
          <p class="article__nav-title">${escapeHtml(nextPost.title)}</p>
        </div>
        <div class="article__nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>`
    : "";

  const related = relatedPosts
    .map(
      (rPost) => `
      <a href="${routeTo("/blog/" + rPost.slug)}" class="related-card">
        <article>
          <div class="related-card__media">
            <img src="${rPost.image}" alt="${escapeHtml(rPost.title)}" />
          </div>
          <div class="related-card__meta">
            <span>${escapeHtml(rPost.category)}</span>
            <span>|</span>
            <span>${escapeHtml(rPost.month)} ${escapeHtml(rPost.day)}</span>
          </div>
          <h3 class="related-card__title">${escapeHtml(rPost.title)}</h3>
        </article>
      </a>`
    )
    .join("");

  document.title = post.title;

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb crumb--truncate">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <a href="blog.html">Blogs</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">${escapeHtml(post.title)}</span>
      </div>
    </div>

    <article class="container article">
      <div class="article__head">
        <div class="article__cat">${escapeHtml(post.category)}</div>
        <h1 class="article__title">${escapeHtml(post.title)}</h1>
        <div class="article__meta">
          <span>By <b>${escapeHtml(post.author)}</b></span>
          <span class="sep">|</span>
          <span>${escapeHtml(post.month)} ${escapeHtml(post.day)}</span>
        </div>
      </div>

      <div class="article__hero">
        <img src="${post.image}" alt="${escapeHtml(post.title)}" />
      </div>

      <div class="article__content">
        <div><p>${escapeHtml(post.description)}</p></div>

        <div class="article__nav">
          ${prevHtml}
          <div class="article__spacer"></div>
          ${nextHtml}
        </div>
      </div>
    </article>

    <section class="related">
      <div class="container">
        <h2 class="related__title">Related Posts</h2>
        <div class="related__grid">${related}</div>
      </div>
    </section>
  `;
}
