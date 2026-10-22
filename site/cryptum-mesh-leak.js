(function(){
 'use strict';
 const rt=window.InterauraRealtime;if(!rt)return;
 let session=null,cable=false,key='',tint=null;
 const affected=new Set(),textAffected=new Set();
 document.fonts?.load('14px CryptumStray').catch(()=>{});
 function reset(){
  document.body.classList.remove('cryptum-mesh-linked','cryptum-mesh-pulse');
  document.body.style.removeProperty('--mesh-phase');
  for(const node of affected)node.classList.remove('cryptum-mesh-icon');affected.clear();
  for(const node of textAffected)node.classList.remove('cryptum-mesh-text');textAffected.clear();tint?.remove();tint=null;key='';
 }
 const visible=node=>{const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;};
 function tick(){
  if(!cable||session?.power?.mode!=='on'||!session.power.loginAt||!session.iim?.mode||session.iim.module!=='49-1'||document.body.dataset.irosPhase!=='desktop'||['implementing','destroying'].includes(session.cryptum?.status)){reset();return;}
  const at=session.iim.connectedAt||session.power.loginAt,elapsed=Math.max(0,rt.now()-at),cycle=Math.floor(elapsed/7000),phase=elapsed%7000,nextKey=session.power.epoch+':'+at;
  if(key!==nextKey){reset();key=nextKey;tint=document.createElement('div');tint.className='cryptum-mesh-tint';tint.setAttribute('aria-hidden','true');document.body.append(tint);document.body.classList.add('cryptum-mesh-linked');document.body.style.setProperty('--mesh-phase',(-phase/1000)+'s');}
  document.body.classList.toggle('cryptum-mesh-pulse',phase<500||phase>6100);
  const icons=[...document.querySelectorAll('.desktop-icon img,.desktop-icon .desktop-icon-glyph,.desktop-icon .iros-pixel-icon,.desktop-icon .iros-audio-file-icon,.iros-tray img')].filter(visible);
  const wanted=new Set();if((phase<360||phase>2800&&phase<3160)&&icons.length){for(let i=0;i<Math.min(2,Math.ceil(icons.length*.15));i++)wanted.add(icons[(cycle*3+i*5)%icons.length]);}
  for(const node of affected)if(!wanted.has(node)){node.classList.remove('cryptum-mesh-icon');affected.delete(node);}
  for(const node of wanted)if(!affected.has(node)){node.classList.add('cryptum-mesh-icon');affected.add(node);}
  const wantedText=new Set();
  if(phase>=900&&phase<1080||phase>=4100&&phase<4280){
   const labels=[...document.querySelectorAll('#iim-console-state,.desktop-icon>span:last-of-type,.iros-titlebar-title')].filter(node=>visible(node)&&node.textContent.trim());
   for(let i=0;i<Math.min(2,labels.length);i++){
    wantedText.add(labels[(cycle+i*3)%labels.length]);
   }
  }
  for(const node of textAffected)if(!wantedText.has(node)){node.classList.remove('cryptum-mesh-text');textAffected.delete(node);}
  for(const node of wantedText)if(!textAffected.has(node)){node.classList.add('cryptum-mesh-text');textAffected.add(node);}
 }
 let sessionVersion=0,cableVersion=0;
 rt.init().then(()=>{
  rt.onState('session',value=>{sessionVersion++;session=value;tick();});rt.onState('iimCable',value=>{cableVersion++;cable=!!value?.connected;tick();});
  const sv=sessionVersion,cv=cableVersion;
  return Promise.all([rt.getState('session').then(value=>{if(sessionVersion===sv){session=value;tick();}}),rt.getState('iimCable').then(value=>{if(cableVersion===cv){cable=!!value?.connected;tick();}})]);
 }).catch(console.error);
 setInterval(tick,100);
 window.addEventListener('pagehide',reset);
 window.IROSCryptumMesh={reset};
})();
