export function decodeConfig() {
  let cfgObj = null;

  const currentScript = document.currentScript || document.querySelector('script[data-cfg]');
  if (currentScript && currentScript.getAttribute('data-cfg')) {
    const rawB64 = currentScript.getAttribute('data-cfg').trim();
    if (rawB64) {
      try {
        const decodedStr = decodeURIComponent(
          atob(rawB64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        cfgObj = JSON.parse(decodedStr);
      } catch (err) {
        console.error('[LiteTouch] Failed to decode data-cfg:', err);
      }
    }
  }

  if (!cfgObj && typeof window !== 'undefined' && window.LiteTouchConfig) {
    cfgObj = window.LiteTouchConfig;
  }

  if (!cfgObj) return null;

  return {
    version: cfgObj.version || '1.0.0',
    domain: cfgObj.domain || '',
    theme: cfgObj.theme || {},
    ga4: cfgObj.ga4 || { enabled: false },
    retryConfig: cfgObj.retryConfig || { maxRetries: 3, intervalMs: 10000 },
    features: cfgObj.features || (cfgObj.type ? [cfgObj] : [])
  };
}
