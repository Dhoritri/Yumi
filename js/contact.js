/* Contact page — structure lives in contact.html; this fills the bind hooks
   and prevents the demo form from submitting. */
async function initPage() {
  const root = document.getElementById("contact-root");
  const data = await getContactData();
  applyBindings(root, data);

  document.getElementById("contact-form").addEventListener("submit", (e) => e.preventDefault());
}
