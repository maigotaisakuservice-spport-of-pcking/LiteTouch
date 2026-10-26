export function waitForElement(selector, callback, retryConfig = {}) {
  const maxRetries = retryConfig.maxRetries !== undefined ? retryConfig.maxRetries : 3;
  const intervalMs = retryConfig.intervalMs !== undefined ? retryConfig.intervalMs : 10000;

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attempt);
  } else {
    attempt();
  }
}
