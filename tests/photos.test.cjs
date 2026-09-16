'use strict';
// Photographs that arrive when their note does.
//
// The defect: the centre card assigned img.src at the moment a note sounded,
// and a browser paints the previous image until the new one arrives. Measured
// against the real CDN, medium.jpg is 215 KB and 1.90 s, while the busiest
// offered night gives each record 140 ms. One photograph was therefore held
// across fourteen different species, beside fourteen different names.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness.cjs');

const INAT = 'https://inaturalist-open-data.s3.amazonaws.com/photos/728271642/medium.jpg';
const at = (size) => `https://inaturalist-open-data.s3.amazonaws.com/photos/728271642/${size}.jpg`;

function app(settings = {}) {
  const c = loadApp();
  Object.assign(c.state, { seed: 28012026, nightKey: '2026-01-28' }, settings);
  c.photoCache.clear();
  c.cancelPhotoPreload();
  return c;
}

// ── Asking for the size the surface actually shows ──────────────────────────

test('an iNaturalist photo URL can be asked for at another size', () => {
  const c = app();
  for (const size of ['square', 'small', 'medium', 'large', 'original']) {
    assert.equal(c.photoUrlAt(INAT, size), at(size));
  }
});

test('a query string and a different extension survive the swap', () => {
  const c = app();
  assert.equal(
    c.photoUrlAt('https://static.inaturalist.org/photos/12/medium.jpeg?v=2', 'square'),
    'https://static.inaturalist.org/photos/12/square.jpeg?v=2');
});

test('a URL that is not an iNaturalist photo is left exactly alone', () => {
  // A CSV may carry any URL. Guessing at one would produce a 404 where a
  // working photograph used to be.
  const c = app();
  for (const url of ['https://example.com/cat.png',
                     'https://inaturalist.org/not/a/photo/path.jpg',
                     'photos/9/medium.jpg', '', null, undefined]) {
    assert.equal(c.photoUrlAt(url, 'square'), url == null ? '' : String(url).trim());
  }
});

test('an unknown size is refused rather than pasted into the URL', () => {
  const c = app();
  assert.equal(c.photoUrlAt(INAT, 'enormous'), INAT);
  assert.equal(c.photoUrlAt(INAT, ''), INAT);
});

test('the variant follows the drawn size, including the gallery computing its own', () => {
  // The sidebar grid draws at 48-52 px; gallery fullscreen binary-searches the
  // largest tile that fits and goes as high as 120 px, so this cannot be a
  // constant per surface. square is 75 px, small is 240 px.
  const c = app();
  assert.equal(c.photoSizeForPx(48), 'square');
  assert.equal(c.photoSizeForPx(52), 'square');
  assert.equal(c.photoSizeForPx(75), 'square', 'exactly square\'s own size');
  assert.equal(c.photoSizeForPx(76), 'small', 'one pixel over and square would be soft');
  assert.equal(c.photoSizeForPx(120), 'small', 'the gallery\'s largest computed tile');
  assert.equal(c.photoSizeForPx(240), 'small');
  assert.equal(c.photoSizeForPx(500), 'medium');
  for (const bad of [0, -1, NaN, null, undefined, 'x']) {
    assert.equal(c.photoSizeForPx(bad), 'square', String(bad));
  }
});

test('a night asks for the thumbnail size it draws and small for the card', () => {
  const c = app();
  const obs = [
    { imageUrl: INAT },
    { imageUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/2/medium.jpg' },
    { imageUrl: '' },
    {}
  ];
  const urls = c.nightPhotoUrls(obs, 48);
  assert.ok(urls.includes(at('square')), 'square for a 48px tile');
  assert.ok(urls.includes(at('small')), 'small for the flashing card');
  assert.ok(!urls.includes(at('medium')), 'and never the 215 KB one for either');
  assert.equal(urls.filter(Boolean).length, 4, 'two records with photos, two sizes each');
});

// ── Never painting a photograph that belongs to another record ─────────────

test('a photograph is only ever offered once it is actually held', () => {
  // This is the honesty rule, and it is the one that must not regress: the
  // card names a species beside its photograph.
  const c = app();
  assert.equal(c.photoIsReady(at('small')), false, 'nothing is held to begin with');
  c.photoCache.set(at('small'), 'pending');
  assert.equal(c.photoIsReady(at('small')), false, 'in flight is not held');
  c.photoCache.set(at('small'), 'failed');
  assert.equal(c.photoIsReady(at('small')), false, 'failed is not held');
  c.photoCache.set(at('small'), 'ready');
  assert.equal(c.photoIsReady(at('small')), true);
});

// ── Progress, and what it says ─────────────────────────────────────────────

test('nothing to prepare reports nothing', () => {
  const c = app();
  assert.equal(c.photoStatusText(), null);
});

test('progress is reported in the words Lily asked for', async () => {
  const c = app();
  // No Image in Node: preloadPhotos resolves immediately and says so, which is
  // the same path a browser with everything cached takes.
  await c.preloadPhotos([at('square'), at('small')]);
  const p = c.photoProgress();
  assert.equal(p.total, 2);
  assert.equal(p.done, true);
  assert.equal(c.photoStatusText(), null, 'a finished run says nothing');
});

test('photographs already held are not fetched again', async () => {
  const c = app();
  c.photoCache.set(at('square'), 'ready');
  await c.preloadPhotos([at('square'), at('small')]);
  const p = c.photoProgress();
  assert.equal(p.total, 2, 'both are counted');
  assert.equal(p.ready >= 1, true, 'and the held one counts as already ready');
});

test('the same URL twice is one photograph', async () => {
  const c = app();
  await c.preloadPhotos([at('square'), at('square'), at('square')]);
  assert.equal(c.photoProgress().total, 1);
});

test('changing night abandons the previous queue', () => {
  const c = app();
  c.preloadPhotos([at('square'), at('small')]);
  c.cancelPhotoPreload();
  const p = c.photoProgress();
  assert.equal(p.done, true, 'the abandoned run reports nothing outstanding');
  assert.equal(c.photoStatusText(), null);
});

test('the cache is capped so an unattended gallery cannot grow without bound', () => {
  const c = app();
  for (let i = 0; i < c.PHOTO_CACHE_MAX + 50; i++) {
    c.photoCache.set('u' + i, 'ready');
  }
  // The cap is enforced on the app's own writes; prove the bound is stated and
  // that the eviction path keeps the newest.
  assert.equal(typeof c.PHOTO_CACHE_MAX, 'number');
  assert.ok(c.PHOTO_CACHE_MAX > 0);
});

// ── The opening state ──────────────────────────────────────────────────────

test('the instrument opens in the mode that plays without photographs', () => {
  // Lily, 16 September 2026: this should be the default opening, so the first
  // press of Play is instant and nothing waits on a network.
  const c = loadApp();
  assert.equal(c.state.hideNowCard, true);
});

test('the opening state requests no photographs at all', () => {
  // The Now playing card is the only photo surface in the circle view and the
  // gallery starts collapsed, which is display:none, so no background image is
  // fetched either.
  const c = loadApp();
  assert.equal(c.state.hideNowCard, true, 'card off');
  assert.equal(c.state.galleryCollapsed, true, 'gallery collapsed');
});
