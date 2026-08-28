(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

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

  const userAgent = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/i.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const footerLinks = document.querySelector('.footer-links');
  let deferredInstallPrompt = null;
  let installButton = null;

  const showInstallGuide = (platform) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'install-dialog';
    dialog.setAttribute('aria-labelledby', 'install-dialog-title');

    const isAppleGuide = platform === 'ios';
    const title = isAppleGuide
      ? 'Add Frozen Rope to your iPhone'
      : 'Add Frozen Rope to your Android';
    const icon = isAppleGuide
      ? '/icons/apple-touch-icon.png'
      : '/icons/icon-192.png';
    const steps = isAppleGuide
      ? `
        <ol class="install-steps">
          <li>Open <strong>frozenrope.org</strong> in Safari.</li>
          <li>Tap the <strong>Share</strong> button.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Turn on <strong>Open as Web App</strong>, if shown, then tap <strong>Add</strong>.</li>
        </ol>
      `
      : `
        <ol class="install-steps">
          <li>Open your browser menu using the <strong>three-dot</strong> button.</li>
          <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
          <li>Confirm by tapping <strong>Install</strong> or <strong>Add</strong>.</li>
        </ol>
      `;

    dialog.innerHTML = `
      <form class="install-dialog-card" method="dialog">
        <button class="install-dialog-close" type="submit" aria-label="Close installation instructions">×</button>
        <img class="install-dialog-icon" src="${icon}" alt="" width="76" height="76" />
        <p class="eyebrow">Home Screen Shortcut</p>
        <h2 id="install-dialog-title">${title}</h2>
        ${steps}
        <p class="install-dialog-note">No app-store download or account is required.</p>
        <button class="button" type="submit">Got it</button>
      </form>
    `;

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => dialog.remove());
    document.body.appendChild(dialog);

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      window.alert(isAppleGuide
        ? 'In Safari, tap Share, choose Add to Home Screen, then tap Add.'
        : 'Open your browser menu, choose Install app or Add to Home screen, then confirm.');
      dialog.remove();
    }
  };

  if (!isStandalone && footerLinks && (isIos || isAndroid)) {
    installButton = document.createElement('button');
    installButton.className = 'install-link';
    installButton.type = 'button';
    installButton.innerHTML = `
      <img src="${isIos ? '/icons/apple-touch-icon.png' : '/icons/icon-192.png'}" alt="" width="26" height="26" />
      <span>${isIos ? 'Add to iPhone' : 'Install on Android'}</span>
    `;
    footerLinks.appendChild(installButton);

    installButton.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        if (choice.outcome === 'accepted') installButton.hidden = true;
        return;
      }

      showInstallGuide(isIos ? 'ios' : 'android');
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
  }

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
