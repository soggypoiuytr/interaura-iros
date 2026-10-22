const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const storage=new Map(),channels=[],queues=new Map();
const locks={request:async(key,fn)=>{const prior=queues.get(key)||Promise.resolve();let done;queues.set(key,new Promise(resolve=>done=resolve));await prior;try{return await fn()}finally{done()}}};
function client(){const c={window:{INTERAURA_FIREBASE_CONFIG:{projectId:'SUBSTITUIR'}},location:{search:'?demo=1&sala=shared-window-test'},URLSearchParams,crypto,Date,Map,Set,Promise,console,navigator:{locks},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},BroadcastChannel:class{constructor(){channels.push(this)}postMessage(data){for(const other of channels)if(other!==this)other.onmessage?.({data})}}};vm.createContext(c);for(const file of ['realtime-core.js','shared-session.js'])vm.runInContext(fs.readFileSync('site/'+file,'utf8'),c);return{rt:c.window.InterauraRealtime,model:c.window.IROSSharedSession};}
function desktop(client){
 const events={},make=()=>{const names=new Set();return{style:{},classList:{contains:x=>names.has(x),toggle:(x,on)=>on?names.add(x):names.delete(x),add:(...xs)=>xs.forEach(x=>names.add(x)),remove:(...xs)=>xs.forEach(x=>names.delete(x))},setAttribute(){},append(){},get offsetLeft(){return parseFloat(this.style.left)||100},get offsetTop(){return parseFloat(this.style.top)||80},get offsetWidth(){return parseFloat(this.style.width)||600},get offsetHeight(){return parseFloat(this.style.height)||400}};};
 const windows={iim:make(),cryptum:make()},ctx={console,setTimeout,clearTimeout,innerWidth:1200,innerHeight:840,Date,Math,InterauraRealtime:client.rt,IROSSharedSession:client.model,IROSTable:{isController:()=>true},MutationObserver:class{observe(){}},addEventListener(){},refreshTaskButtons(){},focusIrosWindow(){},document:{body:{dataset:{irosPhase:'desktop'}},head:{append(){}},createElement:make,querySelector:selector=>selector.includes('cryptum')?windows.cryptum:windows.iim,addEventListener:(type,fn)=>(events[type]||=[]).push(fn)}};
 ctx.window=ctx;ctx.openIrosApp=app=>{windows[app].classList.add('open');windows[app].classList.remove('minimized');};ctx.minimizeIrosWindow=win=>{win.classList.remove('open');win.classList.add('minimized');};ctx.closeIrosWindow=win=>win.classList.remove('open','minimized','maximized');
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('site/shared-iim-windows.js','utf8'),ctx);
 return{ctx,windows,click:fn=>{for(const handler of events.click||[])handler({target:{closest:()=>null}});fn();}};
}
(async()=>{
 const [a,b,c]=[client(),client(),client()];await Promise.all([a,b,c].map(x=>x.rt.init()));let id=0;
 const apply=(who,op)=>who.rt.transact('session',state=>who.model.reduce(state,{id:'operation-'+(++id),at:10000,...op},()=>''));
 await apply(a,{kind:'on',id:'epoch'});await apply(a,{kind:'login'});
 await apply(a,{kind:'command',command:'IIM CONNECT MOD-07',cable:true,id:'connect'});await apply(c,{kind:'approval',requestId:'connect',status:'approved'});
 const change=(who,app,patch,extra={})=>apply(who,{kind:'shared-window',app,patch,epoch:'epoch',token:'legacy',...extra});
 await change(a,'cryptum',{open:true,minimized:false});
 await Promise.all([change(a,'cryptum',{rect:{x:.2,y:.1,w:.5,h:.6}}),change(b,'iim',{open:true,maximized:true})]);
 let s=await c.rt.getState('session');assert.equal(s.sharedWindows.cryptum.rect.x,.2);assert(s.sharedWindows.iim.maximized);assert(s.sharedWindows.cryptum.open);
 await change(b,'cryptum',{open:false,minimized:true});assert((await a.rt.getState('session')).sharedWindows.cryptum.minimized);
 await change(c,'cryptum',{open:true,minimized:false});assert((await b.rt.getState('session')).sharedWindows.cryptum.open);
 const late=client();await late.rt.init();assert.equal(JSON.stringify((await late.rt.getState('session')).sharedWindows),JSON.stringify((await a.rt.getState('session')).sharedWindows));
 assert.equal(await change(a,'notes',{open:true}),null);assert.equal(await change(a,'iim',{open:false},{epoch:'old'}),null);assert.equal(await change(a,'iim',{open:false},{token:'old'}),null);
 await change(c,'iim',{open:false,minimized:false,maximized:false});s=await b.rt.getState('session');assert(!s.sharedWindows.iim.open);assert(s.iim.mode);assert(s.entries['approved']===undefined);
 const da=desktop(a),db=desktop(b);const settle=()=>new Promise(resolve=>setTimeout(resolve,25));await settle();
 da.click(()=>da.ctx.openIrosApp('iim'));await settle();assert(db.windows.iim.classList.contains('open'));
 db.ctx.minimizeIrosWindow(db.windows.iim);await settle();assert(da.windows.iim.classList.contains('minimized'));assert(!da.windows.iim.classList.contains('open'));
 await settle();da.ctx.openIrosApp('iim');await settle();assert(!db.windows.iim.classList.contains('open'),'restoration cannot reopen a minimized shared window');
 da.click(()=>da.ctx.openIrosApp('iim'));await settle();db.ctx.closeIrosWindow(db.windows.iim);await new Promise(resolve=>setTimeout(resolve,220));assert(!da.windows.iim.classList.contains('open'));
 await apply(a,{kind:'cable-off'});assert(!(await b.rt.getState('session')).sharedWindows);
 assert.equal(await change(c,'iim',{open:true}),null);
 const adapter=fs.readFileSync('site/shared-iim-windows.js','utf8');assert(adapter.includes('if(!intent&&saved)'));assert(adapter.includes('if(applying||!valid()'));assert(adapter.includes('setTimeout(flush,85)'));assert(adapter.includes('pointercancel'));
 console.log('PASS: três clientes, janelas compartilhadas, movimentos concorrentes, minimizar/reabrir/fechar, entrada tardia, sessão antiga rejeitada e limpeza ao remover cabo.');
})().catch(error=>{console.error(error);process.exitCode=1});
