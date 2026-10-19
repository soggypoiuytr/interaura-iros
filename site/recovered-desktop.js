(function(){
 const rt=window.InterauraRealtime,$=id=>document.getElementById(id),base='assets/audio/recovered/';
 const sounds=Object.fromEntries(['window-open','window-close','file-open','file-close','boot-extra'].map(name=>{const a=new Audio(base+name+'.wav');a.preload=name==='boot-extra'?'metadata':'auto';return[name,a]}));
 const cue=name=>playTransientSound(sounds[name],.6),closing=new WeakMap();
 playSystemError=function(){return playAudio(document.getElementById('error-chord-audio'),.85)};
 const open=openIrosApp,close=closeIrosWindow,archive=openArchiveRow;
 function enter(win){clearTimeout(closing.get(win));win.classList.remove('processing-exit','processing-enter');void win.offsetWidth;win.classList.add('processing-enter');setTimeout(()=>win.classList.remove('processing-enter'),320)}
 openIrosApp=function(app){
  if(app==='chat'){irosStartMenu.classList.remove('open');irosStartMenu.setAttribute('aria-hidden','true');const popup=$('chat-recovery-error');popup.classList.add('open');popup.setAttribute('aria-hidden','false');popup.querySelector('.program-error').classList.add('processing-enter');playSystemError();window.IROSTable?.recordAction('ACESSO: Chat Interno // EXECUTÁVEL EM RECUPERAÇÃO');return;}
  const result=open(app),win=['network','files','terminal'].includes(app)?appContent:irosWindows[app];
  if(win?.classList.contains('open')){enter(win);cue('window-open');}return result;
 };
 closeIrosWindow=function(win){if(!win?.classList.contains('open'))return close(win);clearTimeout(closing.get(win));win.classList.remove('processing-enter');win.classList.add('processing-exit');cue('window-close');closing.set(win,setTimeout(()=>{close(win);win.classList.remove('processing-exit')},180));};
 $('chat-error-close').onclick=()=>{const popup=$('chat-recovery-error');popup.classList.remove('open');popup.setAttribute('aria-hidden','true');cue('window-close')};
 openArchiveRow=function(row){const valid=!!archiveDocuments[row.dataset.file],result=archive(row);if(valid){cue('file-open');const button=archiveReader.querySelector('[data-close-archive]'),onclose=button?.onclick;if(button)button.onclick=e=>{cue('file-close');onclose?.call(button,e)};}return result;};
 let media=null,power=null;
 const audio=$('recovered-music'),boot=sounds['boot-extra'];boot.id='recovered-boot-extra';document.body.append(boot);
 function position(){if(!media)return 0;return Math.min(32.5,Math.max(0,media.position+(media.playing?(rt.now()-media.at)/1000:0)))}
 function request(playing,pos){if(!window.IROSTable?.isController())return;window.dispatchEvent(new CustomEvent('iros-media-action',{detail:{playing,position:Math.max(0,Math.min(32.5,pos))}}));}
 $('recovered-play').onclick=()=>request(!(media?.playing&&position()<32.5),position()>=32.5?0:position());$('recovered-stop').onclick=()=>request(false,0);$('recovered-seek').onchange=e=>request(!!media?.playing,Number(e.target.value));
 const time=t=>Math.floor(t/60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0');
 function tick(){
  const stage=document.body.dataset.irosPhase,entered=$('control-gate').hidden;
  const active=entered&&stage==='desktop'&&media?.playing&&position()<32.5;
  window.IROSRecoveredMusicPlaying=!!active;audio.volume=Math.min(1,masterVolume*.72);
  const at=position();if(Math.abs(audio.currentTime-at)>.4)audio.currentTime=at;
  if(active&&audioEnabled){if(audio.paused)audio.play().catch(()=>{})}else if(!audio.paused)audio.pause();
  $('recovered-media-status').textContent=active?'REPRODUZINDO // '+(media.by||'SESSÃO COMPARTILHADA'):at>=32.5?'REPRODUÇÃO CONCLUÍDA':at>0?'PAUSADO // SESSÃO COMPARTILHADA':'PRONTO // REPRODUÇÃO COMPARTILHADA';$('recovered-play').textContent=active?'PAUSAR':'REPRODUZIR';$('recovered-time').textContent=time(at)+' / 00:32';if(document.activeElement!==$('recovered-seek'))$('recovered-seek').value=at;
  const bootPosition=power?(rt.now()-power.at)/1000:0,bootActive=entered&&stage==='post'&&power?.mode==='on'&&bootPosition>=0&&bootPosition<8&&audioEnabled;
  if(bootActive){boot.volume=masterVolume*.42;if(Math.abs(boot.currentTime-bootPosition)>.4)boot.currentTime=bootPosition;if(boot.paused)boot.play().catch(()=>{})}else if(!boot.paused)boot.pause();
 }
 rt.init().then(()=>{rt.onState('session',s=>{media=s?.media||null;power=s?.power||null;tick()});setInterval(tick,250)}).catch(error=>console.error('IROS áudio recuperado',error));
})();
