(function(){
 'use strict';
 const fine=matchMedia('(hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const icon=document.createElement('span');icon.id='iros-loading-cursor';icon.hidden=true;icon.setAttribute('aria-hidden','true');document.body.append(icon);
 let shared=false,busy=false,startup=false,inside=false,x=0,y=0,raf=0,start=0;const jobs=new Set();
 function visible(el){return !!el&&!el.closest('[hidden],[aria-hidden="true"]')&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';}
 function animate(at){raf=0;if(!busy||!inside||!fine.matches||document.hidden){icon.hidden=true;return;}const frame=reduced.matches?0:Math.floor((at-start)/83.333)%32;icon.style.backgroundPosition=-(frame%8)*48+'px '+-Math.floor(frame/8)*48+'px';icon.style.transform='translate3d('+Math.round(x-24)+'px,'+Math.round(y-24)+'px,0)';icon.hidden=false;raf=requestAnimationFrame(animate);}
 function check(){
  const phase=document.body.dataset.irosPhase,gate=document.getElementById('control-gate');
  startup=(!gate||gate.hidden)&&['post','splash','boot','shutdown'].includes(phase);
  const work=[...document.querySelectorAll('[aria-busy="true"],.processing-enter,.terminal-revealing,.cryptum-scanning,.cryptum-live-stream')].some(visible);
  busy=fine.matches&&!document.hidden&&!startup&&(jobs.size>0||work||(shared&&phase==='desktop'));
  document.body.classList.toggle('iros-cursor-startup',startup&&fine.matches);
  document.body.classList.toggle('iros-cursor-busy',busy);
  if(!busy){icon.hidden=true;cancelAnimationFrame(raf);raf=0;start=0;}else if(inside&&!raf){start=performance.now();raf=requestAnimationFrame(animate);}
 }
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;inside=true;x=e.clientX;y=e.clientY;if(busy&&!raf)raf=requestAnimationFrame(animate);},{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget){inside=false;icon.hidden=true;cancelAnimationFrame(raf);raf=0;}});
 document.addEventListener('visibilitychange',check);fine.addEventListener('change',check);
 window.addEventListener('blur',()=>{inside=false;icon.hidden=true;cancelAnimationFrame(raf);raf=0;});
 window.IROSCursor={begin(){const token=Symbol('loading');jobs.add(token);check();return token;},end(token){jobs.delete(token);check();}};
 const rt=window.InterauraRealtime;if(rt)rt.init().then(()=>rt.onState('session',s=>{shared=s?.power?.mode==='on'&&(s?.request?.status==='pending'||['pending','destroying','implementing'].includes(s?.cryptum?.status));check();})).catch(()=>{});
 setInterval(check,100);check();
})();
