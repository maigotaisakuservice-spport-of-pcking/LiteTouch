export function validateDomain(allowedDomain) {
  if (typeof window === 'undefined') return true;

  const currentHost = window.location.hostname;

  if (
    !allowedDomain ||
    allowedDomain === '' ||
    allowedDomain === '*' ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost === '::1'
  ) {
    return true;
  }

  const isMatch =
    currentHost === allowedDomain ||
    currentHost.endsWith('.' + allowedDomain);

  if (!isMatch) {
    console.warn(`[LiteTouch] Security Warning: Execution blocked. Host domain "${currentHost}" does not match configured domain "${allowedDomain}".`);
    return false;
  }

  return true;
}
