'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {loadApp} = require('./harness.cjs');

// Execute the actual nested click handler with a synchronous rebuild seam.
// This tests the connection between the control and the sequencer, not just the builder.
for (const mode of ['timeline','riff','song']) {
  test(`${mode}: switching Both → A → rebuild → Both restores both observers and evidence`, () => {
    const c = loadApp();
    const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
    const start = html.indexOf('  function setListenMode(mode){');
    const end = html.indexOf('  function updateListenButtons(){',start);
    assert.ok(start >= 0 && end > start);
    Object.assign(c.state, {seed:1, spacingMode:mode, listenMode:'both',
      userAName:'Chris Burwell', userBName:'Lily Kumpe'});
    c.updateListenButtons = () => {};
    c.softRebuild = () => { c.state.sequencer = c.buildSequencer(c.state.obs); };
    vm.runInContext(html.slice(start,end),c);
    c.softRebuild();
    c.setListenMode('A');
    assert.equal(c.state.sequencer.meta.sharedMinutes.length,0);
    assert.ok(c.state.sequencer.events.every(e=>!e.isSpecial && e.user === 'A'));
    c.softRebuild();
    c.setListenMode('both');
    assert.equal(c.state.sequencer.meta.sharedMinutes.length,8);
    assert.ok(c.state.sequencer.events.some(e=>e.user === 'B'));
  });
}
