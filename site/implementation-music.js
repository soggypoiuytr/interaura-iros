(function(){
 'use strict';
 const rt=window.InterauraRealtime;if(!rt)return;
 let state=null,timer=0,version=0;
 function tick(){
  const sample=state?.cryptum,now=rt.now();
  const eligible=state?.power?.mode==='on'&&state.power.loginAt&&['implementing','implemented'].includes(sample?.status)&&Number.isFinite(sample.finishAt);
  const progress=eligible?Math.max(0,Math.min(1,(now-sample.finishAt)/4000)):1;
  // Only music is attenuated. Playback, the user's switch and effects stay intact.
  implementationMusicGain=progress*progress*(3-2*progress);
  for(const audio of [loginAudio,jingleAudio,interfaceAudio]){
   const base=Number(audio?.dataset.baseVolume);
   if(audio&&Number.isFinite(base))audio.volume=Math.min(1,base*masterVolume*implementationMusicGain);
  }
  if(implementationMusicGain===1){clearInterval(timer);timer=0;}
 }
 function receive(value){version++;state=value;tick();if(!timer&&implementationMusicGain<1)timer=setInterval(tick,60);}
 rt.init().then(()=>{rt.onState('session',receive);const seen=version;return rt.getState('session').then(value=>{if(version===seen)receive(value);});}).catch(console.error);
})();
