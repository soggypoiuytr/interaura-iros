(function(){
 'use strict';
 const rt=window.InterauraRealtime;if(!rt)return;
 let state=null,timer=0,version=0,music=null;
 function tick(){
  const sample=state?.cryptum,now=rt.now();
  const eligible=state?.power?.mode==='on'&&state.power.loginAt&&['implementing','implemented'].includes(sample?.status)&&Number.isFinite(sample.finishAt);
  const progress=eligible?Math.max(0,Math.min(1,(now-sample.finishAt)/4000)):1;
  // Only music is attenuated. Playback, the user's switch and effects stay intact.
  const fade=music?Math.max(0,Math.min(1,(now-music.at)/3000)):1;
  const gain=music?music.from+((music.muted?0:1)-music.from)*fade:1;
  implementationMusicGain=progress*progress*(3-2*progress)*gain;
  for(const audio of [loginAudio,jingleAudio,interfaceAudio]){
   const base=Number(audio?.dataset.baseVolume);
   if(audio&&Number.isFinite(base))audio.volume=Math.min(1,base*masterVolume*implementationMusicGain);
  }
  const computerAmbience=!!music?.muted&&fade===1;
  if(window.IROSMasterMusicMuted!==computerAmbience){window.IROSMasterMusicMuted=computerAmbience;window.dispatchEvent(new Event('iros-music-control'));}
  if(progress===1&&fade===1){clearInterval(timer);timer=0;}
 }
 function receive(value){version++;state=value;tick();if(!timer&&implementationMusicGain<1)timer=setInterval(tick,60);}
 rt.init().then(()=>{rt.onState('settings',value=>{music=value?.ambientMusic||null;if(music){musicEnabled=true;setAudioUI();}tick();window.dispatchEvent(new Event('iros-music-control'));if(!timer)timer=setInterval(tick,60);});rt.onState('session',receive);const seen=version;return rt.getState('session').then(value=>{if(version===seen)receive(value);});}).catch(console.error);
})();
