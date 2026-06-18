/* Privacy Policy / Terms & Conditions — driven by window.POLICY_TYPE.
   Page structure lives in privacy-policy.html / terms-conditions.html; this
   only fetches the data, fills the bind hooks, and clones section templates. */
async function initPage() {
  const root = document.getElementById("policy-root");
  const type = window.POLICY_TYPE === "terms" ? "terms" : "privacy";
  const data = type === "terms" ? await getTermsConditionsData() : await getPrivacyPolicyData();

  document.title = data.title;
  applyBindings(root, data);

  const container = document.getElementById("policy-sections");
  data.sections.forEach((section) => {
    const node = cloneTpl("tpl-policy-section");
    applyBindings(node, section);
    container.appendChild(node);
  });

  if (type === "privacy") document.getElementById("policy-note").hidden = false;
}
