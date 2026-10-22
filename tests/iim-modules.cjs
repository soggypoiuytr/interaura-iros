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
 if(module==='06'){s.cryptum={status:'detected',id:'sample'};cmd('IMPLEMENT SAMPLE','remote-ask');assert(s.entries['remote-ask'].html.includes('CORPO DO MOD-06 AUSENTE'));assert.equal(s.cryptum.status,'detected');cmd('DISCONNECT','remote-disconnect');assert(!s.iim.mode);continue;}
 s.cryptum={status:'detected',id:'sample'};cmd('IMPLEMENT SAMPLE','ask');assert(s.entries.ask.html.includes('MOD-'+module));cmd('Y','yes');assert.equal(s.cryptum.module,module);
 s=m.reduce(s,{kind:'cryptum-destroy-complete',id:'done',at:s.cryptum.finishAt,requestId:'yes'});assert.equal(s.iim.lastImplementation.module,module);assert(s.entries.done.html.includes('HOSPEDEIRO: MOD-'+module));
 cmd('DISCONNECT','disconnect');assert(!s.iim.mode);cmd('IIM CONNECT MOD-99','unknown');assert(!s.request||s.request.status!=='pending');
}
console.log('PASS: seis hospedeiros, confirmação, STATUS isolado por módulo, bloqueio de troca, implementação corporal nos cinco hospedeiros presentes, armadura 06 e módulo desconhecido.');


{
 let s=m.initial();s.power={mode:'on',loginAt:1};s.iim={consoleOpen:true,mode:false};s.ocularModules={'06':{active:true,activatedAt:1}};let n=0;
 const op=(kind,data={})=>(s=m.reduce(s,{kind,id:'remote-check-'+(++n),at:20000+n,cable:true,target:'iim',clientId:'a',...data},(command,state)=>attrs.answer(command,state.iim.module,m.text))||s);
 op('command',{command:'IIM CONNECT MOD-06'});op('approval',{requestId:s.request.id,status:'approved'});
 const connected=s.entries['remote-check-'+n].html;
 assert(connected.includes('CONTROLE: CONSCIÊNCIA DO MOD-06 / REMOTO'));assert(connected.includes('CORPO DO HOSPEDEIRO: AUSENTE'));assert(!connected.includes('VASCULAR: ESTABELECIDO'));assert(!s.iim.ocular);assert(s.ocularModules['06'].active,'Stored implant state must not be erased');
 const alert=s.entries['remote-check-'+n+'-alert'].html;assert(alert.includes('INFLUÊNCIA SOBRE O ORGANISMO: NÃO AFERÍVEL'));assert(!alert.includes('Nenhuma matéria ou energia estranha foi localizada dentro do corpo'));
 op('command',{command:'STATUS'});const status=s.entries['remote-check-'+n].html;assert(status.includes('STATUS DA ARMADURA REMOTA'));assert(status.includes('SINAIS VITAIS DO HOSPEDEIRO: SEM LEITURA'));assert(!status.includes('VASCULAR: ESTABELECIDO'));
 const copy=JSON.parse(JSON.stringify(s));const a=m.reduce(s,{kind:'command',id:'same',at:25000,target:'iim',cable:true,command:'OCULAR'},()=>''),b=m.reduce(copy,{kind:'command',id:'same',at:25000,target:'iim',cable:true,command:'OCULAR'},()=>'' );assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
 s.cryptum={status:'detected',id:'retained'};s.iim.samplePrompts={a:{action:'implement',sampleId:'retained',module:'06'}};op('command',{command:'Y'});assert.equal(s.cryptum.status,'detected');assert(!s.iim.samplePrompts.a,'Stale implant confirmation must not bypass body absence');
 op('command',{command:'DESTROY SAMPLE'});assert.equal(s.iim.samplePrompts.a.action,'destroy','Local destruction remains available');op('command',{command:'N'});
 op('command',{command:'DISCONNECT'});assert(s.entries['remote-check-'+n].html.includes('VÍNCULO COM A ARMADURA REMOTA ENCERRADO'));assert(!s.iim.mode);
 const recordsCtx={window:{}};vm.createContext(recordsCtx);vm.runInContext(fs.readFileSync('site/iim-module-records.js','utf8'),recordsCtx);assert(recordsCtx.window.IIMModuleRecords.status('06').includes('OCUPANTE BIOLÓGICO LOCAL: NÃO DETECTADO'));
}
console.log('PASS: armadura MOD-06, corpo ausente, telemetria limitada, ocular antiga preservada sem leitura falsa, confirmação obsoleta bloqueada e respostas compartilhadas idênticas.');
