'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual application functions without starting its UI/audio loop.
function loadApp(htmlPath = path.join(__dirname, '..', 'index.html')) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const boundary = script.indexOf('\ninitUI();');
  if (boundary < 0) throw new Error('Application initUI boundary was not found');
  const element = { addEventListener() {}, getContext() { return {}; }, style: {} };
  const context = vm.createContext({
    console, URL, URLSearchParams, TextEncoder, TextDecoder,
    document: { getElementById() { return element; }, addEventListener() {} },
    window: { addEventListener() {}, devicePixelRatio: 1 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    performance: { now: () => 0 }, requestAnimationFrame() {}, cancelAnimationFrame() {}
  });
  vm.runInContext(script.slice(0, boundary) + '\nObject.assign(globalThis, {state, DEMO_CSV});', context, { filename: htmlPath });
  return context;
}
module.exports = { loadApp };
