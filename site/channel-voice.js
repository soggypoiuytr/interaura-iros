(function(root){
 'use strict';
 const clips=["assets/audio/khyrentuk/john-002.wav", "assets/audio/khyrentuk/sarah-001.wav", "assets/audio/khyrentuk/john-005.wav", "assets/audio/khyrentuk/john-004.wav", "assets/audio/khyrentuk/john-006.wav", "assets/audio/khyrentuk/sarah-003.wav", "assets/audio/khyrentuk/john-001.wav", "assets/audio/khyrentuk/sarah-002.wav", "assets/audio/khyrentuk/john-003.wav", "assets/audio/khyrentuk/sarah-005.wav", "assets/audio/khyrentuk/sarah-004.wav"];
 const durations=[3.581, 3.044, 2.533, 2.296, 5.354, 4.439, 3.044, 3.581, 4.439, 2.533, 2.296];
 function sample(id,slot){let n=0;for(const ch of String(id)+':'+slot)n=(Math.imul(n,31)+ch.charCodeAt(0))>>>0;return n%clips.length;}
 const active=new WeakMap();
 function start(node,event){
  active.get(node)?.();let timer,lastSlot=-1,audio;
  function stop(){clearInterval(timer);if(audio){audio.pause();audio.currentTime=0;}active.delete(node);}
  function step(){const age=event.now()-event.at,state=root.IROSTerminalTimeline.frame(event.length,age,event.id,event.profile||'khyrentuk');if(!node.isConnected||state.done||document.body.dataset.irosPhase!=='desktop'){stop();return}if(typeof audioEnabled!=='undefined'&&!audioEnabled){if(audio)audio.pause();return}let slot=0,offset=Math.max(0,age);while(offset>=(durations[sample(event.id,slot)]/.9*1000+100)){offset-=durations[sample(event.id,slot)]/.9*1000+100;slot++;}if(slot===lastSlot)return;lastSlot=slot;if(audio)audio.pause();audio=new Audio(clips[sample(event.id,slot)]);audio.currentTime=Math.min(offset*.9/1000,durations[sample(event.id,slot)]-.01);audio.volume=Math.min(1,.78*(typeof masterVolume==='number'?masterVolume:.1));audio.playbackRate=.9;audio.preservesPitch=false;audio.webkitPreservesPitch=false;audio.play().catch(()=>{});}
  active.set(node,stop);timer=setInterval(step,40);step();return stop;
 }
 root.IROSChannelVoice={start,sample,clips};
})(typeof window==='undefined'?globalThis:window);
