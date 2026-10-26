import { getShadowRoot } from '../core/shadow.js';
import { waitForElement } from '../core/retry.js';
import { trackEvent } from '../core/ga4.js';

export function initEfoModule(config) {
  const efoFeatures = config.features.filter((f) => f.type === 'efo');
  if (efoFeatures.length === 0) return;

  const activeErrors = new Map();

  efoFeatures.forEach((rule) => {
    waitForElement(rule.selector, (targetEl) => {
      const eventType = rule.triggerEvent || 'blur';

      targetEl.addEventListener(eventType, () => {
        validateField(targetEl, rule, config);
      });

      targetEl.addEventListener('input', () => {
        clearFieldError(rule.id || rule.selector);
      });
    }, config.retryConfig);
  });

  function validateField(targetEl, rule, config) {
    const val = targetEl.value || '';
    let isError = false;

    if (rule.ruleType === 'preset') {
      if (rule.presetKey === 'no_abbreviation') {
        isError = /\(株\)|\(有\)|\(代\)/.test(val);
      } else if (rule.presetKey === 'required') {
        isError = val.trim() === '';
      } else if (rule.presetKey === 'email') {
        isError = val.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
      }
    } else if (rule.customRegex) {
      try {
        const regex = new RegExp(rule.customRegex);
        isError = regex.test(val);
      } catch (err) {
        console.error('[LiteTouch] Invalid custom regex:', rule.customRegex);
      }
    }

    const key = rule.id || rule.selector;

    if (isError) {
      showEfoTooltip(targetEl, rule, config, key);
      trackEvent(config.ga4, 'widget_error', {
        feature: 'efo',
        rule_id: key,
        presetKey: rule.presetKey || 'custom'
      });
    } else {
      clearFieldError(key);
    }
  }

  function showEfoTooltip(targetEl, rule, config, key) {
    clearFieldError(key);

    const shadowRoot = getShadowRoot(config.theme);
    const cardEl = document.createElement('div');
    cardEl.className = 'lt-card lt-responsive-sheet';

    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    cardEl.style.top = `${rect.bottom + scrollTop + 8}px`;
    cardEl.style.left = `${Math.max(16, rect.left + scrollLeft)}px`;
    cardEl.style.borderColor = '#ef4444';

    const headerEl = document.createElement('div');
    headerEl.className = 'lt-card-title';
    headerEl.style.color = '#ef4444';
    const titleText = rule.errorMessage?.title || '入力内容をご確認ください';
    headerEl.innerHTML = `<span>⚠️ ${titleText}</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lt-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => clearFieldError(key);
    headerEl.appendChild(closeBtn);
    cardEl.appendChild(headerEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'lt-card-content';
    contentEl.textContent = rule.errorMessage?.content || '';
    cardEl.appendChild(contentEl);

    shadowRoot.appendChild(cardEl);
    activeErrors.set(key, cardEl);
  }

  function clearFieldError(key) {
    if (activeErrors.has(key)) {
      const el = activeErrors.get(key);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      activeErrors.delete(key);
    }
  }
}
