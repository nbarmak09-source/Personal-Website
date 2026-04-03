document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const overlay = document.getElementById('cardOverlay');
  const expandedCards = document.querySelectorAll('.expanded-card');

  function closeAllCards() {
    expandedCards.forEach(card => card.classList.remove('open'));
    overlay.classList.remove('open');
  }

  function switchTab(targetId) {
    closeAllCards();

    tabContents.forEach(tab => {
      tab.classList.remove('active');
      tab.style.opacity = '0';
    });

    navLinks.forEach(link => link.classList.remove('active'));

    const target = document.getElementById(targetId);
    const activeLink = document.querySelector(`[data-tab="${targetId}"]`);

    if (target && activeLink) {
      activeLink.classList.add('active');
      target.classList.add('active');
      requestAnimationFrame(() => {
        target.style.opacity = '1';
      });
      history.replaceState(null, '', `#${targetId}`);
    }
  }

  // Restore tab from URL hash on load/refresh
  const hash = window.location.hash.slice(1);
  if (hash && ['home', 'resume', 'projects', 'personal'].includes(hash)) {
    switchTab(hash);
  } else {
    switchTab('home');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Roadmap: click to expand cards
  const stopContents = document.querySelectorAll('.stop-content');
  const closeButtons = document.querySelectorAll('.card-close');

  stopContents.forEach(stop => {
    stop.addEventListener('click', () => {
      const interest = stop.getAttribute('data-interest');
      const card = document.getElementById(`card-${interest}`);

      if (card) {
        closeAllCards();
        card.classList.add('open');
        overlay.classList.add('open');
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllCards();
    });
  });

  overlay.addEventListener('click', closeAllCards);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCards();
  });

  // Contact dropdown toggle
  const contactTrigger = document.getElementById('contactTrigger');
  const contactDropdown = document.getElementById('contactDropdown');

  contactTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    contactTrigger.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    contactTrigger.classList.remove('open');
  });

  contactDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});
