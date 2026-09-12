"""Make an instrumented local test copy. The source app is not modified."""
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text()
addon=r'''
const diagnostics = {scheduled:0, late:0, minLead:1, backgroundDraws:0, translucentBackgrounds:0, remixes:0, errors:[]};
const originalSchedule = scheduleInstrument;
scheduleInstrument = function(context,instrument,when,freq,velocity){
  diagnostics.scheduled++;
  const lead=when-context.currentTime;
  diagnostics.minLead=Math.min(diagnostics.minLead,lead);
  if(lead < -0.001) diagnostics.late++;
  return originalSchedule(context,instrument,when,freq,velocity);
};
const originalDrawImage=ctx.drawImage.bind(ctx);
ctx.drawImage = function(...args){
  diagnostics.backgroundDraws++;
  if(ctx.globalAlpha < 0.999) diagnostics.translucentBackgrounds++;
  return originalDrawImage(...args);
};
window.addEventListener("error",e=>diagnostics.errors.push(e.message));
const panel=document.createElement("section");
panel.style.cssText="position:fixed;right:8px;bottom:8px;z-index:99999;background:#18202b;color:white;padding:12px;width:300px;font-size:12px";
const testButton=document.createElement("button");testButton.textContent="Run 40-remix stress test";
const readout=document.createElement("pre");readout.id="stabilityReadout";readout.style.whiteSpace="pre-wrap";
panel.append(testButton,readout);document.body.append(panel);
let stressTimer=null;
testButton.onclick=()=>{
  if(stressTimer) return;
  testButton.disabled=true;
  diagnostics.remixes=0;
  stressTimer=setInterval(()=>{
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"r",bubbles:true})); diagnostics.remixes++;
    if(diagnostics.remixes>=40){clearInterval(stressTimer);stressTimer=null;testButton.textContent="Stress test complete";testButton.disabled=false;}
  },450);
};
setInterval(()=>{
  readout.textContent=JSON.stringify({...diagnostics,isPlaying:state.isPlaying,
    audioSeconds:audioCtx ? Number(audioCtx.currentTime.toFixed(1)) : 0,
    particles:state.particles.length,pendingGlows:_pendingGlows.length,pendingOverlays:_pendingOverlays.length},null,2);
},250);
'''
s=s.replace('\n</script>',addon+'\n</script>')
Path(sys.argv[2]).write_text(s)
