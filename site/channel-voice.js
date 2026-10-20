(function(root){
 'use strict';
 const clips=['assets/audio/khyrentuk/talk-1.wav','assets/audio/khyrentuk/talk-2.wav','assets/audio/khyrentuk/talk-3.wav','assets/audio/khyrentuk/talk-4.wav'];
 function sample(id,slot){let n=0;for(const ch of String(id)+':'+slot)n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;return n%clips.length;}
 const active=new WeakMap();
 function start(node,event){
  active.get(node)?.();let timer,lastSlot=-1,audio;
  function stop(){clearInterval(timer);if(audio){audio.pause();audio.currentTime=0;}active.delete(node);}
  function step(){const age=event.now()-event.at,state=root.IROSTerminalTimeline.frame(event.length,age,event.id,event.profile||'khyrentuk');if(!node.isConnected||state.done||document.body.dataset.irosPhase!=='desktop'){stop();return}if(typeof audioEnabled!=='undefined'&&!audioEnabled){if(audio)audio.pause();return}const slot=Math.floor(Math.max(0,age)/300);if(slot===lastSlot)return;lastSlot=slot;if(audio)audio.pause();audio=new Audio(clips[sample(event.id,slot)]);audio.volume=Math.min(1,.52*(typeof masterVolume==='number'?masterVolume:.1));audio.playbackRate=.9;audio.preservesPitch=false;audio.webkitPreservesPitch=false;audio.play().catch(()=>{});}
  active.set(node,stop);timer=setInterval(step,40);step();return stop;
 }
 root.IROSChannelVoice={start,sample,clips};
})(typeof window==='undefined'?globalThis:window);
