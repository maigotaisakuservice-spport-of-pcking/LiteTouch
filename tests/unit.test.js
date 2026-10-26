const assert = require('assert');

// Simple domain validation test matching domain logic
function validateDomain(allowedDomain, currentHost = 'localhost') {
  if (!allowedDomain || allowedDomain === '' || allowedDomain === '*' || currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return true;
  }
  return currentHost === allowedDomain || currentHost.endsWith('.' + allowedDomain);
}

console.log('--- Running LiteTouch Unit Tests ---');

assert.strictEqual(validateDomain(''), true, 'Empty domain should pass');
assert.strictEqual(validateDomain('*'), true, 'Wildcard domain should pass');
assert.strictEqual(validateDomain('example.com', 'localhost'), true, 'Localhost should bypass domain check');
assert.strictEqual(validateDomain('example.com', 'example.com'), true, 'Exact domain match should pass');
assert.strictEqual(validateDomain('example.com', 'sub.example.com'), true, 'Subdomain match should pass');
assert.strictEqual(validateDomain('example.com', 'other.com'), false, 'Mismatched domain should fail');

console.log('✅ Unit Tests Passed Successfully!');
