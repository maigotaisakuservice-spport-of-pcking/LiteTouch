import { decodeConfig } from '../core/decoder.js';
import { validateDomain } from '../core/domain.js';
import { initMenuModule } from '../modules/menu.js';

(function initLiteTouchMenu() {
  const config = decodeConfig();
  if (!config) return;

  if (!validateDomain(config.domain)) return;

  initMenuModule(config);
})();
