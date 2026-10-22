(function(){
 'use strict';
 const rt=window.InterauraRealtime,model=window.IROSSharedSession;
 if(!rt||!model)return;
 const windows={iim:document.querySelector('#iim-console-window'),cryptum:document.querySelector('#cryptum-reader-window')};
 let session=null,applying=false,intent=false,gesture=null,timer=0,received=0,lastFocus='';
 const baseFocus=focusIrosWindow;
 const pending={};
 const seenEffects={},exits={};let initialized=false;
 const keyFor=win=>Object.keys(windows).find(key=>windows[key]===win);
 const valid=()=>session?.power?.mode==='on'&&session.power.loginAt&&(session.iim?.consoleOpen||session.iim?.mode);
 const record=key=>{const row=session?.sharedWindows?.[key];return row?.epoch===session?.power?.epoch&&row.token===(session?.iim?.openId||'legacy')?row:null;};
 const size=()=>({w:Math.max(1,innerWidth),h:Math.max(1,innerHeight-40)});
 function rectangle(win){const {w,h}=size();return{x:win.offsetLeft/w,y:win.offsetTop/h,w:win.offsetWidth/w,h:win.offsetHeight/h};}
 function publish(key,patch){
  if(applying||!valid()||window.IROSTable?.isController?.()===false)return;
  const epoch=session.power.epoch,token=session.iim.openId||'legacy';
  rt.transact('session',current=>model.reduce(current,{kind:'shared-window',id:rt.clientId+'-window-'+Date.now()+'-'+Math.random().toString(36).slice(2),at:rt.now(),actor:rt.clientId,app:key,patch,epoch,token})).catch(console.error);
 }
 function paint(key,row){
  const win=windows[key];if(!win||!row)return;
  const effect=row.effect,fresh=effect?.id&&seenEffects[key]!==effect.id;
  if(fresh)seenEffects[key]=effect.id;
  const animate=fresh&&initialized&&effect.actor!==rt.clientId&&Math.abs(rt.now()-effect.at)<5000;
  if(row.open===true&&exits[key]){clearTimeout(exits[key]);delete exits[key];}
  if(fresh&&initialized&&effect.kind==='close'&&win.classList.contains('open')&&(animate||effect.actor===rt.clientId)){
   if(animate)window.IROSWindowEffects?.close(win);clearTimeout(exits[key]);exits[key]=setTimeout(()=>{delete exits[key];paint(key,record(key)||row);win.classList.remove('processing-exit');},180);return;
  }
  if(exits[key]&&row.open===false)return;
  applying=true;
  try{
   if(row.open===true)win.classList.remove('processing-exit');
   if(row.rect&&gesture?.key!==key){const {w,h}=size(),r=row.rect;win.style.left=Math.min(r.x*w,Math.max(0,w-180))+'px';win.style.top=Math.min(r.y*h,Math.max(0,h-40))+'px';win.style.width=Math.max(Math.min(330,w),Math.min(r.w*w,w))+'px';win.style.height=Math.max(Math.min(220,h),Math.min(r.h*h,h))+'px';}
   for(const name of ['open','minimized','maximized'])if(typeof row[name]==='boolean')win.classList.toggle(name,row[name]);
   win.setAttribute('aria-hidden',String(!win.classList.contains('open')));
   if(animate&&effect.kind==='open'&&row.open)window.IROSWindowEffects?.open(win);
   if(typeof refreshTaskButtons==='function')refreshTaskButtons();
  }finally{applying=false;}
 }
 function render(){if(document.body.dataset.irosPhase!=='desktop'||!valid())return;for(const key of Object.keys(windows))paint(key,record(key));const focus=session.sharedWindowFocus;if(focus?.id!==lastFocus&&windows[focus?.app]?.classList.contains('open')){lastFocus=focus.id;baseFocus(windows[focus.app]);}}
 function receive(value){received++;if(session?.power?.epoch!==value?.power?.epoch||session?.iim?.openId!==value?.iim?.openId){clearTimeout(timer);timer=0;gesture=null;for(const key of Object.keys(pending))delete pending[key];for(const key of Object.keys(exits)){clearTimeout(exits[key]);delete exits[key];}initialized=false;}session=value;render();initialized=true;}
 // Programmatic restoration must not reopen a window the room has already closed.
 const baseOpen=openIrosApp;
 openIrosApp=function(app){
  if(!windows[app]||applying||!valid())return baseOpen.apply(this,arguments);
  const saved=record(app);
  if(!intent&&saved){paint(app,saved);return;}
  const result=baseOpen.apply(this,arguments);publish(app,{open:true,minimized:false,focus:true,effect:'open'});return result;
 };
 for(const name of ['minimizeIrosWindow','closeIrosWindow']){
  const base=window[name];window[name]=function(win){const result=base.apply(this,arguments),key=keyFor(win);if(key)publish(key,{open:false,minimized:name==='minimizeIrosWindow',...(name==='closeIrosWindow'?{maximized:false,effect:'close'}:{})});return result;};
 }
 // Capture precedes the existing button handlers, which stop event propagation.
 document.addEventListener('click',event=>{
  intent=true;setTimeout(()=>intent=false,0);
  const button=event.target.closest('[data-window-action="maximize"]'),key=keyFor(button?.closest('.iros-app-window'));
  if(key)setTimeout(()=>publish(key,{maximized:windows[key].classList.contains('maximized')}),0);
 },true);
 document.addEventListener('dblclick',()=>{intent=true;setTimeout(()=>intent=false,0);},true);
 function flush(){clearTimeout(timer);timer=0;for(const key of Object.keys(pending)){const patch=pending[key];delete pending[key];publish(key,patch);}}
 function moved(){if(!gesture)return;const win=windows[gesture.key];if(gesture.resize){const {w,h}=size();win.style.width=Math.max(330,Math.min(w,gesture.width+gesture.dx))+'px';win.style.height=Math.max(220,Math.min(h,gesture.height+gesture.dy))+'px';}pending[gesture.key]={rect:rectangle(win)};if(!timer)timer=setTimeout(flush,85);}
 document.addEventListener('pointerdown',event=>{
  const win=event.target.closest('.iros-app-window'),key=keyFor(win);if(!key||event.button!==0)return;
  if(!event.target.closest('[data-window-action]'))publish(key,{focus:true});
  const resize=!!event.target.closest('.shared-window-resize');
  if(!resize&&(!event.target.closest('.iros-titlebar')||event.target.closest('button')))return;
  if(win.classList.contains('maximized'))return;
  gesture={key,resize,x:event.clientX,y:event.clientY,width:win.offsetWidth,height:win.offsetHeight,dx:0,dy:0};
  if(resize){event.preventDefault();event.target.setPointerCapture?.(event.pointerId);}
 });
 document.addEventListener('pointermove',event=>{if(!gesture)return;gesture.dx=event.clientX-gesture.x;gesture.dy=event.clientY-gesture.y;moved();});
 for(const event of ['pointerup','pointercancel'])document.addEventListener(event,()=>{if(!gesture)return;moved();flush();gesture=null;});
 for(const win of Object.values(windows)){if(!win)continue;const grip=document.createElement('span');grip.className='shared-window-resize';grip.setAttribute('aria-hidden','true');win.append(grip);}
 const style=document.createElement('style');style.textContent='.shared-window-resize{position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:se-resize;z-index:5;background:repeating-linear-gradient(135deg,transparent 0 3px,#70877b 3px 4px)}.maximized>.shared-window-resize{display:none}';document.head.append(style);
 new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['data-iros-phase']});
 window.addEventListener('resize',render);
 rt.init().then(()=>{rt.onState('session',receive);const version=received;return rt.getState('session').then(value=>{if(received===version)receive(value);});}).catch(console.error);
})();
