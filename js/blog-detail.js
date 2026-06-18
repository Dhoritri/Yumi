/* Blog detail page — by ?slug=, with prev/next + related posts.
   Structure + templates live in blog-detail.html; this fills the bind hooks
   and clones the prev/next and related templates. */
async function initPage() {
  const slug = getQueryParam("slug");
  const all = await getBlogs();
  const postIndex = all.findIndex((p) => p.slug === slug);
  const post = all[postIndex];

  if (!post) {
    document.getElementById("bd-notfound").hidden = false;
    return;
  }

  const content = document.getElementById("bd-content");
  content.hidden = false;
  document.title = post.title;
  applyBindings(content, post);

  const prevPost = postIndex > 0 ? all[postIndex - 1] : null;
  const nextPost = postIndex < all.length - 1 ? all[postIndex + 1] : null;
  const relatedPosts = all.filter((p) => p.id !== post.id).slice(0, 3);

  const nav = document.getElementById("bd-nav");
  const spacer = nav.querySelector(".article__spacer");

  if (prevPost) {
    const node = cloneTpl("tpl-bd-prev");
    applyBindings(node, prevPost);
    node.setAttribute("href", routeTo("/blog/" + prevPost.slug));
    nav.insertBefore(node, spacer);
  }

  if (nextPost) {
    const node = cloneTpl("tpl-bd-next");
    applyBindings(node, nextPost);
    node.setAttribute("href", routeTo("/blog/" + nextPost.slug));
    nav.appendChild(node);
  }

  const relatedWrap = document.getElementById("bd-related");
  relatedPosts.forEach((rPost) => {
    const node = cloneTpl("tpl-related-card");
    applyBindings(node, rPost);
    node.setAttribute("href", routeTo("/blog/" + rPost.slug));
    relatedWrap.appendChild(node);
  });
}
