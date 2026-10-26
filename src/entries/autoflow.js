import { decodeConfig } from '../core/decoder.js';
import { validateDomain } from '../core/domain.js';
import { initAutoflowModule } from '../modules/autoflow.js';

(function initLiteTouchAutoflow() {
  const config = decodeConfig();
  if (!config) return;

  if (!validateDomain(config.domain)) return;

  initAutoflowModule(config);
})();
