(function(){
 let timer,active;
 window.IROSTrayNotice=function(anchor,title,text){
  if(!anchor||document.body.dataset.irosPhase!=='desktop')return;
  clearTimeout(timer);active?.remove();
  const box=document.createElement('aside'),heading=document.createElement('strong'),body=document.createElement('p'),close=document.createElement('button');
  box.className='iros-tray-balloon';box.setAttribute('role','status');heading.textContent=title;body.textContent=text;close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar aviso');
  box.append(heading,body,close);document.body.append(box);active=box;
  const rect=anchor.getBoundingClientRect(),left=Math.max(8,Math.min(rect.left+rect.width/2-245,innerWidth-box.offsetWidth-8));
  box.style.left=left+'px';box.style.bottom=(innerHeight-rect.top+13)+'px';box.style.setProperty('--balloon-tail',Math.max(14,Math.min(box.offsetWidth-22,rect.left+rect.width/2-left))+'px');
  const dismiss=()=>{clearTimeout(timer);box.classList.add('leaving');setTimeout(()=>box.remove(),310);};close.onclick=dismiss;timer=setTimeout(dismiss,6500);return box;
 };
})();
