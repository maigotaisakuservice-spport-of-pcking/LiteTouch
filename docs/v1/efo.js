(() => {
  // src/core/decoder.js
  function decodeConfig() {
    let cfgObj = null;
    const currentScript = document.currentScript || document.querySelector("script[data-cfg]");
    if (currentScript && currentScript.getAttribute("data-cfg")) {
      const rawB64 = currentScript.getAttribute("data-cfg").trim();
      if (rawB64) {
        try {
          const decodedStr = decodeURIComponent(
            atob(rawB64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
          );
          cfgObj = JSON.parse(decodedStr);
        } catch (err) {
          console.error("[LiteTouch] Failed to decode data-cfg:", err);
        }
      }
    }
    if (!cfgObj && typeof window !== "undefined" && window.LiteTouchConfig) {
      cfgObj = window.LiteTouchConfig;
    }
    if (!cfgObj)
      return null;
    return {
      version: cfgObj.version || "1.0.0",
      domain: cfgObj.domain || "",
      theme: cfgObj.theme || {},
      ga4: cfgObj.ga4 || { enabled: false },
      retryConfig: cfgObj.retryConfig || { maxRetries: 3, intervalMs: 1e4 },
      features: cfgObj.features || (cfgObj.type ? [cfgObj] : [])
    };
  }

  // src/core/domain.js
  function validateDomain(allowedDomain) {
    if (typeof window === "undefined")
      return true;
    const currentHost = window.location.hostname;
    if (!allowedDomain || allowedDomain === "" || allowedDomain === "*" || currentHost === "localhost" || currentHost === "127.0.0.1" || currentHost === "::1") {
      return true;
    }
    const isMatch = currentHost === allowedDomain || currentHost.endsWith("." + allowedDomain);
    if (!isMatch) {
      console.warn(`[LiteTouch] Security Warning: Execution blocked. Host domain "${currentHost}" does not match configured domain "${allowedDomain}".`);
      return false;
    }
    return true;
  }

  // src/core/shadow.js
  var shadowHostInstance = null;
  var shadowRootInstance = null;
  function getShadowRoot(themeConfig = {}) {
    if (shadowRootInstance)
      return shadowRootInstance;
    shadowHostInstance = document.createElement("div");
    shadowHostInstance.id = "litetouch-host";
    shadowHostInstance.style.cssText = "position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;";
    document.body.appendChild(shadowHostInstance);
    shadowRootInstance = shadowHostInstance.attachShadow({ mode: "open" });
    const primaryColor = themeConfig.primaryColor || "#2563eb";
    const textColor = themeConfig.textColor || "#1e293b";
    const bgColor = themeConfig.backgroundColor || "#ffffff";
    const borderRadius = themeConfig.borderRadius || "12px";
    const customCss = themeConfig.customCss || "";
    const styleEl = document.createElement("style");
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

  // src/core/retry.js
  function waitForElement(selector, callback, retryConfig = {}) {
    const maxRetries = retryConfig.maxRetries !== void 0 ? retryConfig.maxRetries : 3;
    const intervalMs = retryConfig.intervalMs !== void 0 ? retryConfig.intervalMs : 1e4;
    let retries = 0;
    function attempt() {
      const el = document.querySelector(selector);
      if (el) {
        callback(el);
        return;
      }
      if (retries < maxRetries) {
        retries++;
        setTimeout(attempt, intervalMs);
      } else {
        console.warn(`[LiteTouch] Target selector "${selector}" not found after ${maxRetries} retries.`);
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attempt);
    } else {
      attempt();
    }
  }

  // src/core/ga4.js
  function trackEvent(ga4Config, eventName, params = {}) {
    if (!ga4Config || !ga4Config.enabled)
      return;
    if (ga4Config.events && ga4Config.events[eventName] === false) {
      return;
    }
    const payload = {
      event: eventName,
      litetouch_event: true,
      ...params
    };
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", eventName, payload);
        return;
      } catch (e) {
      }
    }
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      try {
        window.dataLayer.push(payload);
        return;
      } catch (e) {
      }
    }
  }

  // src/modules/efo.js
  function initEfoModule(config) {
    const efoFeatures = config.features.filter((f) => f.type === "efo");
    if (efoFeatures.length === 0)
      return;
    const activeErrors = /* @__PURE__ */ new Map();
    efoFeatures.forEach((rule) => {
      waitForElement(rule.selector, (targetEl) => {
        const eventType = rule.triggerEvent || "blur";
        targetEl.addEventListener(eventType, () => {
          validateField(targetEl, rule, config);
        });
        targetEl.addEventListener("input", () => {
          clearFieldError(rule.id || rule.selector);
        });
      }, config.retryConfig);
    });
    function validateField(targetEl, rule, config2) {
      const val = targetEl.value || "";
      let isError = false;
      if (rule.ruleType === "preset") {
        if (rule.presetKey === "no_abbreviation") {
          isError = /\(株\)|\(有\)|\(代\)/.test(val);
        } else if (rule.presetKey === "required") {
          isError = val.trim() === "";
        } else if (rule.presetKey === "email") {
          isError = val.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
        }
      } else if (rule.customRegex) {
        try {
          const regex = new RegExp(rule.customRegex);
          isError = regex.test(val);
        } catch (err) {
          console.error("[LiteTouch] Invalid custom regex:", rule.customRegex);
        }
      }
      const key = rule.id || rule.selector;
      if (isError) {
        showEfoTooltip(targetEl, rule, config2, key);
        trackEvent(config2.ga4, "widget_error", {
          feature: "efo",
          rule_id: key,
          presetKey: rule.presetKey || "custom"
        });
      } else {
        clearFieldError(key);
      }
    }
    function showEfoTooltip(targetEl, rule, config2, key) {
      clearFieldError(key);
      const shadowRoot = getShadowRoot(config2.theme);
      const cardEl = document.createElement("div");
      cardEl.className = "lt-card lt-responsive-sheet";
      const rect = targetEl.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      cardEl.style.top = `${rect.bottom + scrollTop + 8}px`;
      cardEl.style.left = `${Math.max(16, rect.left + scrollLeft)}px`;
      cardEl.style.borderColor = "#ef4444";
      const headerEl = document.createElement("div");
      headerEl.className = "lt-card-title";
      headerEl.style.color = "#ef4444";
      const titleText = rule.errorMessage?.title || "\u5165\u529B\u5185\u5BB9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044";
      headerEl.innerHTML = `<span>\u26A0\uFE0F ${titleText}</span>`;
      const closeBtn = document.createElement("button");
      closeBtn.className = "lt-close-btn";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = () => clearFieldError(key);
      headerEl.appendChild(closeBtn);
      cardEl.appendChild(headerEl);
      const contentEl = document.createElement("div");
      contentEl.className = "lt-card-content";
      contentEl.textContent = rule.errorMessage?.content || "";
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

  // src/entries/efo.js
  (function initLiteTouchEfo() {
    const config = decodeConfig();
    if (!config)
      return;
    if (!validateDomain(config.domain))
      return;
    initEfoModule(config);
  })();
})();
