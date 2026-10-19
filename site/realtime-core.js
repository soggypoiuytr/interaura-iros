(function(){
 const room=(new URLSearchParams(location.search).get('sala')||window.INTERAURA_ROOM||'int-jp-04').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60)||'int-jp-04',base='irosRooms/'+room,clientId='cli-'+crypto.randomUUID();
 const channel=new BroadcastChannel('interaura-'+room),listeners=new Map(),stateListeners=new Map(),seen=new Set();
 let db=null,auth=null,ready=false,initPromise,offset=0,connected=true,discreet=false,presenceCycle=null,departure=null;
 const now=()=>Date.now()+offset;
 function emit(type,payload,event){if(seen.has(event.id))return;seen.add(event.id);if(seen.size>1000)seen.delete(seen.values().next().value);for(const fn of listeners.get(type)||[])fn(payload,event)}
 function notify(key,value){for(const [path,callbacks] of stateListeners){if(path!==key&&!path.startsWith(key+'/'))continue;let next=value;for(const part of path.slice(key.length+1).split('/').filter(Boolean))next=next?.[part];for(const fn of callbacks)fn(next??null)}}
 channel.onmessage=e=>{if(ready)return;const m=e.data||{};if(m.kind==='event')emit(m.type,m.payload,m);else if(m.kind==='state')notify(m.key,m.value)};
 function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Não foi possível conectar ao Firebase.'));document.head.append(s)})}
 function init(){return initPromise ||= (async()=>{const cfg=window.INTERAURA_FIREBASE_CONFIG||{};if(new URLSearchParams(location.search).get('demo')==='1'||cfg.projectId==='SUBSTITUIR'||!cfg.projectId)return false;
 await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js');await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js');
 firebase.initializeApp(cfg);auth=firebase.auth();await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);await auth.signInAnonymously();db=firebase.database();ready=true;
 db.ref('.info/serverTimeOffset').on('value',s=>offset=s.val()||0);db.ref('.info/connected').on('value',s=>{connected=s.val()===true;if(!connected)presenceCycle=null;notify('connection',connected)});
 db.ref(base+'/events').orderByChild('at').startAt(now()).on('child_added',s=>{const m=s.val();if(m)emit(m.type,m.payload,m)});
 window.addEventListener?.('pagehide',()=>{if(departure&&cfg.databaseURL){const stamp=firebase.database.ServerValue.TIMESTAMP,patch={};if(!departure.private)patch['participants/'+clientId]={...departure.value,online:false,at:stamp};patch['history/'+departure.leaveId]={...departure.leave,at:stamp};fetch(cfg.databaseURL.replace(/\/$/,'')+'/'+base+'/state.json?auth='+encodeURIComponent(departure.token),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch),keepalive:true}).catch(()=>{});}db.goOffline();});window.addEventListener?.('pageshow',e=>{if(e.persisted)db.goOnline()});for(const key of stateListeners.keys())subscribe(key);return true;})()}
 function subscribe(key){if(key==='connection'||key==='error')return;db.ref(base+'/state/'+key).on('value',s=>notify(key,s.val()),error=>notify('error',error.message))}
 async function send(type,payload){const event={id:crypto.randomUUID(),type,payload,at:now(),sender:clientId,authUid:auth?.currentUser?.uid||null};seen.add(event.id);if(ready){await db.ref(base+'/events/'+event.id).set(event);return}channel.postMessage({...event,kind:'event'});emit(type,payload,event)}
 function readLocal(key){try{return JSON.parse(localStorage.getItem("interaura_"+room+"_"+key)||"null")}catch{return null}}
 async function setState(key,value){if(ready){await db.ref(base+'/state/'+key).set(value);return}const parts=key.split('/'),rootKey=parts.shift();let rootValue=value;if(parts.length){rootValue=readLocal(rootKey)||{};let cursor=rootValue;for(const part of parts.slice(0,-1))cursor=cursor[part]||={};if(value===null)delete cursor[parts.at(-1)];else cursor[parts.at(-1)]=value;}localStorage.setItem('interaura_'+room+'_'+rootKey,JSON.stringify(rootValue));notify(rootKey,rootValue);channel.postMessage({kind:'state',key:rootKey,value:rootValue})}
 async function getState(key){if(ready)return(await db.ref(base+'/state/'+key).once('value')).val();try{const parts=key.split('/');let value=JSON.parse(localStorage.getItem('interaura_'+room+'_'+parts.shift())||'null');for(const part of parts)value=value?.[part];return value??null}catch{return null}}
 async function transact(key,fn){if(ready){const r=await db.ref(base+'/state/'+key).transaction(fn,undefined,false);return r.committed?r.snapshot.val():null}return navigator.locks.request('iros-'+room+'-'+key,async()=>{const next=fn(await getState(key));if(next===undefined)return null;await setState(key,next);return next})}
 const on=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)};
 const onState=(key,fn)=>{if(key==='connection'||key==='error'){if(!stateListeners.has(key))stateListeners.set(key,[]);stateListeners.get(key).push(fn);if(key==='connection')fn(connected);return;}const first=!stateListeners.has(key);if(first)stateListeners.set(key,[]);stateListeners.get(key).push(fn);if(ready){if(first)subscribe(key);}else getState(key).then(fn).catch(e=>notify('error',e.message));};
 async function enableDiscreet(email,password){if(!ready)throw Error("O modo discreto exige conexão com o Firebase.");try{await auth.signInWithEmailAndPassword(email,password);const allowed=(await db.ref("masters/"+auth.currentUser.uid).once("value")).val()===true;if(!allowed)throw Error("Conta sem autorização de mestre.");discreet=true;presenceCycle=null;}catch(error){discreet=false;await auth.signInAnonymously();throw Error("Não foi possível autorizar a conta de mestre.");}}
 async function setPresence(identity){
  const value={...identity,clientId,authUid:auth?.currentUser?.uid||null,online:true,at:now()};
  const first=!presenceCycle;if(first)presenceCycle={joinId:crypto.randomUUID(),leaveId:crypto.randomUUID()};
  const cycle=presenceCycle;value.leaveId=cycle.leaveId;const actor={playerName:identity.playerName,characterName:identity.characterName,clientId,authUid:value.authUid};
  const join={...actor,at:now(),text:'CONECTOU-SE À CREDENCIAL IROS',kind:'connection'},leave={...actor,at:now(),text:'DESCONECTOU-SE DA CREDENCIAL IROS',kind:'disconnection'};
  if(ready){
   departure={value,leave,private:discreet,leaveId:cycle.leaveId,token:await auth.currentUser.getIdToken()};if(discreet){if(first){await db.ref(base+'/state/history/'+cycle.leaveId).onDisconnect().set({...leave,at:firebase.database.ServerValue.TIMESTAMP});await db.ref(base+'/state/history/'+cycle.joinId).set(join);}return;}const ref=db.ref(base+'/state/participants/'+clientId);
   await ref.onDisconnect().set({...value,online:false,at:firebase.database.ServerValue.TIMESTAMP});
   if(first)await db.ref(base+'/state/history/'+cycle.leaveId).onDisconnect().set({...leave,at:firebase.database.ServerValue.TIMESTAMP});
   await ref.set(value);
   if(first)await db.ref(base+'/state/history/'+cycle.joinId).set(join);
  }else{
   await setState('participants/'+clientId,value);
   if(first){await setState('history/'+cycle.joinId,join);window.addEventListener?.('pagehide',()=>{setState('participants/'+clientId,{...value,online:false,at:now()});setState('history/'+cycle.leaveId,{...leave,at:now()});},{once:true});}
  }
 }

 window.InterauraRealtime={room,clientId,init,enableDiscreet,get discreet(){return discreet},transact,setPresence,send,setState,getState,on,onState,now,get connected(){return connected},get firebaseReady(){return ready},get db(){return db},get auth(){return auth}};
})();


