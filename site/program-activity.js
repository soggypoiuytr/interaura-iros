window.IROSProgramActivity={
 group(roster,now){const apps=new Map();for(const p of Object.values(roster||{})){if(p.online===false||!Number.isFinite(p.at)||now-p.at>20000||!p.activeApp)continue;if(!apps.has(p.activeApp))apps.set(p.activeApp,new Set());apps.get(p.activeApp).add(p.characterName||p.playerName||'Usuario');}return apps;},
 label(users){if(!users.length)return '';const suffix=' \u00b7 vendo',short=(name,max)=>Array.from(name).length>max?Array.from(name).slice(0,max-1).join('')+'\u2026':name;const all=users.join(', ')+suffix;if(Array.from(all).length<=19)return all;if(users.length===1)return short(users[0],11)+suffix;const count=' +'+(users.length-1);return short(users[0],19-count.length-suffix.length)+count+suffix;}
};
(async function(){
 'use strict';
 const rt=window.InterauraRealtime;if(!rt)return;await rt.init();let roster={};
 function draw(){
  const apps=window.IROSProgramActivity.group(roster,rt.now());
  const targets=[...document.querySelectorAll('.desktop-icon[data-open-app],.iros-app-window')];
  for(const target of targets){
   let app=target.dataset.openApp||target.dataset.appWindow;
   if(app==='main')app=typeof mainWindowApp==='string'?mainWindowApp:'';
   const users=[...(apps.get(app)||[])],text=window.IROSProgramActivity.label(users);
   let tag=target.querySelector(':scope > .iros-program-users');
   if(!text){tag?.remove();continue;}
   if(!tag){tag=document.createElement('span');tag.className='iros-program-users';if(target.classList.contains('desktop-icon'))target.prepend(tag);else target.append(tag);}
   if(tag.textContent!==text){tag.textContent=text;tag.classList.remove('activity-glitch');void tag.offsetWidth;tag.classList.add('activity-glitch');}tag.title='Vendo este programa:\n'+users.join('\n');tag.setAttribute('aria-label',tag.title);
  }
 }
 rt.onState('participants',value=>{roster=value||{};draw();});setInterval(draw,1000);
})().catch(error=>console.error('IROS atividade',error));
