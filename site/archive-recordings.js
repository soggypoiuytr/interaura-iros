(function(){
 'use strict';const rt=window.InterauraRealtime,$=id=>document.getElementById(id),win=$('archive-recording-window'),audio=$('archive-recording-audio'),play=$('archive-recording-play'),seek=$('archive-recording-seek'),status=$('archive-recording-status');if(!rt||!win)return;
 const DURATION=35.736;let state=null,media=null,blocked=false;
 const template=document.createElement('template');template.innerHTML=archiveDocuments['mod60-recording'].body;$('archive-recording-transcript').append(template.content.querySelector('.recording-transcript'));
 const lines=[...win.querySelectorAll('[data-recording-time]')],format=t=>Math.floor(t/60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');
 function position(){return media?Math.max(0,Math.min(DURATION,media.position+(media.playing?(rt.now()-media.at)/1000:0))):0;}
 function request(playing,position){if(!window.IROSTable?.isController())return;window.dispatchEvent(new CustomEvent('iros-recording-action',{detail:{file:'mod60-recording',playing,position:Math.max(0,Math.min(DURATION,position))}}));}
 const previousOpen=openArchiveRow;openArchiveRow=function(row){if(row.dataset.file!=='mod60-recording')return previousOpen(row);archiveRows.forEach(r=>r.classList.toggle('selected',r===row));openIrosApp('recording');tick();};
 play.onclick=()=>{blocked=false;request(!(media?.playing&&position()<DURATION),position()>=DURATION?0:position());tick();};$('archive-recording-stop').onclick=()=>request(false,0);seek.onchange=()=>request(!!media?.playing,Number(seek.value));
 win.querySelectorAll('[data-recording-seek]').forEach(button=>button.onclick=()=>request(!!media?.playing,Number(button.dataset.recordingSeek)));
 function tick(){const at=position(),active=state?.power?.mode==='on'&&!!state.power.loginAt&&document.body.dataset.irosPhase==='desktop'&&$('control-gate')?.hidden&&media?.playing&&at<DURATION;
  window.IROSArchiveRecordingPlaying=!!active;audio.volume=Math.max(0,Math.min(1,masterVolume));
  if(Math.abs(audio.currentTime-at)>.4)try{audio.currentTime=at;}catch{}
  if(active&&audioEnabled){if(audio.paused)audio.play().then(()=>{blocked=false;}).catch(()=>{blocked=true;});}else if(!audio.paused)audio.pause();
  let current=null;for(const line of lines)if(Number(line.dataset.recordingTime)<=at)current=line;for(const line of lines)line.classList.toggle('active',line===current&&at<DURATION);
  play.textContent=active?'PAUSAR':'REPRODUZIR';$('archive-recording-time').textContent=format(at)+' / 00:35';if(document.activeElement!==seek)seek.value=at;
  status.textContent=blocked&&active?'CLIQUE NA JANELA PARA ATIVAR O ÁUDIO':active?'REPRODUZINDO // '+(media.by||'SESSÃO COMPARTILHADA'):at>=DURATION?'REPRODUÇÃO CONCLUÍDA':at>0?'PAUSADO // SESSÃO COMPARTILHADA':'PRONTO // REPRODUÇÃO COMPARTILHADA';
 }
 audio.addEventListener('error',()=>status.textContent='NÃO FOI POSSÍVEL CARREGAR A GRAVAÇÃO.');audio.addEventListener('loadedmetadata',tick);document.addEventListener('pointerdown',()=>{if(blocked)tick();},{passive:true});
 rt.init().then(()=>{rt.onState('session',value=>{state=value;media=value?.recording||null;tick();});setInterval(tick,150);}).catch(console.error);
})();