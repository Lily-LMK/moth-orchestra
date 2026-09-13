const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve('index.html'));
  const r = await p.evaluate(async () => {
    state.toneBy = 'taxon_species_name';           // most articulate rank
    const voices = GONDWANA_SPECIES;
    const step = 0.9, gap = 0.9, pitches = [146.83, 293.66, 587.33]; // D3 D4 D5
    const span = pitches.length * step + gap;
    const total = voices.length * span + 3.0;
    const sr = 44100;
    const ctx = new OfflineAudioContext(2, Math.ceil(total * sr), sr);
    const master = ctx.createGain(); master.gain.value = 1.0;
    const dry = ctx.createGain(); dry.gain.value = 0.85;
    const wet = ctx.createGain(); wet.gain.value = 0.25;
    const delay = ctx.createDelay(1.0); delay.delayTime.value = 0.22;
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.7;
    master.connect(dry); dry.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay);
    delay.connect(lp); lp.connect(wet); wet.connect(ctx.destination);
    const savedMaster = masterGain, savedNoise = noiseBuf;
    masterGain = master; noiseBuf = createNoiseBuffer(ctx, 1.0);
    const marks = [];
    voices.forEach((name, i) => {
      const at = i * span + 0.2;
      marks.push({ name, at: +at.toFixed(2) });
      pitches.forEach((f, j) => scheduleInstrument(ctx, name, at + j * step, f, 0.5));
    });
    const buffer = await ctx.startRendering();
    masterGain = savedMaster; noiseBuf = savedNoise;
    let peak = 0, nonfinite = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++)
      for (const v of buffer.getChannelData(ch)) { if (!Number.isFinite(v)) nonfinite++; peak = Math.max(peak, Math.abs(v)); }
    const blob = encodeWAV(buffer);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let s = ''; const c = 0x8000;
    for (let i = 0; i < bytes.length; i += c) s += String.fromCharCode.apply(null, bytes.subarray(i, i + c));
    return { wav: btoa(s), marks, peak, nonfinite, duration: buffer.duration };
  });
  fs.writeFileSync('palette.wav', Buffer.from(r.wav, 'base64'));
  delete r.wav;
  fs.writeFileSync('palette.json', JSON.stringify(r, null, 2));
  console.log(JSON.stringify(r));
  await b.close();
})();
