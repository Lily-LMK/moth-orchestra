'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual application functions without starting its UI/audio loop.
function loadApp(htmlPath = path.join(__dirname, '..', 'index.html'), overrides = {}) {
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
    performance: { now: () => 0 }, requestAnimationFrame() {}, cancelAnimationFrame() {},
    ...overrides
  });
  vm.runInContext(script.slice(0, boundary) + '\nObject.assign(globalThis, {state, DEMO_CSV});', context, { filename: htmlPath });
  return context;
}
module.exports = { loadApp };

// A DOM stub complete enough to run rebuildDerived and read what it offered.
// Tests of the date list must drive the real control rather than re-implement
// its rule, and the date list is a <select> that rebuildDerived populates.
// Only the surface the application actually touches is modelled.
function stubElement(tag) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(),
    children: [], dataset: {}, textContent: '', value: '',
    disabled: false, hidden: false, checked: false,
    style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild(c) { el.children.push(c); return c; },
    append(...c) { el.children.push(...c); },
    insertBefore(c) { el.children.push(c); return c; },
    replaceChildren(...c) { el.children = c; },
    removeChild(c) { return c; }, remove() {}, focus() {},
    addEventListener() {}, removeEventListener() {},
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, getContext() { return {}; },
    getBoundingClientRect() { return { width: 100, height: 100, top: 0, left: 0 }; }
  };
  // Setting innerHTML to "" is how the application empties a list; a plain
  // property would let options accumulate across rebuilds and quietly pass
  // tests that should fail.
  let html = '';
  Object.defineProperty(el, 'innerHTML', {
    get() { return html; },
    set(v) { html = String(v); if (html === '') el.children = []; }
  });
  return el;
}

// Returns the application context with a live element registry attached as
// `elements`, so a test can read `elements.get('nightSelect').children`.
function loadAppWithDom(htmlPath, overrides = {}) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, stubElement('div'));
      return elements.get(id);
    },
    createElement(tag) { return stubElement(tag); },
    createTextNode() { return stubElement('text'); },
    createDocumentFragment() { return stubElement('fragment'); },
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {},
    body: stubElement('body'), documentElement: stubElement('html')
  };
  const context = loadApp(htmlPath, { document, ...overrides });
  context.document = document;
  context.elements = elements;
  return context;
}

module.exports.stubElement = stubElement;
module.exports.loadAppWithDom = loadAppWithDom;
