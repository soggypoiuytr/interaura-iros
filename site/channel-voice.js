(function(root){
 'use strict';
 const clips=["assets/audio/khyrentuk/john-002.wav", "assets/audio/khyrentuk/sarah-001.wav", "assets/audio/khyrentuk/john-005.wav", "assets/audio/khyrentuk/john-004.wav", "assets/audio/khyrentuk/john-006.wav", "assets/audio/khyrentuk/sarah-003.wav", "assets/audio/khyrentuk/john-001.wav", "assets/audio/khyrentuk/sarah-002.wav", "assets/audio/khyrentuk/john-003.wav", "assets/audio/khyrentuk/sarah-005.wav", "assets/audio/khyrentuk/sarah-004.wav"];
 const voicedOffsets=[1.1, 1.3, 1.1, 0.9, 3.1, 2.85, 1.3, 1.1, 2.85, 1.1, 0.9];
 function sample(id,slot){let n=0;for(const ch of String(id)+':'+slot)n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;return n%clips.length;}
 const active=new WeakMap();
 function start(node,event){
  active.get(node)?.();let timer,lastSlot=-1;const voices=[];
  function silence(){for(const voice of voices)voice.audio.pause();voices.length=0;}
  function stop(){clearInterval(timer);silence();active.delete(node);}
  function step(){
   const age=event.now()-event.at,state=root.IROSTerminalTimeline.frame(event.length,age,event.id,event.profile||'khyrentuk');
   if(!node.isConnected||state.done||document.body.dataset.irosPhase!=='desktop'){stop();return}
   if(typeof audioEnabled!=='undefined'&&!audioEnabled){silence();return}
   for(let i=voices.length-1;i>=0;i--)if(age-voices[i].at>=360){voices[i].audio.pause();voices.splice(i,1);}
   const slot=Math.floor(Math.max(0,age)/180);if(slot===lastSlot)return;lastSlot=slot;
   const index=sample(event.id,slot),audio=new Audio(clips[index]);
   // Overlapping voiced fragments avoid the silences inside the original dialogue clips.
   audio.currentTime=voicedOffsets[index];audio.volume=Math.min(1,.78*(typeof masterVolume==='number'?masterVolume:.1));
   audio.playbackRate=.9;audio.preservesPitch=false;audio.webkitPreservesPitch=false;
   voices.push({audio,at:age});audio.play().catch(()=>{});
  }
  active.set(node,stop);timer=setInterval(step,40);step();return stop;
 }
 root.IROSChannelVoice={start,sample,clips};
})(typeof window==='undefined'?globalThis:window);
