let shadowHostInstance = null;
let shadowRootInstance = null;

export function getShadowRoot(themeConfig = {}) {
  if (shadowRootInstance) return shadowRootInstance;

  shadowHostInstance = document.createElement('div');
  shadowHostInstance.id = 'litetouch-host';
  shadowHostInstance.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;';
  document.body.appendChild(shadowHostInstance);

  shadowRootInstance = shadowHostInstance.attachShadow({ mode: 'open' });

  const primaryColor = themeConfig.primaryColor || '#2563eb';
  const textColor = themeConfig.textColor || '#1e293b';
  const bgColor = themeConfig.backgroundColor || '#ffffff';
  const borderRadius = themeConfig.borderRadius || '12px';
  const customCss = themeConfig.customCss || '';

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :host {
      --lt-primary: ${primaryColor};
      --lt-text: ${textColor};
      --lt-bg: ${bgColor};
      --lt-radius: ${borderRadius};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .lt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 2147483640;
      transition: opacity 0.2s ease;
    }

    .lt-card {
      background: var(--lt-bg);
      color: var(--lt-text);
      border-radius: var(--lt-radius);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(226, 232, 240, 0.8);
      padding: 20px;
      position: absolute;
      z-index: 2147483645;
      max-width: 360px;
      width: calc(100vw - 32px);
      font-size: 14px;
      line-height: 1.5;
      animation: lt-fade-in 0.2s ease;
    }

    .lt-card-title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--lt-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lt-close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #94a3b8;
      line-height: 1;
      padding: 0 4px;
    }
    .lt-close-btn:hover {
      color: #334155;
    }

    .lt-card-content {
      margin-bottom: 14px;
      white-space: pre-wrap;
      color: #334155;
    }

    .lt-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .lt-btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s ease;
    }

    .lt-btn-primary {
      background: var(--lt-primary);
      color: #ffffff;
    }
    .lt-btn-primary:hover {
      filter: brightness(0.9);
    }

    .lt-btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }
    .lt-btn-secondary:hover {
      background: #e2e8f0;
    }

    @media (max-width: 600px) {
      .lt-card.lt-responsive-sheet {
        position: fixed !important;
        top: auto !important;
        left: 5% !important;
        bottom: 16px !important;
        width: 90% !important;
        max-width: none !important;
        transform: none !important;
        animation: lt-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15) !important;
      }
    }

    .lt-sticky-icon {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--lt-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
      cursor: pointer;
      z-index: 2147483646;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .lt-sticky-icon:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.45);
    }

    @keyframes lt-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes lt-slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    ${customCss}
  `;

  shadowRootInstance.appendChild(styleEl);
  return shadowRootInstance;
}
