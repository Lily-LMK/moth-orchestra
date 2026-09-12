"""Create a fixed-settings local reference player; never edits the input HTML."""
import pathlib,sys
source=pathlib.Path(sys.argv[1]); target=pathlib.Path(sys.argv[2])
html=source.read_text()
setup='''
Object.assign(state, {seed:1, spacingMode:"timeline", listenMode:"both", loopLen:19,
  nightKey:"2026-01-28", voiceMode:"mixed", toneBy:"taxon_class_name", scaleName:"pentatonic", keyName:"D", focus:false, volume:1, ambience:"none", ambienceOn:false});
'''
html=html.replace('\ninitUI();','\ninitUI();\n'+setup)
# Add a clearly labelled test-only capture button after ordinary initialisation.
inject='''
const referenceButton = document.createElement("button");
referenceButton.textContent = "Capture reference WAV and events";
referenceButton.style.cssText = "position:fixed;bottom:12px;left:12px;z-index:99999;background:#fff;color:#111;padding:12px";
document.body.append(referenceButton);
referenceButton.onclick = async () => {
  referenceButton.disabled = true;
  try {
    hardResetPlayback("reference");
    const mode = state.spacingMode;
    const buffer = await renderOfflineBuffer(state.loopLen);
    const wav = encodeWAV(buffer);
    const events = state.sequencer.events;
    const details = {mode, seed:state.seed, loopLen:state.loopLen, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      night:state.nightKey, voiceMode:state.voiceMode,toneBy:state.toneBy,scaleName:state.scaleName,keyName:state.keyName,
      listenMode:state.listenMode,ambience:state.ambience,volume:state.volume,
      sampleRate:buffer.sampleRate,duration:buffer.duration,counts:events.reduce((a,e)=>(a[e.kind]=(a[e.kind]||0)+1,a),{}),events};
    for(const [suffix,body] of [["wav",wav],["json",JSON.stringify(details,null,2)]]){
      const response=await fetch("/capture/"+mode+"."+suffix,{method:"POST",body});
      if(!response.ok) throw Error("Could not save "+suffix);
    }
    referenceButton.textContent = "Saved " + mode + " reference";
  } catch(e) {referenceButton.textContent = "Capture failed: "+e.message;}
  finally {referenceButton.disabled=false;}
};
'''
html=html.replace('\n</script>',inject+'\n</script>')
target.write_text(html)
