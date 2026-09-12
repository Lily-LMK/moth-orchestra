'use strict';
// Audio scheduling's effective base velocity, before the shared volume control.
function score(events, mode) {
  return JSON.parse(JSON.stringify(events.filter(e => mode === 'song' || e.kind === 'obs').map(e => ({
    atSec: e.atSec, instrument: e.instrument, freq: e.freq, midi: e.midi,
    density: e.density, observationId: e.obs?.id ?? null,
    velocity: e.isSpecial ? (e.velocity ?? (e.kind === 'duet_sync' || e.kind === 'accompaniment' ? 0.26 : 0.20))
      : Math.max(0.12, Math.min(0.65, 0.15 + 0.12 * Math.log2(e.density)))
  }))));
}
const settings = { seed: 28012026, userAName: 'Chris Burwell', userBName: 'Lily Kumpe',
  listenMode: 'both', riffStartMin: 1140, riffEndMin: 1240, loopLen: 19,
  keyName: 'D', scaleName: 'pentatonic', toneBy: 'taxon_class_name', voiceMode: 'mixed' };
module.exports = { score, settings };
