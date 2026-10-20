(function(){
 const rt=window.InterauraRealtime,$=id=>document.getElementById(id),base='assets/audio/recovered/';
 const sounds=Object.fromEntries(['window-open','window-close','file-open','file-close','boot-extra'].map(name=>{const a=new Audio(base+name+'.wav');a.preload=name==='boot-extra'?'metadata':'auto';return[name,a]}));
 const cue=name=>playTransientSound(sounds[name],.6),closing=new WeakMap();
 playSystemError=function(){return playAudio(document.getElementById('error-chord-audio'),.85)};
 const open=openIrosApp,close=closeIrosWindow,archive=openArchiveRow;
 function enter(win){clearTimeout(closing.get(win));win.classList.remove('processing-exit','processing-enter');void win.offsetWidth;win.classList.add('processing-enter');setTimeout(()=>win.classList.remove('processing-enter'),320)}
 openIrosApp=function(app){

  const result=open(app),win=['network','files','terminal'].includes(app)?appContent:irosWindows[app];
  if(win?.classList.contains('open')){enter(win);cue('window-open');if(app==='chat')loadChatCredential();}return result;
 };
 closeIrosWindow=function(win){if(!win?.classList.contains('open'))return close(win);clearTimeout(closing.get(win));win.classList.remove('processing-enter');win.classList.add('processing-exit');cue('window-close');closing.set(win,setTimeout(()=>{close(win);win.classList.remove('processing-exit')},180));};
 const chatForm=$('chat-login-form'),chatState=$('chat-link-state'),chatCredential=$('chat-credential'),chatDetail=$('chat-credential-detail'),chatButton=chatForm.querySelector('button'),chatPopup=$('chat-recovery-error');let chatAttempt=0;
 function hideChatError(){chatPopup.classList.remove('open');chatPopup.setAttribute('aria-hidden','true');}
 function loadChatCredential(){const attempt=++chatAttempt;hideChatError();chatButton.disabled=true;chatForm.setAttribute('aria-busy','true');chatCredential.textContent='CARREGANDO CREDENCIAL...';chatDetail.textContent='Consultando a sessão autenticada.';chatState.textContent='SEM CONEXÃO';
  setTimeout(()=>{if(attempt!==chatAttempt)return;chatCredential.textContent='A.CHIYOMI';chatDetail.textContent='ARIELLA CHIYOMI // SESSÃO IROS VINCULADA';chatForm.setAttribute('aria-busy','false');chatButton.disabled=false;},650);
 }
 function connectChat(){if(chatButton.disabled)return;hideChatError();const attempt=++chatAttempt;chatButton.disabled=true;chatForm.setAttribute('aria-busy','true');chatState.textContent='CONECTANDO...';
  setTimeout(()=>{if(attempt!==chatAttempt)return;chatButton.disabled=false;chatForm.setAttribute('aria-busy','false');chatState.textContent='SEM CONEXÃO';if(!$('chat-login-window').classList.contains('open')||document.body.dataset.irosPhase!=='desktop')return;
   chatPopup.classList.add('open');chatPopup.setAttribute('aria-hidden','false');const dialog=$('chat-error-dialog');dialog.classList.remove('camera-image-glitch');void dialog.offsetWidth;dialog.classList.add('camera-image-glitch');setTimeout(()=>dialog.classList.remove('camera-image-glitch'),430);playSystemError();$('chat-error-close').focus();
   window.IROSTable?.recordAction('CHAT INTERNO: CONEXÃO RECUSADA // INTMSG-032');
  },1450);
 }
 chatForm.addEventListener('submit',event=>{event.preventDefault();connectChat()});$('chat-retry').onclick=connectChat;$('chat-error-close').onclick=()=>{hideChatError();chatButton.focus()};
 const closeChatWindow=closeIrosWindow;closeIrosWindow=function(win){if(win===$('chat-login-window')){chatAttempt++;hideChatError();}return closeChatWindow(win)};

 openArchiveRow=function(row){if(row.dataset.file==='recovered-song'){archiveRows.forEach(r=>r.classList.toggle('selected',r===row));cue('file-open');openIrosApp('music');return;}const valid=!!archiveDocuments[row.dataset.file],result=archive(row);if(valid){cue('file-open');const button=archiveReader.querySelector('[data-close-archive]'),onclose=button?.onclick;if(button)button.onclick=e=>{cue('file-close');onclose?.call(button,e)};}return result;};
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
