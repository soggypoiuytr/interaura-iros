const assert=require('assert/strict'),{watch,message,completed,detected,valid}=require('../bot/discord-sync/implementation-notices.cjs');
(async()=>{
 const rows=new Map(),listeners=[],sent=[];let clock=1000;
 const db={ref:path=>({on:(_event,fn)=>listeners.push(fn),off(){},transaction:async fn=>{const next=fn(rows.get(path));if(next===undefined)return{committed:false};rows.set(path,next);return{committed:true};},set:async value=>rows.set(path,value)})};
 const config={enabled:true,room:'teste-firebase-2010',channelId:'1066907533622652979',guildId:'guild'};
 const client={channels:{fetch:async id=>{assert.equal(id,config.channelId);return{guildId:'guild',isTextBased:()=>true,send:async value=>{sent.push(value);return{id:'message'};}};}}};
 const stops=[watch({db,client,config,now:()=>clock,log:{log(){},error(){}}}),watch({db,client,config,now:()=>clock,log:{log(){},error(){}}})];
 const sample={id:'job',status:'implemented',module:'42',resultAt:1500};assert(completed(sample));assert(!completed({...sample,status:'implementing'}));assert(!valid({...config,room:'../public'}));
 for(const fn of listeners)fn({val:()=>({...sample,resultAt:900})});await new Promise(r=>setImmediate(r));assert.equal(sent.length,0);
 clock=2000;for(const fn of listeners)fn({val:()=>sample});await new Promise(r=>setImmediate(r));assert.equal(sent.length,1);assert.deepEqual(sent[0].allowedMentions,{parse:['everyone']});assert(sent[0].enforceNonce);
 for(const fn of listeners)fn({val:()=>sample});await new Promise(r=>setImmediate(r));assert.equal(sent.length,1);
 assert(message(sample).includes('@everyone'));assert(message(sample).includes('## +100 PONTOS PARA O NÍVEL DE ASSIMILAÇÃO'));assert(message(sample).indexOf('## +100 PONTOS')<message(sample).indexOf('```'));assert(message(sample).includes('100 PONTOS'));assert(!/experiência|discord|ficha/i.test(message(sample)));const ready={...sample,id:'scan',status:'detected',module:null};assert(detected(ready));for(const fn of listeners)fn({val:()=>ready});await new Promise(r=>setImmediate(r));assert.equal(sent.length,2);assert(sent[1].content.includes('PRONTA PARA IMPLEMENTAÇÃO'));assert(sent[1].content.includes('@everyone'));assert.deepEqual(sent[1].allowedMentions,{parse:['everyone']});for(const fn of listeners)fn({val:()=>ready});await new Promise(r=>setImmediate(r));assert.equal(sent.length,2);assert.notEqual(sent[0].nonce,sent[1].nonce);for(const stop of stops)stop();
 console.log('PASS: aviso único, duas instâncias sem duplicação, eventos antigos ignorados, canal configurado, @everyone autorizado, ganho de nível destacado e sem alteração automática de atributos.');
})().catch(error=>{console.error(error);process.exitCode=1});
