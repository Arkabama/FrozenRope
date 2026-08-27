(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  document.querySelectorAll('.brand-mark img').forEach((img) => {
    img.src = '/frsci-logo-header.png';
  });

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      });
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const contactStatus = contactForm.querySelector('[data-contact-status]');
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const data = new FormData(contactForm);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const subject = String(data.get('subject') || 'Website inquiry').trim();
      const message = String(data.get('message') || '').trim();

      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message
      ].join('\n');

      const mailtoUrl = `mailto:contact@frozenrope.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (contactStatus) {
        contactStatus.textContent = 'Opening your email application… If nothing happens, email contact@frozenrope.org directly.';
      }

      window.setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 100);
    });
  }
})();
