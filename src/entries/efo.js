import { decodeConfig } from '../core/decoder.js';
import { validateDomain } from '../core/domain.js';
import { initEfoModule } from '../modules/efo.js';

(function initLiteTouchEfo() {
  const config = decodeConfig();
  if (!config) return;

  if (!validateDomain(config.domain)) return;

  initEfoModule(config);
})();
