/* Privacy Policy / Terms & Conditions — driven by window.POLICY_TYPE */
async function initPage() {
  const root = document.getElementById("policy-root");
  const type = window.POLICY_TYPE === "terms" ? "terms" : "privacy";
  const data = type === "terms" ? await getTermsConditionsData() : await getPrivacyPolicyData();

  const sections = data.sections
    .map(
      (section) => `
      <div class="policy__section">
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.content)}</p>
      </div>`
    )
    .join("");

  const footerNote =
    type === "privacy"
      ? `<div class="policy__note">If you have any questions about our Privacy Policy, please contact us at hello@grace.com.</div>`
      : "";

  document.title = data.title;

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">${escapeHtml(data.title)}</span>
      </div>
    </div>

    <section data-reveal class="policy container">
      <div class="policy__head">
        <h1 class="policy__title">${escapeHtml(data.title)}</h1>
        <p class="policy__updated">Last Updated: ${escapeHtml(data.lastUpdated)}</p>
      </div>
      <div class="policy__sections">${sections}</div>
      ${footerNote}
    </section>
  `;
}
