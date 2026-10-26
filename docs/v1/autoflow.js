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

  // src/core/nativeBypass.js
  function setNativeValue(element, value) {
    if (!element)
      return;
    let prototype = Object.getPrototypeOf(element);
    if (element.tagName === "INPUT") {
      prototype = window.HTMLInputElement.prototype;
    } else if (element.tagName === "SELECT") {
      prototype = window.HTMLSelectElement.prototype;
    } else if (element.tagName === "TEXTAREA") {
      prototype = window.HTMLTextAreaElement.prototype;
    }
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
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

  // src/modules/autoflow.js
  function initAutoflowModule(config) {
    const autoflowFeatures = config.features.filter((f) => f.type === "auto_flow");
    if (autoflowFeatures.length === 0)
      return;
    autoflowFeatures.forEach((flow) => {
      if (!flow.steps || !Array.isArray(flow.steps))
        return;
      trackEvent(config.ga4, "auto_flow_execute", { feature: "auto_flow", flow_id: flow.id });
      executeSteps(flow.steps, 0, config);
    });
    function executeSteps(steps, stepIndex, config2) {
      if (stepIndex >= steps.length)
        return;
      const step = steps[stepIndex];
      const delayMs = step.delayMs !== void 0 ? step.delayMs : 100;
      setTimeout(() => {
        waitForElement(step.selector, (targetEl) => {
          if (step.action === "input") {
            targetEl.focus();
            setNativeValue(targetEl, step.value || "");
          } else if (step.action === "click") {
            targetEl.click();
          }
          executeSteps(steps, stepIndex + 1, config2);
        }, config2.retryConfig);
      }, delayMs);
    }
  }

  // src/entries/autoflow.js
  (function initLiteTouchAutoflow() {
    const config = decodeConfig();
    if (!config)
      return;
    if (!validateDomain(config.domain))
      return;
    initAutoflowModule(config);
  })();
})();
