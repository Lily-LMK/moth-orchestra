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
    // The Both/A/B control was removed from the interface; solo remains an
    // engine capability and this still tests the seam between setting the mode
    // and the sequencer rebuild. The slice now ends at setListenMode's own
    // closing brace rather than at the button-state function that used to
    // follow it.
    const start = html.indexOf('  function setListenMode(mode){');
    const end = html.indexOf('\n  }\n', start) + 4;
    assert.ok(start >= 0 && end > start);
    Object.assign(c.state, {seed:1, spacingMode:mode, listenMode:'both',
      userAName:'Chris Burwell', userBName:'Lily Kumpe'});
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
