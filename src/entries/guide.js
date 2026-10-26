import { decodeConfig } from '../core/decoder.js';
import { validateDomain } from '../core/domain.js';
import { initGuideModule } from '../modules/guide.js';

(function initLiteTouchGuide() {
  const config = decodeConfig();
  if (!config) return;

  if (!validateDomain(config.domain)) return;

  initGuideModule(config);
})();
