const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const source=fs.readFileSync('site/index.html','utf8');
const ctx={setTimeout,output:{classList:{add(){},remove(){}}},escapeHtml:s=>String(s).replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]))};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('const available ='),source.indexOf('const loginScreen='))+';globalThis.moduleRecords=records;globalThis.availableIds=[...available];globalThis.recoveringIds=[...recovering];',ctx);
vm.runInContext(source.slice(source.indexOf('function terminalText('),source.indexOf('const terminalAnswerNetwork=')),ctx);
const r=ctx.moduleRecords[4];assert.equal(r.status,'ATIVO');assert.equal(r.origem,'REPÚBLICA DA POLÔNIA');assert(!ctx.recoveringIds.includes(4));assert(ctx.availableIds.includes(4));
for(const id of ctx.availableIds){assert(!ctx.moduleRecords[id].placeholder);assert(fs.existsSync('site/'+ctx.moduleRecords[id].image));assert(!ctx.recoveringIds.includes(id));}
for(const command of ['MODULE 04','MODULE 4','MOD 04','MOD-04','MÓDULO-04']){const html=ctx.terminalAnswer(command);assert(html.includes('STATUS: ATIVO'));assert(html.includes(r.classe));assert(html.includes(r.compat));assert(html.includes('CONTEMPLADOR: KRYTUX'));assert(!html.includes('LOCALIZAÇÃO:'));}
for(const command of ['CELL 04','CELA 4']){const html=ctx.terminalAnswer(command);assert(html.includes('CERÂMICA REFRATÁRIA'));assert(html.includes('NÃO VERIFICADOS'));}
for(const command of ['SCAN 04','VARREDURA 4']){const html=ctx.terminalAnswer(command);assert(html.includes('ATIVIDADE ENCEFÁLICA CONVENCIONAL: AUSENTE'));assert(html.includes('ATIVIDADE DISTRIBUÍDA'));assert(html.includes('NENHUMA VARREDURA AO VIVO'));}
const status=ctx.terminalAnswer('STATUS');assert(status.includes(`${ctx.availableIds.length} DISPONÍVEIS / ${ctx.recoveringIds.length} EM RECUPERAÇÃO`));assert(status.includes('SUBREGISTRO DERIVADO: MOD-49-1'));assert(ctx.terminalAnswer('MODULE 11').includes('AINDA EM RECUPERAÇÃO'));
assert(ctx.terminalAnswer('MODULE 08').includes('terminal-death-status'));assert(ctx.terminalAnswer('SYNC').includes('19 ANOS'));assert(ctx.terminalAnswer('TIME').includes('19 ANOS + 9 MESES'));assert(ctx.terminalAnswer('KRYTUX').includes('EU AINDA ESTOU AQUI.'));
assert(ctx.moduleRecords[6].crime.startsWith('OPERADOR DA KHABAPOL'));assert(r.sequelas.includes('completo desespero'));assert(!r.desc.includes('futuro Módulo-06'));assert(!r.add.includes('VÍNCULO CONTEMPLADOR //'));assert(source.includes('uncertainSupervisorModules=new Set([4,'));
const storage=new Map(),channels=[],pending=new Map(),locks={request:async(k,fn)=>{const prior=pending.get(k)||Promise.resolve();let release;pending.set(k,new Promise(r=>release=r));await prior;try{return await fn()}finally{release()}}};
function client(){const c={window:{INTERAURA_FIREBASE_CONFIG:{projectId:'SUBSTITUIR'}},location:{search:'?demo=1'},URLSearchParams,crypto,Date,Map,Set,Promise,console,navigator:{locks},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},BroadcastChannel:class{constructor(){channels.push(this)}postMessage(data){for(const ch of channels)if(ch!==this)ch.onmessage?.({data})}}};vm.createContext(c);for(const f of ['realtime-core.js','shared-session.js'])vm.runInContext(fs.readFileSync('site/'+f,'utf8'),c);return {rt:c.window.InterauraRealtime,model:c.window.IROSSharedSession};}
(async()=>{const clients=[client(),client(),client()];await Promise.all(clients.map(c=>c.rt.init()));const apply=(c,op)=>c.rt.transact('session',s=>c.model.reduce(s,op,command=>ctx.terminalAnswer(command)));await apply(clients[0],{kind:'on',id:'on',at:1000});await apply(clients[0],{kind:'login',id:'login',at:2000});for(const [i,command] of ['MODULE 04','CELL 04','SCAN 04'].entries()){const id='mod04-'+i;await apply(clients[0],{kind:'command',id,command,at:3000+i,identity:{characterName:'Janel',playerName:'Thiago'}});const rows=await Promise.all(clients.map(c=>c.rt.getState('session')));for(const state of rows){assert.equal(state.entries[id].html,ctx.terminalAnswer(command));assert.equal(state.entries[id].by,'Janel');}}
console.log('PASS: lore e índices MOD-04, comandos/aliases, dados históricos, MOD-06 e respostas idênticas em três clientes locais.');})().catch(e=>{console.error(e);process.exitCode=1});


const record19=ctx.moduleRecords[19];assert(ctx.availableIds.includes(19));assert(!ctx.recoveringIds.includes(19));assert.equal(record19.origem,'REPÚBLICA FRANCESA');
for(const term of ['mercenária independente','recusou ingresso permanente','polícia francesa','Agentes da inteligência japonesa vinculados clandestinamente à Interaura'])assert(record19.desc.includes(term),term);
assert(record19.psych.includes('gritos'));assert(record19.psych.includes('não possuía familiares vivos'));assert(record19.psych.includes('memória autobiográfica'));
assert(source.includes('name:'+String.fromCharCode(39)+'DRA. MIREILLE VAUTRIN'));assert(!record19.add.includes('SUPERVISÃO CIENTÍFICA'));assert(!record19.add.includes('VÍNCULO CONTEMPLADOR'));assert(record19.add.includes('MOD-35'));assert(record19.add.includes('não comunicar a suspeita como fato confirmado'));
for(const command of ['MODULE 19','MOD 19','MOD-19','MÓDULO-19']){const result=ctx.terminalAnswer(command);assert(result.includes(record19.classe));assert(result.includes('CONTEMPLADOR: INCERTO'));assert(!result.includes('AINDA EM RECUPERAÇÃO'));}
for(const command of ['CELL 19','SCAN 19']){const result=ctx.terminalAnswer(command);assert(result.includes('HISTÓRICO')||result.includes('HISTÓRICOS'));assert(!result.includes('MÓDULO-04'));}
assert(ctx.terminalAnswer('STATUS').includes('10 DISPONÍVEIS / 4 EM RECUPERAÇÃO'));
const gallerySource=source.slice(source.indexOf('const showModuleBefore04Gallery='),source.indexOf('const renderModuleRecord='));
for(const id of [4]){
 const timers=[],image={classList:{remove(){},add(){}},offsetWidth:1},caption={setAttribute(){}},figure={querySelector:selector=>selector==='img'?image:caption,append:node=>figure.controls=node};
 const c={showModule(){},document:{querySelector:()=>figure,createElement:()=>({children:[{},{}],setAttribute(name,value){this[name]=value;}})},setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){}};
 vm.createContext(c);vm.runInContext(gallerySource,c);c.showModule(id);assert(image.src.includes('mod-'+String(id).padStart(2,'0')+'-admissao'));assert(figure.controls['aria-label'].includes('MOD-'+String(id).padStart(2,'0')));figure.controls.children[1].onclick();while(timers.length)timers.shift()();assert(image.src.includes('pos-manifestacao'));assert(caption.textContent.startsWith('02/02'));figure.controls.children[0].onclick();while(timers.length)timers.shift()();assert(image.src.includes('admissao'));
}
console.log('PASS: MOD-19 recuperada, passado mercenário independente, suspeita do MOD-35 sem confirmação, supervisora, terminal histórico e troca de retratos 04 e foto única pós-manifestação da MOD-19.');

assert(record19.psych.includes('curiosidade constante'));assert(record19.psych.includes('confusão sobre o que estava acontecendo'));assert.equal(record19.image,'assets/modules/mod-19-pos-manifestacao.webp');assert.equal(record19.photoDate,'17/04/1993');assert(!source.includes('mod-19-admissao.png'));assert(source.includes('REGISTRO PÓS-IMPLANTAÇÃO E MANIFESTAÇÃO // CAM-01 // 17/04/1993 - 09:16'));

{let called=0;const c={showModule(){called++},document:{querySelector(){throw Error("MOD-19 must not create photo gallery")}}};vm.createContext(c);vm.runInContext(gallerySource,c);c.showModule(19);assert.equal(called,1);}

assert(record19.desc.includes('As equipes policiais não tinham conhecimento da Interaura'));assert(record19.desc.includes('aproximação involuntária'));assert(record19.desc.includes('registros de transferência adulterados'));assert(!record19.desc.includes('custódia posterior foi ocultada por documentação de cooperação internacional'));

assert(record19.desc.includes('captura foi realizada pela polícia japonesa, sem operação conjunta com a polícia francesa'));assert(record19.desc.includes('por encomenda da Khabapol'));assert(record19.desc.includes('favorecer os interesses da organização'));


{
 const derivedSource=source.slice(source.indexOf('function derivedModuleDocument()'),source.indexOf('function showModule('));
 const c={};vm.createContext(c);vm.runInContext(derivedSource,c);const html=c.derivedModuleDocument();assert(html.includes('O olho esquerdo apresenta funcionamento normal'));assert(html.includes('visão residual de até aproximadamente oito metros'));assert(!html.includes('completamente destruído'));assert(!html.includes('olho restante apresenta foco severamente limitado'));
 const sharedCtx={window:{}};vm.createContext(sharedCtx);vm.runInContext(fs.readFileSync('site/shared-session.js','utf8'),sharedCtx);const ocular=sharedCtx.window.IROSSharedSession.ocularStatus('49-1',false);assert(ocular.includes('OLHO ESQUERDO: VISÃO NORMAL'));assert(ocular.includes('OLHO DIREITO: VISÃO RESIDUAL'));assert(!ocular.includes('ALCANCE VISUAL: APROXIMADAMENTE 8 METROS'));
 const mr={window:{}};vm.createContext(mr);vm.runInContext(fs.readFileSync('site/iim-module-records.js','utf8'),mr);mr.records={};mr.derivedModuleDocument=()=>html;mr.document={createElement:()=>({set innerHTML(value){this.content={querySelectorAll:()=>[],querySelector:()=>null,textContent:''}}})};const readings=mr.window.IIMModuleRecords.status('49-1');assert(readings.includes('OLHO ESQUERDO: VISÃO NORMAL'));assert(readings.includes('OLHO DIREITO: DANIFICADO / VISÃO RESIDUAL'));assert(!readings.includes('OLHO DIREITO: AUSENTE'));
 assert(!source.includes("portrait:'supervisor-naoko',since:'SUPERVISÃO PRIMÁRIA // 1992'"));assert(source.includes('RECUPERADOS / PARCIAIS'));
}
console.log('PASS: lore ocular 49-1 consistente entre prontuário, IIM e OCULAR; data de supervisão incerta e documentos parciais identificados.');
