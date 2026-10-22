const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航');
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const motionSections = [...document.querySelectorAll('main > section[id]:not(#home)')];

function markMotionItem(element, delay = 0, type = 'motion-item') {
  if (!element) return;
  element.classList.add(type);
  element.style.setProperty('--motion-delay', `${delay}ms`);
}

function markStagger(container, selector, start = 320, step = 125) {
  [...container.querySelectorAll(selector)].forEach((element, index) => {
    markMotionItem(element, start + index * step, 'motion-card');
    const visual = element.querySelector('.work-visual');
    if (visual) visual.classList.add('motion-image');
  });
}

function revealWorkCards(category, animate = true) {
  const cards = [...category.querySelectorAll('.work-card')];
  cards.forEach((card, index) => {
    card.classList.add('motion-card');
    const visual = card.querySelector('.work-visual');
    if (visual) visual.classList.add('motion-image');
    card.classList.remove('motion-visible');
    visual?.classList.remove('motion-image-visible');
    card.style.setProperty('--motion-delay', `${animate ? 130 + index * 105 : 0}ms`);
  });
  requestAnimationFrame(() => cards.forEach((card, index) => {
    card.classList.add('motion-visible');
    const visual = card.querySelector('.work-visual');
    if (visual) window.setTimeout(() => visual.classList.add('motion-image-visible'), animate ? 190 + index * 105 : 0);
  }));
}

if (!prefersReducedMotion) {
  root.classList.add('motion-ready');
  const hero = document.querySelector('#home');
  const heroParts = [
    '.eyebrow', '.role', '.hero-intro', '.hero-tags', '.text-link',
    '.portrait-frame', '.note-one', '.note-two', '.hero-stamp', '.hero-bottom', '.hero-scribble',
  ];
  heroParts.forEach((selector, index) => {
    const element = hero.querySelector(selector);
    if (!element) return;
    element.classList.add('opening-part');
    element.style.setProperty('--opening-delay', `${selector === '.portrait-frame' ? 360 : 190 + index * 95}ms`);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('motion-open')));

  const choreography = {
    about: [['.section-kicker', 0], ['.about-grid > .display-title', 180], ['.about-body', 330], ['.about-facts', 500]],
    education: [['.section-kicker', 0], ['.education-item', 220, 135], ['.school-strip', 600]],
    experience: [['.section-kicker', 0], ['.experience-intro', 180], ['.experience-card', 360, 180]],
    projects: [['.section-kicker', 0], ['.projects-heading', 170], ['.work-categories', 320], ['.category-heading', 450]],
    skills: [['.section-kicker', 0], ['.skills-main > .display-title', 180], ['.skills-lead', 260], ['.skill-group', 350, 130], ['.skill-quote', 650], ['.hobbies', 330], ['.hobby-card', 470, 170], ['.hobby-note', 730]],
    contact: [['.contact-inner', 0]],
  };

  motionSections.forEach((section) => {
    const groups = choreography[section.id] || [];
    groups.forEach(([selector, start = 0, step = 0]) => {
      if (selector === '.work-categories') {
        markMotionItem(section.querySelector(selector), start);
      } else if (selector === '.category-heading') {
        section.querySelectorAll('.work-category:not([hidden]) .category-heading').forEach((item) => markMotionItem(item, start));
      } else if (step) {
        [...section.querySelectorAll(selector)].forEach((item, index) => markMotionItem(item, start + index * step, 'motion-card'));
      } else {
        markMotionItem(section.querySelector(selector), start);
      }
    });
    section.querySelectorAll('.work-card').forEach((card) => {
      card.classList.add('motion-card');
      const visual = card.querySelector('.work-visual');
      if (visual) visual.classList.add('motion-image');
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-section-visible');
      entry.target.querySelectorAll('.motion-item, .motion-card').forEach((item) => item.classList.add('motion-visible'));
      const activeCategory = entry.target.querySelector('.work-category:not([hidden])');
      if (activeCategory) revealWorkCards(activeCategory, true);
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  motionSections.forEach((section) => sectionObserver.observe(section));

  let parallaxFrame = 0;
  const updateParallax = () => {
    parallaxFrame = 0;
    const viewportCenter = window.innerHeight * 0.5;
    document.querySelectorAll('.work-category:not([hidden]) .work-visual.motion-image > img').forEach((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const offset = Math.max(-9, Math.min(9, (viewportCenter - (rect.top + rect.height * 0.5)) / viewportCenter * 9));
      image.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    });
  };
  const requestParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
  };
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax, { passive: true });
  requestParallax();
}

const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => activeObserver.observe(section));

const categoryTabs = [...document.querySelectorAll('.category-tab')];
const categories = [...document.querySelectorAll('.work-category')];

function activateCategory(id, shouldScroll = false) {
  const selected = categories.find((category) => category.id === id);
  if (!selected) return;
  categories.forEach((category) => {
    const isActive = category === selected;
    category.hidden = !isActive;
    category.classList.toggle('active', isActive);
  });
  categoryTabs.forEach((tab) => {
    const isActive = tab.dataset.category === id;
    tab.classList.toggle('active', isActive);
    if (isActive) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  if (!prefersReducedMotion && selected.closest('#projects')?.classList.contains('motion-section-visible')) {
    const heading = selected.querySelector('.category-heading');
    if (heading) {
      heading.classList.add('motion-item');
      heading.style.setProperty('--motion-delay', '0ms');
      heading.classList.remove('motion-visible');
      requestAnimationFrame(() => heading.classList.add('motion-visible'));
    }
    revealWorkCards(selected, true);
  }
  if (shouldScroll) selected.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

categoryTabs.forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    const id = tab.dataset.category;
    activateCategory(id, true);
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  });
});

const initialCategory = location.hash.slice(1);
activateCategory(
  categories.some((category) => category.id === initialCategory) ? initialCategory : categories[0]?.id,
);
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (categories.some((category) => category.id === id)) activateCategory(id);
});
window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (categories.some((category) => category.id === id)) activateCategory(id);
  else activateCategory(categories[0]?.id);
});

// Detail views for the awards and other-works categories, using supplied card content.
const detailCards = document.querySelectorAll('#awards .work-card, #other-works .work-card');
const detailDialog = document.createElement('dialog');
detailDialog.className = 'work-detail-dialog';
detailDialog.setAttribute('aria-labelledby', 'work-detail-title');
detailDialog.innerHTML = `
  <div class="work-detail-shell">
    <button class="work-detail-close" type="button" aria-label="关闭详情">×</button>
    <div class="work-detail-image-wrap"><img class="work-detail-image" alt=""></div>
    <div class="work-detail-copy">
      <div class="work-meta work-detail-meta"></div>
      <h2 id="work-detail-title"></h2>
      <p class="work-detail-description"></p>
      <div class="work-detail-actions"></div>
    </div>
  </div>`;
document.body.append(detailDialog);

const detailImage = detailDialog.querySelector('.work-detail-image');
const detailMeta = detailDialog.querySelector('.work-detail-meta');
const detailTitle = detailDialog.querySelector('#work-detail-title');
const detailDescription = detailDialog.querySelector('.work-detail-description');
const detailActions = detailDialog.querySelector('.work-detail-actions');

detailCards.forEach((card) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'detail-button';
  button.textContent = '查看详情 ↗';
  button.setAttribute('aria-label', `查看${card.querySelector('h4')?.textContent.trim() || '作品'}详情`);
  card.querySelector('.work-copy').append(button);
  button.addEventListener('click', () => {
    const image = card.querySelector('.work-visual img');
    detailImage.src = image.src;
    detailImage.alt = image.alt;
    detailMeta.replaceChildren(...[...card.querySelectorAll('.work-meta span')].map((item) => {
      const span = document.createElement('span');
      span.textContent = item.textContent;
      return span;
    }));
    detailTitle.textContent = card.querySelector('h4').textContent;
    detailDescription.textContent = card.querySelector('.work-copy p').textContent;
    detailActions.replaceChildren();
    const sourceLink = card.querySelector('.work-actions a');
    if (sourceLink) detailActions.append(sourceLink.cloneNode(true));
    else {
      const note = document.createElement('span');
      note.className = 'no-link-note';
      note.textContent = '资料中未提供体验链接';
      detailActions.append(note);
    }
    detailDialog.showModal();
  });
});

detailDialog.querySelector('.work-detail-close').addEventListener('click', () => detailDialog.close());
detailDialog.addEventListener('click', (event) => {
  if (event.target === detailDialog) detailDialog.close();
});
detailDialog.addEventListener('close', () => detailImage.removeAttribute('src'));
