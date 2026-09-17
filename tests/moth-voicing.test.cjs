'use strict';
// Moth Orchestra reads the record's own lineage.
//
// What it replaces: the timbre used to be `hash(the value of whichever rank is
// selected in Tone by)`. Two consequences, both measured on the real export:
//
//   1. Relatedness was inaudible. Five species of Idaea — one genus of
//      geometer moths — were given bell, creek, creek, pad and ember.
//   2. The timbre was not a property of the animal at all. Changing Tone by
//      from species to genus moved Nyctemera amicus from a bell to a pad. The
//      moth had not changed; a dropdown had.
//
// Now eight ranks each set one thing about the sound, and each rank's axis is
// sized by how much that rank actually tells apart on a real night — measured,
// not assumed. Genus separates 25 of a median night's 30 taxa, so genus gets
// the most audible axis there is: how long the note lasts. Class separates 1.1,
// so class gets a rare, dramatic axis: what the note is made of.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./harness.cjs');

const run = (c, src) => vm.runInContext(src, c);
// JSON.stringify inside the VM, parse out here: values land in this realm, so
// deepEqual compares data rather than two realms' Array prototypes.
const val = (c, src) => JSON.parse(vm.runInContext(`JSON.stringify(${src})`, c));
const rec = (ranks) => ({ ranks: Object.fromEntries(
  Object.entries(ranks).map(([k, v]) => [`taxon_${k}_name`, v])) });

const MOTH = {
  kingdom:'Animalia', phylum:'Arthropoda', class:'Insecta', order:'Lepidoptera',
  superfamily:'Geometroidea', family:'Geometridae', subfamily:'Sterrhinae',
  tribe:'Sterrhini', genus:'Idaea', species:'Idaea inversata'
};
const voicing = (c, o, depth = 7) =>
  val(c, `mothVoicing(${JSON.stringify(o)}, ${depth}, 1)`);

test('every axis is sized by the rank it reads, deepest ranks on the loudest axes', () => {
  const c = loadApp();
  const axes = val(c, 'MOTH_AXES');
  assert.deepEqual(axes.map(a => a.rank),
    ['class','order','superfamily','family','subfamily','tribe','genus','species'],
    'the eight ranks, in the order RANK_DEPTH already uses');
  // genus measured 25.0 effective values on a median night; class measured 1.1.
  const by = Object.fromEntries(axes.map(a => [a.rank, a]));
  assert.equal(by.genus.axis, 'decay', 'the most discriminating rank gets the most audible axis');
  assert.equal(by.class.axis, 'material', 'the least discriminating rank gets the rarest, largest contrast');
  assert.ok(by.genus.steps >= by.class.steps, 'and more steps to spend');
  for (const a of axes) assert.ok(a.steps >= 2 && a.steps <= 12, `${a.rank} has a usable number of steps`);
});

test('two records of one taxon are the same sound, always', () => {
  const c = loadApp();
  assert.deepEqual(voicing(c, rec(MOTH)), voicing(c, rec(MOTH)));
});

test('relatedness is audible: the closer the lineage, the fewer the differences', () => {
  const c = loadApp();
  const base = voicing(c, rec(MOTH));
  const differs = (o) => {
    const v = voicing(c, rec(o));
    return Object.keys(base).filter(k => k !== 'lit' && base[k] !== v[k]).length;
  };
  const sameGenus  = differs({ ...MOTH, species:'Idaea eretmopus' });
  const sameFamily = differs({ ...MOTH, subfamily:'Ennominae', tribe:'Boarmiini',
                               genus:'Cleora', species:'Cleora displicata' });
  const sameOrder  = differs({ ...MOTH, superfamily:'Noctuoidea', family:'Erebidae',
                               subfamily:'Arctiinae', tribe:'Lithosiini',
                               genus:'Nyctemera', species:'Nyctemera amicus' });
  const otherClass = differs({ kingdom:'Animalia', phylum:'Chordata', class:'Aves',
                               order:'Passeriformes', family:'Meliphagidae',
                               genus:'Manorina', species:'Manorina melanocephala' });
  assert.equal(sameGenus, 1, 'two species of one genus differ in one thing only');
  assert.ok(sameFamily > sameGenus, 'a different genus differs in more');
  assert.ok(sameOrder >= sameFamily, 'a different superfamily differs in more again');
  assert.ok(otherClass >= sameOrder, 'a bird differs in more than any moth does');
});

test('the sound is a property of the animal, not of the Tone by dropdown', () => {
  const c = loadApp();
  // The defect this replaces: at species rank Nyctemera amicus was a bell, at
  // genus rank a pad. Nothing about the moth had changed.
  const full = voicing(c, rec(MOTH), 7);
  for (const depth of [7, 6, 5, 4, 3, 2, 1, 0]) {
    const v = voicing(c, rec(MOTH), depth);
    for (const axis of v.lit) {
      assert.equal(v[axis], full[axis],
        `${axis} says the same thing at depth ${depth} as at species rank`);
    }
  }
});

test('Tone by sets how much of the lineage is heard, not what it says', () => {
  const c = loadApp();
  const lit = depth => voicing(c, rec(MOTH), depth).lit;
  assert.deepEqual(lit(0), ['material'], 'at class rank only the material is heard');
  assert.equal(lit(7).length, 8, 'at species rank the whole lineage is heard');
  for (let d = 1; d <= 7; d++) {
    const a = lit(d - 1), b = lit(d);
    assert.ok(b.length >= a.length, `depth ${d} hears at least as much as ${d - 1}`);
    for (const axis of a) assert.ok(b.includes(axis), `and never loses ${axis}`);
  }
});

test('a rank the record does not carry stays dark; nothing is invented to fill it', () => {
  const c = loadApp();
  const undetermined = rec({ kingdom:'Animalia', phylum:'Arthropoda', class:'Insecta',
                             order:'Lepidoptera', superfamily:'Noctuoidea', family:'Erebidae' });
  const v = voicing(c, undetermined);
  assert.deepEqual(v.lit, ['material','stretch','body','tilt'],
    'it lights what it can prove and no more');
  for (const axis of ['attack','late','decay','shimmer']) assert.equal(v[axis], null, axis);
  // And what it does light must agree with a fully determined relative, because
  // those ranks are the same ranks.
  const full = voicing(c, rec({ ...MOTH, superfamily:'Noctuoidea', family:'Erebidae',
    subfamily:'Arctiinae', tribe:'Lithosiini', genus:'Nyctemera', species:'Nyctemera amicus' }));
  for (const axis of v.lit) assert.equal(v[axis], full[axis], `${axis} agrees with its relatives`);
});

test('how well a specimen is identified is audible, and that is the claim it makes', () => {
  const c = loadApp();
  const depthOf = o => voicing(c, rec(o)).lit.length;
  assert.equal(depthOf(MOTH), 8);
  assert.ok(depthOf({ class:'Insecta', order:'Lepidoptera' }) < depthOf(MOTH));
  assert.ok(depthOf({ class:'Insecta' }) < depthOf({ class:'Insecta', order:'Lepidoptera' }));
});

test('the voicing travels as the instrument name, so every player path carries it', () => {
  const c = loadApp();
  const code = run(c, `mothCode(mothVoicing(${JSON.stringify(rec(MOTH))}, 7, 1))`);
  assert.match(code, /^moth:[0-9-]{8}$/, 'eight axes, a digit each, "-" where dark');
  assert.deepEqual(val(c, `mothDecode(${JSON.stringify(code)})`),
    voicing(c, rec(MOTH)), 'and it decodes back to exactly what it encoded');
  assert.equal(run(c, 'mothDecode("pluck")'), null, 'anything else is not a moth voice');
  assert.equal(run(c, 'mothDecode("moth:xxxxxxxx")'), null, 'and neither is a malformed one');
});

test('a class the author never named still gets a consistent, distinct material', () => {
  const c = loadApp();
  const odd = ['Chilopoda','Malacostraca','Entognatha','Clitellata','Demospongiae'];
  const got = odd.map(k => voicing(c, rec({ class:k, order:'X' })).material);
  for (const g of got) assert.ok(Number.isInteger(g) && g >= 0, 'every class gets one');
  for (const k of odd) assert.equal(voicing(c, rec({ class:k, order:'X' })).material,
    voicing(c, rec({ class:k, order:'X' })).material, `${k} is stable`);
});

test('the classes that carry the export are authored, not left to a hash', () => {
  const c = loadApp();
  // 90.6% of the export is Insecta. The dominant sound of the hero family is
  // a decision, not whatever a hash happened to return.
  const table = val(c, 'MOTH_CLASS_VOICE');
  const voices = val(c, 'MOTH_CLASS_VOICES');
  for (const k of ['Insecta','Arachnida','Aves','Amphibia','Reptilia','Mammalia','Magnoliopsida'])
    assert.ok(Number.isInteger(table[k]), `${k} is authored`);
  const insecta = voices[table.Insecta];
  assert.ok(insecta.ceiling <= 500,
    'the insects, nine in ten records, stop well below the 988 Hz the score can write');
  assert.ok(insecta.ceiling / insecta.floor >= 3.5,
    'and keep at least two octaves, so the family still has a melody');
  assert.ok(voices[table.Aves].ceiling > insecta.ceiling, 'a bird sits above the insects');
});
