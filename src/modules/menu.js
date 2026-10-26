import { getShadowRoot } from '../core/shadow.js';
import { trackEvent } from '../core/ga4.js';

export function initMenuModule(config) {
  const menuFeatures = config.features.filter((f) => f.type === 'quick_menu');
  if (menuFeatures.length === 0) return;

  const shadowRoot = getShadowRoot(config.theme);

  menuFeatures.forEach((menu) => {
    const iconEl = document.createElement('div');
    iconEl.className = 'lt-sticky-icon';
    iconEl.title = menu.title || 'ヘルプ＆クイックポータル';
    iconEl.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;

    let modalEl = null;

    iconEl.onclick = () => {
      if (modalEl) {
        closeModal();
      } else {
        openModal();
      }
    };

    function openModal() {
      trackEvent(config.ga4, 'quick_menu_open', { feature: 'quick_menu', menu_id: menu.id });

      modalEl = document.createElement('div');
      modalEl.className = 'lt-card lt-responsive-sheet';
      modalEl.style.position = 'fixed';
      modalEl.style.bottom = '92px';
      modalEl.style.right = '24px';
      modalEl.style.top = 'auto';
      modalEl.style.left = 'auto';

      const headerEl = document.createElement('div');
      headerEl.className = 'lt-card-title';
      headerEl.innerHTML = `<span>${menu.title || 'ヘルプ＆ポータル'}</span>`;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'lt-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => closeModal();
      headerEl.appendChild(closeBtn);
      modalEl.appendChild(headerEl);

      const contentEl = document.createElement('div');
      contentEl.className = 'lt-card-content';

      if (menu.categories && Array.isArray(menu.categories)) {
        menu.categories.forEach((cat) => {
          const catGroup = document.createElement('div');
          catGroup.style.marginBottom = '12px';

          const catName = document.createElement('div');
          catName.style.fontWeight = '600';
          catName.style.fontSize = '13px';
          catName.style.color = '#64748b';
          catName.style.marginBottom = '4px';
          catName.textContent = cat.categoryName || '';
          catGroup.appendChild(catName);

          if (cat.items && Array.isArray(cat.items)) {
            const listEl = document.createElement('ul');
            listEl.style.listStyle = 'none';

            cat.items.forEach((item) => {
              const li = document.createElement('li');
              li.style.marginBottom = '4px';

              const link = document.createElement('a');
              link.href = item.url || '#';
              link.textContent = `👉 ${item.label}`;
              link.style.color = 'var(--lt-primary)';
              link.style.textDecoration = 'none';
              link.style.fontWeight = '500';
              link.onclick = () => {
                trackEvent(config.ga4, 'quick_menu_click', { label: item.label, url: item.url });
              };

              li.appendChild(link);
              listEl.appendChild(li);
            });
            catGroup.appendChild(listEl);
          }
          contentEl.appendChild(catGroup);
        });
      }

      modalEl.appendChild(contentEl);
      shadowRoot.appendChild(modalEl);
    }

    function closeModal() {
      if (modalEl && modalEl.parentNode) {
        modalEl.parentNode.removeChild(modalEl);
        modalEl = null;
      }
    }

    shadowRoot.appendChild(iconEl);
  });
}
