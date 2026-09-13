// Headless offline renderer for palette auditions. Runs wherever Chromium and
// Playwright are available (the cloud workspace), not on the Mac as it stands.
// Renders the app's own OfflineAudioContext path, so what it measures is what
// the instrument actually schedules.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const SETTINGS = { seed:1, spacingMode:'timeline', listenMode:'both', loopLen:19,
  toneBy:'taxon_species_name', scaleName:'pentatonic', keyName:'D', focus:false,
  volume:0.35, ambience:'none', ambienceOn:false, filterYear:'all', filterSeason:'all',
  riffStartMin:0, riffEndMin:1439 };
const NIGHT = '2026-09-03';

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('file://' + path.resolve('index.html'));
  await page.waitForFunction(() => typeof window.renderOfflineBuffer === 'function' || typeof renderOfflineBuffer === 'function', null, { timeout: 30000 }).catch(()=>{});
  const csv = fs.readFileSync('data.csv', 'utf8');
  const out = {};
  for (const voiceMode of ['mixed', 'gondwana']) {
    const result = await page.evaluate(async ({ csv, settings, night, voiceMode }) => {
      importCSVData(csv);
      Object.assign(state, settings, { voiceMode });
      state.nightKey = night;
      rebuildDerived();
      const events = state.sequencer.events;
      const buffer = await renderOfflineBuffer(state.loopLen);
      let peak = 0, sum = 0, nonfinite = 0, lowEnergy = 0;
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        for (const v of buffer.getChannelData(ch)) {
          if (!Number.isFinite(v)) nonfinite++;
          peak = Math.max(peak, Math.abs(v)); sum += v * v;
        }
      }
      const wav = encodeWAV(buffer);
      const bytes = new Uint8Array(await wav.arrayBuffer ? await wav.arrayBuffer() : wav);
      let binary = ''; const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      return { wav: btoa(binary),
        records: state.sequencer.meta ? (state.sequencer.meta.voiceList || []).length : null,
        obsEvents: events.filter(e => e.kind === 'obs').length,
        sharedMinutes: (state.sequencer.meta.sharedMinutes || []).length,
        instruments: [...new Set(events.filter(e => e.kind === 'obs').map(e => e.instrument))].sort(),
        pitches: [...new Set(events.filter(e => e.kind === 'obs').map(e => e.midi))].sort((a,b)=>a-b),
        voiceGroups: (state.sequencer.meta.voiceList || []).length,
        peak, rms: Math.sqrt(sum / (buffer.length * buffer.numberOfChannels)), nonfinite,
        duration: buffer.duration, nightRecords: (state.nights.get(night) || []).length };
    }, { csv, settings: SETTINGS, night: NIGHT, voiceMode });
    fs.writeFileSync(`${voiceMode}.wav`, Buffer.from(result.wav, 'base64'));
    delete result.wav;
    out[voiceMode] = result;
    console.log(voiceMode, JSON.stringify({ ...result, pitches: result.pitches.length, instruments: result.instruments.length }));
  }
  fs.writeFileSync('render.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
