const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('site/cryptum-reader.js','utf8'),transition=code.slice(code.indexOf('function trayTransition('),code.indexOf('function render('));
function client(){
 const sounds=[],frames=[],timers=[];let notices=0;
 const c={traySnapshotReady:false,lastId:'',window:{IROSLocalCue:sound=>sounds.push(sound)},openSound:'open',closeSound:'close',frame:n=>frames.push(n),stop:()=>{timers.length=0;},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},showInformation:()=>notices++,panel:{classList:{add(){}}},document:{body:{classList:{add(){}}}}};
 vm.createContext(c);vm.runInContext(transition,c);
 return{c,sounds,frames,timers,get notices(){return notices;},apply:next=>c.trayTransition(next),finish(){for(const task of timers.splice(0).sort((a,b)=>a.ms-b.ms))task.fn();}};
}
for(const who of [client(),client()]){
 who.apply(undefined);assert.equal(who.sounds.length,0);
 who.apply({id:'first-open',status:'idle',tray:'open'});assert.deepEqual(who.sounds,['open']);assert.equal(who.frames.at(-1),1);assert(who.timers.some(t=>t.ms===850));who.finish();assert.equal(who.frames.at(-1),2);assert.equal(who.notices,1);
 who.apply({id:'first-open',status:'idle',tray:'open'});assert.equal(who.sounds.length,1);assert.equal(who.notices,1);
 who.apply({id:'close',status:'idle',tray:'closed'});assert.equal(who.sounds.at(-1),'close');who.finish();assert.equal(who.frames.at(-1),0);
}
const restored=client();restored.apply({id:'old-open',status:'idle',tray:'open'});assert.equal(restored.frames.at(-1),2);assert.equal(restored.sounds.length,0);assert.equal(restored.notices,0);
restored.apply({id:'fresh-close',status:'idle',tray:'closed'});assert.equal(restored.sounds.at(-1),'close');
assert(code.includes('renderRevision===revision'),'Leitura inicial atrasada não substitui uma ação nova');
console.log('PASS: primeira abertura toca som e aviso em dois clientes; restauração silenciosa, ações repetidas sem duplicação e leitura inicial obsoleta ignorada.');
