(function(){
 const room=(new URLSearchParams(location.search).get('sala')||window.INTERAURA_ROOM||'int-jp-04').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60)||'int-jp-04',base='irosRooms/'+room,clientId='cli-'+crypto.randomUUID();
 const channel=new BroadcastChannel('interaura-'+room),listeners=new Map(),stateListeners=new Map(),seen=new Set();
 let db=null,auth=null,ready=false,initPromise,offset=0,connected=true;
 const now=()=>Date.now()+offset;
 function emit(type,payload,event){if(seen.has(event.id))return;seen.add(event.id);if(seen.size>1000)seen.delete(seen.values().next().value);for(const fn of listeners.get(type)||[])fn(payload,event)}
 function notify(key,value){for(const fn of stateListeners.get(key)||[])fn(value)}
 channel.onmessage=e=>{if(ready)return;const m=e.data||{};if(m.kind==='event')emit(m.type,m.payload,m);else if(m.kind==='state')notify(m.key,m.value)};
 function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Não foi possível conectar ao Firebase.'));document.head.append(s)})}
 function init(){return initPromise ||= (async()=>{const cfg=window.INTERAURA_FIREBASE_CONFIG||{};if(new URLSearchParams(location.search).get('demo')==='1'||cfg.projectId==='SUBSTITUIR'||!cfg.projectId)return false;
 await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js');await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js');
 firebase.initializeApp(cfg);auth=firebase.auth();await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);await auth.signInAnonymously();db=firebase.database();ready=true;
 db.ref('.info/serverTimeOffset').on('value',s=>offset=s.val()||0);db.ref('.info/connected').on('value',s=>{connected=s.val()===true;notify('connection',connected)});
 db.ref(base+'/events').orderByChild('at').startAt(now()).on('child_added',s=>{const m=s.val();if(m)emit(m.type,m.payload,m)});
 for(const key of stateListeners.keys())subscribe(key);return true;})()}
 function subscribe(key){if(key==='connection'||key==='error')return;db.ref(base+'/state/'+key).on('value',s=>notify(key,s.val()),error=>notify('error',error.message))}
 async function send(type,payload){const event={id:crypto.randomUUID(),type,payload,at:now(),sender:clientId,authUid:auth?.currentUser?.uid||null};seen.add(event.id);if(ready){await db.ref(base+'/events/'+event.id).set(event);return}channel.postMessage({...event,kind:'event'});emit(type,payload,event)}
 async function setState(key,value){if(ready){await db.ref(base+'/state/'+key).set(value);return}const parts=key.split('/'),rootKey=parts.shift();let rootValue=value;if(parts.length){rootValue=await getState(rootKey)||{};let cursor=rootValue;for(const part of parts.slice(0,-1))cursor=cursor[part]||={};if(value===null)delete cursor[parts.at(-1)];else cursor[parts.at(-1)]=value;}localStorage.setItem('interaura_'+room+'_'+rootKey,JSON.stringify(rootValue));notify(rootKey,rootValue);if(parts.length)notify(key,value);channel.postMessage({kind:'state',key:rootKey,value:rootValue})}
 async function getState(key){if(ready)return(await db.ref(base+'/state/'+key).once('value')).val();try{const parts=key.split('/');let value=JSON.parse(localStorage.getItem('interaura_'+room+'_'+parts.shift())||'null');for(const part of parts)value=value?.[part];return value??null}catch{return null}}
 async function transaction(fn){if(ready){const r=await db.ref(base+'/state/control').transaction(fn);return r.committed?r.snapshot.val():null}return navigator.locks.request('iros-control-'+room,async()=>{const next=fn(await getState('control'));if(next===undefined)return null;await setState('control',next);return next})}
 async function claimControl(identity){const at=now();return transaction(c=>!c||at-(c.heartbeat||0)>30000||c.clientId===clientId?{...identity,clientId,authUid:auth?.currentUser?.uid||null,claimedAt:at,heartbeat:at}:undefined)}
 const renewControl=()=>transaction(c=>c?.clientId===clientId?{...c,heartbeat:now()}:undefined);
 const releaseControl=()=>transaction(c=>c?.clientId===clientId?null:undefined);
 const on=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)};
 const onState=(key,fn)=>{if(key==='connection'||key==='error'){if(!stateListeners.has(key))stateListeners.set(key,[]);stateListeners.get(key).push(fn);if(key==='connection')fn(connected);return;}if(!stateListeners.has(key)){stateListeners.set(key,[]);if(ready)subscribe(key)}stateListeners.get(key).push(fn);getState(key).then(fn).catch(e=>notify('error',e.message))};
 window.InterauraRealtime={room,clientId,init,send,setState,getState,claimControl,renewControl,releaseControl,on,onState,now,get connected(){return connected},get firebaseReady(){return ready},get db(){return db},get auth(){return auth}};
})();


