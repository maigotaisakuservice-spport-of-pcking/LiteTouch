import { decodeConfig } from '../core/decoder.js';
import { validateDomain } from '../core/domain.js';
import { initGuideModule } from '../modules/guide.js';
import { initEfoModule } from '../modules/efo.js';
import { initMenuModule } from '../modules/menu.js';
import { initAutoflowModule } from '../modules/autoflow.js';

(function initLiteTouchAll() {
  const config = decodeConfig();
  if (!config) return;

  if (!validateDomain(config.domain)) return;

  initGuideModule(config);
  initEfoModule(config);
  initMenuModule(config);
  initAutoflowModule(config);
})();
