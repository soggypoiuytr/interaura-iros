const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('site/shared-session.js','utf8'),ctx);const m=ctx.window.IROSSharedSession,attrs=require('../site/character-attributes.js');
for(const module of ['06','07','11','42','49-1','67']){
 let s=m.initial(),clock=100;s.power={mode:'on',loginAt:1};s.iim={consoleOpen:true,mode:false,ocular:false};
 const cmd=(c,id)=>s=m.reduce(s,{kind:'command',id,at:clock++,command:c,target:'iim',cable:true,clientId:'a'},(command,state)=>attrs.answer(command,state.iim.module,m.text));
 cmd('IIM CONNECT MOD-'+module,'connect');assert.equal(s.request.module,module);assert(!s.iim.mode);
 s=m.reduce(s,{kind:'approval',id:'approval',at:clock++,requestId:'connect',status:'approved'});assert.equal(s.iim.module,module);assert(s.iim.mode);assert(s.entries.approval.html.includes('HOSPEDEIRO CONFIRMADO: MOD-'+module));
 assert(s.entries['approval-scan'].html.includes('VARREDURA COMPLEMENTAR INICIADA'));assert(s.entries['approval-alert'].html.includes('INTERFERÊNCIA AURÍTICA EXTERNA'));assert.equal(s.entries['approval-scan'].at-s.entries.approval.at,6200);assert.equal(s.entries['approval-alert'].at-s.entries.approval.at,10500);if(module!=='07')assert(!s.entries.approval.html.includes('99,81'));
 attrs.set({[module]:{status:'synced',attributes:{remaining:0,body:9,mind:2,reflex:1,influence:3,energy:4}}});cmd('STATUS','status');assert(s.entries.status.html.includes('CORPO - Força e Vigor: 9'));assert.equal(s.entries.status.module,module);
 cmd('IIM CONNECT MOD-11','busy');assert(s.entries.busy.html.includes('DISCONNECT'));assert.equal(s.iim.module,module);
 s.cryptum={status:'detected',id:'sample'};cmd('IMPLEMENT SAMPLE','ask');assert(s.entries.ask.html.includes('MOD-'+module));cmd('Y','yes');assert.equal(s.cryptum.module,module);
 s=m.reduce(s,{kind:'cryptum-destroy-complete',id:'done',at:s.cryptum.finishAt,requestId:'yes'});assert.equal(s.iim.lastImplementation.module,module);assert(s.entries.done.html.includes('HOSPEDEIRO: MOD-'+module));
 cmd('DISCONNECT','disconnect');assert(!s.iim.mode);cmd('IIM CONNECT MOD-99','unknown');assert(!s.request||s.request.status!=='pending');
}
console.log('PASS: seis hospedeiros, confirmação, STATUS isolado por módulo, bloqueio de troca, implementação correta e módulo desconhecido.');
