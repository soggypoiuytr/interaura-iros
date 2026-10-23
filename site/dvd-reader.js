(function(){
 'use strict';const rt=window.InterauraRealtime;if(!rt)return;
 const sounds={open:new Audio('assets/audio/cd-tray-open.wav'),closed:new Audio('assets/audio/cd-tray-close.wav')};for(const sound of Object.values(sounds))sound.preload='auto';
 let initialized=false,lastEvent=null;const listeningAt=Date.now();
 rt.init().then(()=>rt.onState('session',state=>{const dvd=state?.dvd,event=dvd?.eventId;
  const changed=event&&event!==lastEvent;lastEvent=event||null;
  const live=initialized||dvd?.at>=listeningAt-1500;initialized=true;
  if(!changed||!live||dvd.epoch!==state?.power?.epoch||document.body.dataset.irosPhase!=='desktop')return;
  const open=dvd.tray==='open';window.IROSLocalCue?.(sounds[dvd.tray],.85);
  window.IROSTrayNotice?.(document.querySelector('.iros-remote-link'),open?'LEITOR DE DVD ABERTO':'LEITOR DE DVD FECHADO',open?'A bandeja foi aberta. Aguardando inserção de mídia.':'Detecção de mídia pendente. Rotina de identificação ainda não configurada.');
 })).catch(console.error);
})();