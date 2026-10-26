import { waitForElement } from '../core/retry.js';
import { setNativeValue } from '../core/nativeBypass.js';
import { trackEvent } from '../core/ga4.js';

export function initAutoflowModule(config) {
  const autoflowFeatures = config.features.filter((f) => f.type === 'auto_flow');
  if (autoflowFeatures.length === 0) return;

  autoflowFeatures.forEach((flow) => {
    if (!flow.steps || !Array.isArray(flow.steps)) return;

    trackEvent(config.ga4, 'auto_flow_execute', { feature: 'auto_flow', flow_id: flow.id });

    executeSteps(flow.steps, 0, config);
  });

  function executeSteps(steps, stepIndex, config) {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const delayMs = step.delayMs !== undefined ? step.delayMs : 100;

    setTimeout(() => {
      waitForElement(step.selector, (targetEl) => {
        if (step.action === 'input') {
          targetEl.focus();
          setNativeValue(targetEl, step.value || '');
        } else if (step.action === 'click') {
          targetEl.click();
        }

        executeSteps(steps, stepIndex + 1, config);
      }, config.retryConfig);
    }, delayMs);
  }
}
