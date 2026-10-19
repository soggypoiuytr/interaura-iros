(async function(){
 'use strict';
 const rt=window.InterauraRealtime;if(!rt)return;await rt.init();let roster={};
 function draw(){
  const apps=new Map();
  for(const p of Object.values(roster)){
   if(p.online===false||!Number.isFinite(p.at)||rt.now()-p.at>20000||!p.activeApp)continue;
   if(!apps.has(p.activeApp))apps.set(p.activeApp,new Set());apps.get(p.activeApp).add(p.characterName||p.playerName||'Usuário');
  }
  const targets=[...document.querySelectorAll('.desktop-icon[data-open-app],.iros-app-window')];
  for(const target of targets){
   let app=target.dataset.openApp||target.dataset.appWindow;
   if(app==='main')app=typeof mainWindowApp==='string'?mainWindowApp:'';
   const users=[...(apps.get(app)||[])],text=users.length?users.join(', ')+' · vendo':'';
   let tag=target.querySelector(':scope > .iros-program-users');
   if(!text){tag?.remove();continue;}
   if(!tag){tag=document.createElement('span');tag.className='iros-program-users';if(target.classList.contains('desktop-icon'))target.prepend(tag);else target.append(tag);}
   if(tag.textContent!==text)tag.textContent=text;tag.title='Em uso por: '+users.join(', ');
  }
 }
 rt.onState('participants',value=>{roster=value||{};draw();});setInterval(draw,1000);
})().catch(error=>console.error('IROS atividade',error));
