import { getShadowRoot } from '../core/shadow.js';
import { waitForElement } from '../core/retry.js';
import { trackEvent } from '../core/ga4.js';

export function initGuideModule(config) {
  const guideFeatures = config.features.filter((f) => f.type === 'guide');
  if (guideFeatures.length === 0) return;

  let currentStepIndex = 0;
  let currentOverlayEl = null;
  let currentCardEl = null;

  function renderStep(index) {
    if (index < 0 || index >= guideFeatures.length) {
      cleanup();
      return;
    }

    currentStepIndex = index;
    const step = guideFeatures[index];

    waitForElement(step.selector, (targetEl) => {
      cleanup();

      const shadowRoot = getShadowRoot(config.theme);

      trackEvent(config.ga4, 'widget_view', {
        feature: 'guide',
        guide_id: step.id || `guide-${index}`,
        step_title: step.title
      });

      if (step.showOverlay !== false) {
        currentOverlayEl = document.createElement('div');
        currentOverlayEl.className = 'lt-overlay';
        currentOverlayEl.onclick = () => {
          if (step.showOverlay) cleanup();
        };
        shadowRoot.appendChild(currentOverlayEl);
      }

      currentCardEl = document.createElement('div');
      currentCardEl.className = 'lt-card lt-responsive-sheet';

      const rect = targetEl.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const topPos = rect.bottom + scrollTop + 8;
      const leftPos = Math.max(16, rect.left + scrollLeft);

      currentCardEl.style.top = `${topPos}px`;
      currentCardEl.style.left = `${leftPos}px`;

      const headerEl = document.createElement('div');
      headerEl.className = 'lt-card-title';
      headerEl.innerHTML = `<span>${step.title || 'ガイド'}</span>`;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'lt-close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => cleanup();
      headerEl.appendChild(closeBtn);
      currentCardEl.appendChild(headerEl);

      const contentEl = document.createElement('div');
      contentEl.className = 'lt-card-content';
      contentEl.textContent = step.content || '';
      currentCardEl.appendChild(contentEl);

      const actionsEl = document.createElement('div');
      actionsEl.className = 'lt-actions';

      if (guideFeatures.length > 1 && index > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lt-btn lt-btn-secondary';
        prevBtn.textContent = step.prevButtonText || '戻る';
        prevBtn.onclick = () => renderStep(index - 1);
        actionsEl.appendChild(prevBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'lt-btn lt-btn-primary';
      const isLast = index === guideFeatures.length - 1;
      nextBtn.textContent = isLast ? '完了' : (step.nextButtonText || '次へ');
      nextBtn.onclick = () => {
        if (isLast) {
          cleanup();
        } else {
          renderStep(index + 1);
        }
      };
      actionsEl.appendChild(nextBtn);

      currentCardEl.appendChild(actionsEl);
      shadowRoot.appendChild(currentCardEl);

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, config.retryConfig);
  }

  function cleanup() {
    if (currentOverlayEl && currentOverlayEl.parentNode) {
      currentOverlayEl.parentNode.removeChild(currentOverlayEl);
      currentOverlayEl = null;
    }
    if (currentCardEl && currentCardEl.parentNode) {
      currentCardEl.parentNode.removeChild(currentCardEl);
      currentCardEl = null;
    }
  }

  renderStep(0);
}
