(function(){
 'use strict';
 const source=new Audio('assets/audio/mouse-click-npo.wav');source.id='iros-mouse-click-audio';source.preload='auto';source.hidden=true;document.body.append(source);
 document.addEventListener('pointerdown',event=>{
  if(!event.isTrusted||event.pointerType!=='mouse'||![0,1,2].includes(event.button)||document.hidden)return;
  // One cue per physical press, including empty space and controls that stop propagation.
  if(typeof playTransientSound==='function')playTransientSound(source,.65);
 },true);
})();
