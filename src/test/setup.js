// Test setup for Vitest.
//
// Imports jest-dom matchers and provides stable mocks for browser APIs
// that the store depends on (localStorage, crypto.randomUUID).

import '@testing-library/jest-dom'

// crypto.randomUUID is available in Node 19+ but jsdom may not expose it
// on the global object. Provide a deterministic mock so test IDs are stable.
if (!globalThis.crypto) {
  globalThis.crypto = {}
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0
  globalThis.crypto.randomUUID = () => {
    counter += 1
    return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`
  }
}

// Clear localStorage before every test so the seed data does not leak
// between test cases.
beforeEach(() => {
  window.localStorage.clear()
})
