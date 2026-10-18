const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const all=JSON.parse(fs.readFileSync('database.rules.json','utf8')).rules;const old=JSON.parse(fs.readFileSync('tests/fixtures/sdai.rules.json','utf8')).rules;assert.deepEqual(all.rooms,old.rooms,'Preservar integralmente SDAI');
class Snap{constructor(v){this.v=v}child(k){return new Snap(this.v?.[k])}val(){return this.v??null}exists(){return this.v!==undefined&&this.v!==null}isString(){return typeof this.v==='string'}isNumber(){return typeof this.v==='number'}hasChildren(keys){return keys.every(k=>this.child(k).exists())}}
const now=100000,control={authUid:'a',clientId:'tab-a',heartbeat:now,playerName:'P',characterName:'Janel'},room={state:{control}};
function test(rule,{uid='a',before,next,master=false,state=room}={}){return vm.runInNewContext(rule,{auth:uid?{uid}:null,root:new Snap({irosRooms:{'int-jp-04':state},masters:master?{[uid]:true}:{}}),data:new Snap(before),newData:new Snap(next),now,$room:'int-jp-04',$uid:uid});}
const rules=all.irosRooms.$room;
assert(!test(rules.state.control['.write'],{uid:'b',before:control,next:{...control,authUid:'b',clientId:'tab-b'}}));
assert(!test(rules.state.control['.write'],{before:control,next:{...control,clientId:'tab-other'}}));
assert(test(rules.state.control['.write'],{before:control,next:{...control,heartbeat:now+1000}}));
assert(test(rules.state.control['.write'],{uid:'b',before:{...control,heartbeat:now-31000},next:{...control,authUid:'b',clientId:'tab-b'}}));
assert(test(rules.state.control['.write'],{uid:'gm',master:true,before:control,next:null}));
assert(!test(rules.state.control['.write'],{uid:'b',before:control,next:null}));
assert(test(rules.state.snapshot['.write']));assert(!test(rules.state.snapshot['.write'],{uid:'b'}));assert(!test(rules.state.snapshot['.write'],{state:{state:{control:{...control,heartbeat:now-31000}}}}));
for(const key of ['iimApproval','iimCable','settings']){assert(!test(rules.state[key]['.write']));assert(test(rules.state[key]['.write'],{uid:'gm',master:true}));}
assert(!test(rules.events.$event['.write'],{next:{type:'master-message'}}));assert(!test(rules.events.$event['.write'],{uid:'b',next:{type:'ui'}}));assert(test(rules.events.$event['.write'],{next:{type:'ui'}}));assert(test(rules.events.$event['.write'],{uid:'gm',master:true,next:{type:'master-message'}}));assert(!test(rules.events.$event['.write'],{before:{type:'ui'},next:{type:'ui'}}));
assert(!test(rules.state.history['.read']));assert(test(rules.state.history['.read'],{uid:'gm',master:true}));
console.log('PASS: regras SDAI preservadas; IROS: posse exclusiva, expiração, liberação do mestre, espectadores, IIM e histórico. Simulação de expressões, não emulador.');

