export function trackEvent(ga4Config, eventName, params = {}) {
  if (!ga4Config || !ga4Config.enabled) return;

  if (ga4Config.events && ga4Config.events[eventName] === false) {
    return;
  }

  const payload = {
    event: eventName,
    litetouch_event: true,
    ...params,
  };

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload);
      return;
    } catch (e) {}
  }

  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push(payload);
      return;
    } catch (e) {}
  }
}
