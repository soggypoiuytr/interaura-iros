(function(){
 'use strict';const rt=window.InterauraRealtime;if(!rt)return;
 const sounds={open:new Audio('assets/audio/cd-tray-open.wav'),closed:new Audio('assets/audio/cd-tray-close.wav')};for(const sound of Object.values(sounds))sound.preload='auto';
 const info=document.getElementById('cryptum-information').cloneNode(true);info.id='dvd-information';info.setAttribute('aria-labelledby','dvd-information-title');info.querySelector('header span').id='dvd-information-title';info.querySelector('header span').textContent='INFORMAÇÃO DO SISTEMA // DVD-ROM';document.body.append(info);
 let previousFocus=null;const dismiss=()=>{info.hidden=true;if(previousFocus?.isConnected)previousFocus.focus();};info.querySelector('button').onclick=dismiss;info.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dismiss();}});
 function showInformation(open){previousFocus=document.activeElement;info.querySelector('section').innerHTML=open?'<b>LEITOR DE DVD ABERTO.</b><p>Insira o disco na bandeja da unidade DVD-ROM.</p><code>BANDEJA: ABERTA<br>UNIDADE: D:<br>VARREDURA: EM ESPERA</code><p>Feche a bandeja com DVD CLOSE e execute DVD SCAN para identificar a mídia.</p>':'<b>LEITOR DE DVD FECHADO.</b><p>A bandeja da unidade DVD-ROM foi recolhida.</p><code>BANDEJA: FECHADA<br>UNIDADE: D:<br>VARREDURA: EM ESPERA</code><p>Execute DVD SCAN no terminal para identificar a mídia.</p>';info.hidden=false;window.IROSInformationCue?.play();info.querySelector('button').focus();}
 let initialized=false,lastEvent=null;const listeningAt=Date.now();
 rt.init().then(()=>rt.onState('session',state=>{const dvd=state?.dvd,event=dvd?.eventId;
  if(state?.power?.mode!=='on')info.hidden=true;
  const changed=event&&event!==lastEvent;lastEvent=event||null;
  const live=initialized||dvd?.at>=listeningAt-1500;initialized=true;
  if(!changed||!live||dvd.epoch!==state?.power?.epoch||document.body.dataset.irosPhase!=='desktop')return;
  const open=dvd.tray==='open';window.IROSLocalCue?.(sounds[dvd.tray],.85);
  showInformation(open);
 })).catch(console.error);
})();