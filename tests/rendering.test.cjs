'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');
function canvasApp() {
  const backgrounds = [];
  const stack = [];
  const context = new Proxy({ globalAlpha: 1,
    save() { stack.push(this.globalAlpha); }, restore() { this.globalAlpha = stack.pop(); },
    drawImage() { backgrounds.push(this.globalAlpha); }, measureText() { return { width: 20 }; }
  }, { get(target, prop) { return prop in target ? target[prop] : () => {}; } });
  const canvas = { width: 0, height: 0, style: {}, getContext: () => context, addEventListener() {},
    getBoundingClientRect: () => ({ width: 400, height: 300, top: 0, left: 0 }) };
  const c = loadApp(undefined, { document: { hidden: false, body: {}, addEventListener() {},
    getElementById: () => canvas, createElement: () => canvas },
    window: { devicePixelRatio: 2, innerWidth: 1200, addEventListener() {} },
    getComputedStyle: () => ({ fontFamily: 'sans-serif' }) });
  return { c, canvas, context, backgrounds };
}

test('particle opacity cannot leak into the next frame background', () => {
  const { c, backgrounds } = canvasApp();
  c.state.particles = [{ life: 0.7, x: 20, y: 20, vx: 0, vy: 0, r: 3, color: '#ffffff' }];
  c.drawFrame();
  c.drawFrame();
  assert.deepEqual(backgrounds, [1, 1], 'background must be fully opaque on every frame');
});

test('demo mode hit testing and drawing agree on canvas size at physical DPR 2', () => {
  const { c, canvas } = canvasApp();
  c.state.demoMode = true;
  const drawing = c.fitCanvasFast(canvas);
  const hitTesting = c.fitCanvasToDisplay(canvas);
  assert.equal(drawing.dpr, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(hitTesting)), JSON.parse(JSON.stringify(drawing)));
  assert.equal(canvas.width, 400);
  assert.equal(canvas.height, 300);
});

test('ordinary mode hit testing and drawing retain physical DPR', () => {
  const { c, canvas } = canvasApp();
  c.state.demoMode = false;
  const drawing = c.fitCanvasFast(canvas);
  const hitTesting = c.fitCanvasToDisplay(canvas);
  assert.equal(drawing.dpr, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(hitTesting)), JSON.parse(JSON.stringify(drawing)));
});

function collect(c, events, previous, current) {
  assert.equal(typeof c.collectVisualEvents, 'function');
  return Array.from(c.collectVisualEvents(events, previous, current, 10), item => [item.event.id, item.absoluteSec]);
}
test('visual loop boundary includes final endpoint and next-cycle zero exactly once', () => {
  const c = loadApp();
  const events = [{ id: 'zero', atSec: 0 }, { id: 'end', atSec: 10 }];
  assert.deepEqual(collect(c, events, 9.9, 10.1).sort(), [['end', 10], ['zero', 10]]);
  assert.deepEqual(collect(c, events, 10.1, 10.2), []);
});

test('visual collection skips stale history after a long frame stall', () => {
  const c = loadApp();
  const events = [{ id: 'old', atSec: 2 }, { id: 'recent', atSec: 9.9 }];
  assert.deepEqual(collect(c, events, 0, 100), [['recent', 99.9]]);
});

test('visual collection includes each ordinary note once and does not mutate score', () => {
  const c = loadApp();
  const events = [{ id: 'a', atSec: 1 }, { id: 'b', atSec: 1.1 }];
  const before = JSON.stringify(events);
  assert.deepEqual(collect(c, events, 0.9, 1.1), [['a', 1], ['b', 1.1]]);
  assert.deepEqual(collect(c, events, 1.1, 1.2), []);
  assert.equal(JSON.stringify(events), before);
});

test('visual collection accepts empty score and stationary playhead', () => {
  const c = loadApp();
  assert.deepEqual(collect(c, [], 0, 1), []);
  assert.deepEqual(collect(c, [{ id: 'a', atSec: 1 }], 1, 1), []);
});

test('only observer B has an outline; both retain taxonomic fills',()=>{
 const {c,context}=canvasApp();const strokes=[],fills=[];
 context.stroke=function(){strokes.push(this.strokeStyle);};
 context.fill=function(){fills.push(this.fillStyle);};
 Object.assign(c.state,{userAName:'Chris Burwell',userBName:'Lily Kumpe',spacingMode:'timeline'});
 c.state.sequencer=c.buildSequencer(c.state.obs);
 c.drawFrame();
 assert.ok(!strokes.includes('rgba(247,148,29,0.95)'));
 assert.equal(strokes.filter(s=>s==='rgba(70,194,210,0.95)').length, c.state.sequencer.events.filter(e=>!e.isSpecial && e.user==='B').length);
 for(const e of c.state.sequencer.events.filter(e=>e.obs)) assert.ok(fills.includes(e.color));
});
