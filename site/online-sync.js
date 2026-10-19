(async function(){
 'use strict';
 const rt=window.InterauraRealtime,model=window.IROSSharedSession;if(!rt||!model)return;await rt.init();
 const $=id=>document.getElementById(id),startupTemplate=$('startup-screen').cloneNode(true),gate=$('control-gate'),form=$('control-claim-form'),status=$('control-gate-status'),label=$('observer-lock'),out=$('terminal-output');
 let activeProgram='';
 let entered=false,settings={},session=null,power=null,cable=false,lastEpoch=null,lastPhase='',rendered=new Set(),ready=false;
 let noteBaseline={},lastNotes='';const pendingNoteWrites=new Map();
 let identity;try{identity=JSON.parse(sessionStorage.getItem('iros_identity')||'null')}catch{}
 if(appContent.parentElement!==irosDesktop)irosDesktop.append(appContent);
 const canInteract=()=>entered&&rt.connected&&phase()!=='shutdown'&&!settings.blocked&&!settings.credentialsBlocked;
 window.IROSTable={isController:canInteract,isApplying:()=>false,refresh:()=>{},recordAction,get settings(){return settings}};
 window.addEventListener('iros-media-action',e=>act('media',e.detail).catch(()=>{}));
 let lastHistory={text:'',at:0};
 function recordAction(text,committed=false,detail={}){if(!entered||!rt.connected||(!committed&&!canInteract()))return Promise.resolve();const at=rt.now(),value=String(text).slice(0,500);if(!detail.note&&lastHistory.text===value&&at-lastHistory.at<650)return Promise.resolve();lastHistory={text:value,at};return rt.setState('history/'+crypto.randomUUID(),{at,text:value,...detail,playerName:identity.playerName,characterName:identity.characterName,clientId:rt.clientId,authUid:rt.auth?.currentUser?.uid||null}).catch(()=>{});}
 const originalArchive=openArchiveRow;openArchiveRow=function(row){recordAction('ARQUIVO: '+(row.dataset.file==='recovered-song'?'saudade_de_você.wav':row.dataset.file||row.querySelector('button')?.textContent||'NÃO IDENTIFICADO'));return originalArchive(row)};
 const fail=error=>{status.hidden=false;status.textContent='NÃO FOI POSSÍVEL SINCRONIZAR // '+error.message;label.hidden=false;label.textContent=status.textContent;};
 function evaluate(command,s){
  const previous={...iimState},recover=terminalRecoverAttempts;
  try{Object.assign(iimState,{mode:s.iim.mode,module:s.iim.mode?'07':null,ocularActive:s.iim.ocular,connecting:false});terminalRecoverAttempts=Math.max(0,s.recover-1);return terminalAnswer(command)}
  finally{Object.assign(iimState,previous);terminalRecoverAttempts=recover;}
 }
 async function act(kind,extra={}){
  if(!canInteract())return;
  const op={kind,id:crypto.randomUUID(),at:rt.now(),identity:{...identity,discreet:rt.discreet},...extra};
  try{let noteChanges=[];const result=await rt.transact('session',s=>{const next=model.reduce(s,op,evaluate);if(kind==='notes')noteChanges=next?window.IROSNotesAudit.changes(s?.notes,extra.patch):[];return next;});if(result){if(kind==='notes')await Promise.all(noteChanges.map(change=>recordAction(change.text,true,{note:change.note})));const action=kind==='media'?'ÁUDIO: saudade_de_você.wav // '+(extra.playing?'REPRODUZIR':'PAUSAR'):kind==='command'?'COMANDO: '+extra.command:({on:'LIGOU O COMPUTADOR',off:'DESLIGOU O COMPUTADOR',restart:'REINICIOU O COMPUTADOR',login:'AUTENTICOU A SESSÃO IROS'})[kind];if(action)recordAction(action,true);}return result;}catch(error){fail(error);throw error}
 }
 function clean(html){const t=document.createElement('template');t.innerHTML=html||'';t.content.querySelectorAll('script,iframe,object,embed,style,link,audio,video').forEach(n=>n.remove());for(const el of t.content.querySelectorAll('*'))for(const a of [...el.attributes])if(a.name.startsWith('on')||a.name==='srcdoc'||/^(?:javascript|data):/i.test(a.value))el.removeAttribute(a.name);t.content.querySelectorAll('.terminal-response').forEach(n=>n.dataset.revealed='true');return t.content;}
 function phase(){const p=power||session?.power;if(p?.shutdownAt&&rt.now()<p.shutdownAt+p.shutdownMs)return'shutdown';if(!p||p.mode==='off')return'off';const age=rt.now()-p.at;if(age<p.postMs)return'post';if(age<p.postMs+p.splashMs+420)return'splash';if(!p.loginAt)return'login';return rt.now()<p.loginAt+4000?'boot':'desktop';}
 function reset(){
  stopAllAudio();shutdownAudio.pause();if(!$('startup-screen'))document.body.append(startupTemplate.cloneNode(true));document.querySelectorAll('[data-power-dialog]').forEach(el=>el.dispatchEvent(new Event('iros-power-reset')));computerPoweredOn=false;interfaceSoundsReady=false;ambienceEligible=false;booting=false;
  $('startup-screen').classList.remove('finished');$('power-prompt').classList.remove('hidden');$('startup-post').classList.remove('active');$('startup-splash').classList.remove('active');
  document.body.classList.remove('desktop-mode');document.body.classList.add('startup-active');$('iros-desktop').classList.remove('active');$('iros-desktop').setAttribute('aria-hidden','true');appContent.classList.add('app-locked');appContent.setAttribute('aria-hidden','true');
  loginScreen.classList.remove('authenticated','hidden');loginScreen.classList.add('startup-wait');bootScreen.classList.remove('active','complete');
  for(const el of document.querySelectorAll('.iros-app-window'))el.classList.remove('open','minimized','maximized');
  $('iros-start-menu').classList.remove('open');document.querySelector('#login-form button[type=submit]').disabled=false;loginError.textContent='';$('login-pass').value='';
  try{sessionStorage.removeItem('interaura_auth')}catch{}
  out.replaceChildren();rendered.clear();lastPhase='';
 }
 const shutdownAudio=$('shutdown-audio');
 const tracks=[shutdownAudio,powerOnAudio,irosStartupAudio,loginAudio,jingleAudio,interfaceAudio,computerLoopAudio];
 function musicTick(force=false){
  if(!entered)return;
  const p=power||session?.power,stage=phase();let audio=null,at=0,volume=.5;
  if(p&&stage==='shutdown'){audio=shutdownAudio;at=p.shutdownAt;volume=.78;}
  else if(p&&stage==='boot'){audio=powerOnAudio;const duration=Number.isFinite(powerOnAudio.duration)?powerOnAudio.duration:(p.postMs||7600)/1000;const offset=Math.min(duration*.46,duration-.5);at=p.loginAt-offset*1000;volume=.28;}
  else if(p&&stage==='post'){audio=powerOnAudio;at=p.at;volume=.82;}
  else if(p&&stage==='splash'){audio=irosStartupAudio;at=p.at+p.postMs;volume=.78;}
  else if(p&&stage==='login'){audio=loginAudio;at=p.at+p.postMs+p.splashMs+420;volume=.58;}
  else if(p&&stage==='desktop'){
   const start=p.loginAt+4000,duration=Number.isFinite(jingleAudio.duration)?jingleAudio.duration*1000:5000;
   if(rt.now()<start+duration){audio=jingleAudio;at=start;volume=.72;}else{audio=interfaceAudio;at=start+duration;volume=window.IROSRecoveredMusicPlaying ? .08 : .32;}
  }
  if(!musicEnabled&&['login','desktop'].includes(stage)){audio=stage==='desktop'?computerLoopAudio:null;at=p?.loginAt||0;volume=.075;}
  if(!audioEnabled)audio=null;
  for(const track of tracks)if(track!==audio&&!track.paused)track.pause();
  if(!audio)return;applyAudioVolume(audio,volume);
  let position=Math.max(0,(rt.now()-at)/1000);if(Number.isFinite(audio.duration)&&audio.duration>0){if(audio.loop)position%=audio.duration;if(position>=audio.duration){audio.pause();return}}if(force||Math.abs(audio.currentTime-position)>.45){try{audio.currentTime=position}catch{}}
  if(audio.paused)audio.play().catch(()=>{});
 }
 for(const audio of tracks)audio.addEventListener('loadedmetadata',()=>musicTick(true));
 function renderPower(){
  if(!entered||!power)return;
  const p=power,stage=phase();
  if(p.epoch!==lastEpoch){reset();lastEpoch=p.epoch;}
  const isStartup=['off','post','splash','shutdown'].includes(stage);$('startup-screen').classList.toggle('finished',!isStartup);$('shutdown-screen').hidden=stage!=='shutdown';
  document.body.dataset.irosPhase=stage;document.body.classList.toggle('desktop-mode',stage==='desktop');$('iros-desktop').classList.toggle('active',stage==='desktop');$('iros-desktop').setAttribute('aria-hidden',String(stage!=='desktop'));
  if(stage!==lastPhase){
   const previousStage=lastPhase;lastPhase=stage;computerPoweredOn=stage!=='off';
   $('power-prompt').classList.toggle('hidden',stage!=='off');$('startup-post').classList.toggle('active',stage==='post');$('startup-splash').classList.toggle('active',stage==='splash');$('startup-splash').setAttribute('aria-hidden',String(stage!=='splash'));
   $('shutdown-screen').hidden=stage!=='shutdown';
   const startup=['off','post','splash','shutdown'].includes(stage);$('startup-screen').classList.toggle('finished',!startup);document.body.classList.toggle('startup-active',startup);loginScreen.classList.toggle('startup-wait',startup);
   if(stage==='boot'){window.IROSLocalCue?.(loginSuccessAudio,.82);loginScreen.classList.add('authenticated');bootScreen.classList.add('active');bootScreen.setAttribute('aria-hidden','false');}
   if(stage==='desktop'){if(previousStage==='boot'){bootScreen.classList.add('session-glitch-exit');setTimeout(()=>bootScreen.classList.remove('session-glitch-exit'),480);}unlock(false);interfaceSoundsReady=true;bootScreen.classList.remove('active');bootScreen.setAttribute('aria-hidden','true');}
   musicTick(true);
  }
  if(stage==='shutdown'){const progress=Math.min(1,Math.max(0,(rt.now()-p.shutdownAt)/p.shutdownMs));$('shutdown-label').textContent=p.mode==='off'?'Desligando...':'Reiniciando...';document.querySelectorAll('#shutdown-steps p').forEach((el,i,rows)=>{el.classList.toggle('visible',progress>.04+i*.7/rows.length);el.querySelector('i').textContent=progress>.18+i*.7/rows.length?'[ OK ]':'[ .. ]';});}
  if(stage==='post'){const progress=(rt.now()-p.at)/p.postMs;document.querySelectorAll('#post-lines p').forEach((el,i,all)=>el.classList.toggle('visible',progress>.08+i*.72/all.length));$('post-command').classList.toggle('visible',progress>.82);}
  if(stage==='splash')document.querySelectorAll('#iros-steps p').forEach((el,i,all)=>el.classList.toggle('visible',rt.now()-p.at-p.postMs>350+i*p.splashMs*.68/all.length));
  if(stage==='boot'){const elapsed=Math.max(0,rt.now()-p.loginAt),steps=[[0,0],[180,8],[600,19],[1200,38],[2100,58],[2850,81],[3550,96],[3850,100]],progress=steps.filter(([at])=>elapsed>=at).at(-1)[1];$('boot-progress-bar').style.width=progress+'%';$('boot-percent').textContent=progress+'% // RECONSTRUINDO SESSÃO';document.querySelectorAll('#boot-log p').forEach((el,i)=>el.classList.toggle('visible',elapsed>=[180,600,1200,2100,2850,3550][i]));}
 }
 function tick(){
  if(!entered||!session)return;renderPower();const stage=phase();
  const notesHash=JSON.stringify(session.notes||{});if(notesHash!==lastNotes){lastNotes=notesHash;const active=irosNotes.find(n=>n.id===activeNoteId),dirty=active&&(pendingNoteWrites.has(active.id)||noteText.value!==active.text||normalizeNoteTitle(noteTitle.value)!==active.title);noteBaseline=JSON.parse(notesHash);if(session.notes){irosNotes=Object.values(session.notes);if(dirty){irosNotes=irosNotes.filter(n=>n.id!==active.id);irosNotes.push(active);}if(!irosNotes.some(n=>n.id===activeNoteId))activeNoteId=irosNotes[0]?.id||null;renderIrosNotes();if(!dirty)loadActiveNote();}}
  Object.assign(iimState,{mode:!!session.iim?.mode&&cable,module:session.iim?.mode&&cable?'07':null,ocularActive:!!session.iim?.ocular,connecting:false});setIimInterface(iimState.mode);input.disabled=false;
  if(stage!=='desktop')return;
  const rows=Object.values(session.entries||{}).sort((a,b)=>a.at-b.at||a.seq-b.seq),ids=new Set(rows.map(r=>r.id));
  for(const el of out.querySelectorAll('[data-shared-entry]'))if(!ids.has(el.dataset.sharedEntry)){rendered.delete(el.dataset.sharedEntry);el.remove();}
  for(const row of rows){if(rendered.has(row.id)||row.at>rt.now())continue;rendered.add(row.id);const nearBottom=out.scrollHeight-out.scrollTop-out.clientHeight<70;const el=document.createElement('div');el.className='terminal-entry';el.dataset.sharedEntry=row.id;
   if(row.command&&row.command.toUpperCase()!=='CLEAR'){const cmd=document.createElement('div');cmd.className='terminal-command';cmd.textContent=(session.iim?.mode?'C:\\IIM\\MOD-07>':'C:\\INTERAURA>')+' '+row.command;const author=row.by==='Observador'||row.byPlayer==='/mestre'?'':row.by||row.byPlayer;if(author){const badge=document.createElement('span');badge.className='terminal-command-author';badge.textContent=' ('+author+')';cmd.append(badge);}el.append(cmd);}
   el.append(clean(row.html));const next=[...out.children].find(n=>{const r=session.entries[n.dataset.sharedEntry];return r&&(r.at>row.at||(r.at===row.at&&r.seq>row.seq))});out.insertBefore(el,next||null);
   el.querySelectorAll('.terminal-death-status').forEach(node=>node.style.setProperty('--death-fault-delay','-'+Math.max(0,rt.now()-row.at)%4700+'ms'));
   el.querySelectorAll('.terminal-response').forEach(node=>revealTerminalResponse(node,{at:row.at,id:row.id,now:()=>rt.now()}));
   if(nearBottom)out.scrollTop=out.scrollHeight;
   if(ready&&rt.connected&&rt.now()-row.at<2000&&row.html){playTransientSound(terminalReturnSounds[row.seq%terminalReturnSounds.length],.34);if(/^(MOD-01|MÓDULO-01)$/i.test(row.command)){out.classList.add('terminal-neural-fault');setTimeout(()=>out.classList.remove('terminal-neural-fault'),3200);}}
   if(ready&&row.notice&&rt.now()-row.at<3000)window.dispatchEvent(new CustomEvent('iros-notice',{detail:row.notice}));
  }
  ready=true;
 }
 function acceptPower(value){const next=value||model.initial().power;if(power&&((next.revision||0)<(power.revision||0)||((next.revision||0)===(power.revision||0)&&next.epoch!==power.epoch&&next.at<power.at)))return;power=next;renderPower();}
 rt.onState('session',value=>{session=value||model.initial();tick()});
 rt.onState('session/power',acceptPower);
 rt.onState('settings',value=>{settings=value||{};window.dispatchEvent(new CustomEvent('iros-settings',{detail:settings}));});
 rt.onState('error',message=>fail(Error(message)));
 rt.onState('connection',connected=>{if(!connected){label.hidden=false;label.textContent='CONEXÃO INTERROMPIDA // AGUARDANDO RECONEXÃO';}else if(entered){presence();label.hidden=false;label.textContent='SESSÃO COMPARTILHADA // INTERAÇÃO LIVRE';}else label.hidden=true;});
 rt.onState('iimCable',value=>{const changed=cable!==!!value?.connected;cable=!!value?.connected;window.interauraCableConnected=cable;const icon=$('iros-iim-link');icon?.classList.toggle('connected',cable);if(changed&&cable&&entered&&phase()==='desktop'){icon?.classList.add('announcing');setTimeout(()=>icon?.classList.remove('announcing'),6500);window.IROSTrayNotice?.(icon,'Interface IIM detectada','A conexão física com a IIM foi estabelecida.');window.IROSLocalCue?.($('iim-connected-audio'),.62);}if(!cable){Object.assign(iimState,{mode:false,module:null,ocularActive:false});setIimInterface(false);}});
 form.querySelector('button[type=submit]').disabled=false;status.textContent='SESSÃO DISPONÍVEL // INTERAÇÃO LIVRE';
 if(identity){$('control-player').value=identity.playerName||'';$('control-character').value=identity.characterName||'';}
 let entering=false;form.addEventListener('submit',async e=>{e.preventDefault();e.stopPropagation();if(entered||entering)return;identity={characterName:$('control-character').value.trim(),playerName:$('control-player').value.trim()};if(!identity.characterName||!identity.playerName)return;entering=true;try{const roster=await rt.getState('participants');await rt.transact('session',state=>{if(!window.IROSIdlePower.expired(roster,state?.power,rt.now()))return;return model.reduce(state,{kind:'off',id:crypto.randomUUID(),at:rt.now()-31000,shutdownMs:3500},evaluate);});}catch(error){entering=false;fail(error);return;}entering=false;sessionStorage.setItem('iros_identity',JSON.stringify(identity));entered=true;gate.classList.add('enter-glitch');gate.setAttribute('aria-busy','true');setTimeout(()=>{gate.hidden=true;gate.setAttribute('aria-busy','false')},window.matchMedia('(prefers-reduced-motion: reduce)').matches?150:600);label.hidden=false;label.textContent='SESSÃO COMPARTILHADA // INTERAÇÃO LIVRE';const cue=$('confirm-audio');cue.volume=0;cue.play().then(()=>{cue.pause();cue.currentTime=0}).catch(()=>{});tick();musicTick(true);presence();});
 function presence(){if(entered&&rt.connected)rt.setPresence({...identity,activeApp:phase()==='desktop'?activeProgram:''}).catch(fail);}
 function programFor(win){return win?.dataset.appWindow==='main'?mainWindowApp:win?.dataset.appWindow||'';}
 function selectProgram(app){if(activeProgram===app)return;activeProgram=app;presence();}
 document.addEventListener('dblclick',e=>{const app=e.target.closest('[data-open-app]')?.dataset.openApp;if(['chat','solitaire'].includes(app)&&!settings.blockedPrograms?.[app])selectProgram(app);},true);
 document.addEventListener('click',e=>{const app=e.target.closest('#iros-start-menu [data-open-app]')?.dataset.openApp;if(['chat','solitaire'].includes(app)&&!settings.blockedPrograms?.[app])selectProgram(app);},true);
 const focusWithActivity=focusIrosWindow;focusIrosWindow=function(win){const result=focusWithActivity(win);selectProgram(programFor(win));return result;};
 document.addEventListener('click',e=>{if(!e.target.closest('[data-window-action],[data-task-app],#chat-error-close,#solitaire-error-close'))return;setTimeout(()=>{const windows=[...document.querySelectorAll('.iros-app-window.open:not(.minimized)')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex));selectProgram(programFor(windows[0]));},250);},true);
 document.addEventListener('pointerdown',e=>{if(e.target.id==='iros-desktop')selectProgram('');});
 setInterval(presence,5000);
 const localPersist=persistIrosNotes;persistIrosNotes=function(){localPersist();if(!canInteract())return;const local=Object.fromEntries(irosNotes.map(n=>[n.id,n])),patch={};for(const [id,note] of Object.entries(local))if(JSON.stringify(note)!==JSON.stringify(noteBaseline[id]))patch[id]=note;for(const id of Object.keys(noteBaseline))if(!local[id])patch[id]=null;if(Object.keys(patch).length){const ids=Object.keys(patch);for(const id of ids)pendingNoteWrites.set(id,(pendingNoteWrites.get(id)||0)+1);act('notes',{patch}).then(()=>noteStatus.textContent='SALVO // SESSÃO COMPARTILHADA').catch(()=>noteStatus.textContent='FALHA DE SINCRONIZAÇÃO // CÓPIA LOCAL PRESERVADA').finally(()=>{for(const id of ids){const count=pendingNoteWrites.get(id)-1;if(count)pendingNoteWrites.set(id,count);else pendingNoteWrites.delete(id);}});}};
 function confirmPower(kind){return new Promise(resolve=>{const overlay=document.createElement('div');overlay.className='control-gate';overlay.dataset.powerDialog='true';overlay.style.background='#0009';overlay.innerHTML='<section class="control-gate-panel" role="dialog" aria-modal="true" aria-labelledby="power-confirm-title"><h1 id="power-confirm-title">'+(kind==='off'?'DESLIGAR':'REINICIAR')+' IROS</h1><p>Esta ação afeta o computador de todos os participantes.</p><button type="button" data-confirm>CONFIRMAR</button> <button type="button" data-cancel>CANCELAR</button></section>';document.body.append(overlay);function finish(value){overlay.remove();resolve(value)}overlay.addEventListener('iros-power-reset',()=>finish(false),{once:true});overlay.querySelector('[data-confirm]').onclick=()=>finish(true);overlay.querySelector('[data-cancel]').onclick=()=>finish(false);overlay.querySelector('[data-cancel]').focus();});}
 document.addEventListener('click',async e=>{
  const button=e.target.closest('#power-button,[data-power]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();if(!canInteract())return;
  const kind=button.dataset.power||'on';if(kind!=='on'&&!await confirmPower(kind))return;
  const ms=(a,f)=>Number.isFinite(a.duration)&&a.duration>1?Math.round(a.duration*1000):f;
  act(kind,{postMs:ms(powerOnAudio,7600),splashMs:ms(irosStartupAudio,5200),shutdownMs:ms(shutdownAudio,5800)+700}).catch(()=>{});
 },true);
 document.addEventListener('submit',e=>{
  if(e.target!==$('terminal-form')&&e.target!==$('login-form'))return;e.preventDefault();e.stopImmediatePropagation();if(!canInteract())return;
  if(e.target===$('login-form')){
   const user=$('login-user').value.trim().toLowerCase(),pass=$('login-pass').value;
   if(['ariella','a.chiyomi','a.chioyomi','ariella chiyomi'].includes(user)&&pass==='SAUDADE-0317-88'){act('login').catch(()=>{});$('login-pass').value='';}
   else{loginError.textContent='アクセス拒否 // IDENTIFICAÇÃO OU CÓDIGO INVÁLIDO';playSystemError();}return;
  }
  const command=input.value.trim();if(!command)return;input.value='';terminalHistory.push(command);terminalHistoryIndex=terminalHistory.length;
  act('command',{command,cable}).catch(()=>{input.value=command;});
 },true);
 // Connection loss and administrative suspension block writes, never other participants' scrolling.
 document.addEventListener('click',e=>{if(!entered||canInteract()||e.target.closest('#control-gate,.audio-controls'))return;if(e.target.closest('button,a')){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('pointerdown',()=>musicTick(),{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){rt.getState('session/power').then(value=>{acceptPower(value);musicTick(true)}).catch(fail);presence();}});
 document.addEventListener('click',e=>{if(!canInteract())return;const file=e.target.closest('#notepad-files .notepad-file');if(file)recordAction('NOTA CONSULTADA: '+file.textContent.trim());},true);
 document.addEventListener('click',e=>{if(!canInteract())return;const target=e.target.closest('[data-open-app],.archive-row,[data-view-link]');if(target)recordAction('ACESSO: '+(target.dataset.file||target.dataset.openApp||target.textContent.trim()));},true);
 setInterval(renderPower,200);setInterval(tick,250);setInterval(musicTick,2000);
})().catch(error=>{document.querySelector('#control-gate-status').hidden=false;document.querySelector('#control-gate-status').textContent='CONEXÃO NÃO DISPONÍVEL // '+error.message;console.error('IROS',error)});
