/* Contact page */
async function initPage() {
  const root = document.getElementById("contact-root");
  const data = await getContactData();

  root.innerHTML = `
    <div class="crumbbar">
      <div class="container crumb">
        <a href="index.html">Home</a>
        <span class="crumb__sep">—</span>
        <span class="crumb__current">Contact Us</span>
      </div>
    </div>

    <div data-reveal>
      <section class="contact container">
        <div class="contact__head">
          <h1 class="contact__title">${escapeHtml(data.header.title)}</h1>
          <p class="contact__desc">${escapeHtml(data.header.description)}</p>
        </div>

        <div class="contact__grid">
          <div class="contact__item">
            <div class="contact__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h3>${escapeHtml(data.address.title)}</h3>
              <div class="contact__lines">
                <p>${escapeHtml(data.address.lines[0])}<br />${escapeHtml(data.address.lines[1])}</p>
                <p>${escapeHtml(data.address.lines[2])}<br />${escapeHtml(data.address.lines[3])}</p>
              </div>
            </div>
          </div>

          <div class="contact__item">
            <div class="contact__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <h3>${escapeHtml(data.contact.title)}</h3>
              <div class="contact__lines">
                <p>Mobile: <b>${escapeHtml(data.contact.mobile)}</b></p>
                <p>Hotline: <b>${escapeHtml(data.contact.hotline)}</b></p>
                <p>E-mail: <span class="email">${escapeHtml(data.contact.email)}</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="contact-form-section">
        <div class="container contact-form-wrap">
          <h2 class="contact-form__title">${escapeHtml(data.form.title)}</h2>
          <form class="contact-form" id="contact-form">
            <div class="contact-form__row">
              <input type="text" placeholder="${escapeHtml(data.form.placeholders.name)}" />
              <input type="email" placeholder="${escapeHtml(data.form.placeholders.email)}" />
              <input type="tel" placeholder="${escapeHtml(data.form.placeholders.phone)}" />
            </div>
            <textarea placeholder="${escapeHtml(data.form.placeholders.message)}" rows="8"></textarea>
            <div class="contact-form__submit-wrap">
              <button type="submit" class="contact-form__submit">${escapeHtml(data.form.buttonText)}</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;

  document.getElementById("contact-form").addEventListener("submit", (e) => e.preventDefault());
}
