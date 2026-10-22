'use strict';
const fs=require('node:fs'),path=require('node:path');
const {selectSheet,moduleKey}=require('./sheet-parser.cjs');
function readConfig(file){const config=JSON.parse(fs.readFileSync(file,'utf8'));if(!/^\d{17,22}$/.test(config.guildId)||!/^[a-zA-Z0-9_-]{1,60}$/.test(config.room)||!Array.isArray(config.channels)||!config.channels.length)throw Error('Configuração de servidor, sala ou canais inválida.');const channels=new Set(),modules=new Set();for(const channel of config.channels){channel.module=moduleKey(channel.module);if(!/^\d{17,22}$/.test(channel.channelId)||channels.has(channel.channelId)||modules.has(channel.module))throw Error('Canal ou módulo duplicado/inválido. Corrija o mapeamento antes de iniciar.');for(const ids of [channel.messageIds||[],channel.authorIds||[]])if(!Array.isArray(ids)||ids.some(id=>!/^\d{17,22}$/.test(id)))throw Error('IDs de mensagens/autores inválidos.');channels.add(channel.channelId);modules.add(channel.module);}config.historyLimit=Math.min(1000,Math.max(100,Number(config.historyLimit)||500));config.pollSeconds=Math.max(60,Number(config.pollSeconds)||120);return config;}
async function start(){
 const config=readConfig(path.resolve(__dirname,process.env.IROS_DISCORD_CONFIG||'config.json'));
 if(!process.env.DISCORD_BOT_TOKEN)throw Error('Defina DISCORD_BOT_TOKEN no .env local. Não coloque o token no site.');
 const dryRun=process.argv.includes('--dry-run')||process.env.DRY_RUN!=='false';
 const {Client,Events,GatewayIntentBits,Partials}=require('discord.js');
 let db;if(!dryRun){const {initializeApp,applicationDefault}=require('firebase-admin/app');const {getDatabase}=require('firebase-admin/database');if(!process.env.FIREBASE_DATABASE_URL)throw Error('Defina FIREBASE_DATABASE_URL.');db=getDatabase(initializeApp({credential:applicationDefault(),databaseURL:process.env.FIREBASE_DATABASE_URL}));}
 const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent],partials:[Partials.Message,Partials.Channel]});
 const mapping=new Map(config.channels.map(c=>[c.channelId,c])),queues=new Map(),timers=new Map(),hashes=new Map();let closing=false;
 async function fetchSheet(channel,entry){
  if(entry.messageIds?.length){const messages=[];for(const id of entry.messageIds){try{messages.push(await channel.messages.fetch(id));}catch(error){if(error.code===10008)return {ok:false,reason:'Mensagem de ficha excluída.'};throw error;}}return selectSheet(messages.map(serialize),entry);}
  const messages=[];let before;while(messages.length<config.historyLimit){const batch=await channel.messages.fetch({limit:Math.min(100,config.historyLimit-messages.length),...(before?{before}:{})});if(!batch.size)break;messages.push(...batch.values());before=batch.last().id;if(batch.size<100)break;}
  return selectSheet(messages.map(serialize),entry);
 }
 const serialize=m=>({id:m.id,authorId:m.author.id,bot:m.author.bot,content:m.content||''});
 async function sync(entry){
  let result;try{const channel=await client.channels.fetch(entry.channelId);if(!channel||channel.guildId!==config.guildId||!channel.isTextBased()||!channel.messages)throw Error('Canal ausente ou de outro servidor.');result=await fetchSheet(channel,entry);}catch(error){console.error('MOD-'+entry.module+' // leitura indisponível ('+String(error.code||error.name)+').');return;}
  const payload=result.ok?{status:'synced',attributes:result.attributes,assimilationLevel:result.assimilationLevel,source:{channelId:entry.channelId,messageIds:result.messageIds}}:{status:'unavailable',reason:result.reason,source:{channelId:entry.channelId}};
  const hash=JSON.stringify(payload);if(hashes.get(entry.module)===hash)return;
  if(!dryRun)await db.ref('irosRooms/'+config.room+'/state/settings/characterAttributes/'+entry.module).set({...payload,syncedAt:Date.now()});
  hashes.set(entry.module,hash);console.log((dryRun?'SIMULAÇÃO':'SINCRONIZADO')+' // MOD-'+entry.module+' // '+(result.ok?JSON.stringify(result.attributes):result.reason));
 }
 function schedule(channelId,delay=600){if(closing||!mapping.has(channelId))return;clearTimeout(timers.get(channelId));timers.set(channelId,setTimeout(()=>{timers.delete(channelId);const previous=queues.get(channelId)||Promise.resolve();const next=previous.catch(()=>{}).then(()=>sync(mapping.get(channelId))).catch(error=>console.error('Falha ao sincronizar MOD-'+mapping.get(channelId).module+' ('+String(error.code||error.name)+').'));queues.set(channelId,next);},delay));}
 client.on(Events.MessageCreate,m=>{if(m.guildId===config.guildId)schedule(m.channelId);});
 client.on(Events.MessageUpdate,(_old,m)=>schedule(m.channelId));
 client.on(Events.MessageDelete,m=>schedule(m.channelId));
 client.on(Events.MessageBulkDelete,messages=>{for(const m of messages.values())schedule(m.channelId);});
 client.on(Events.Error,error=>console.error('Discord indisponível ('+String(error.code||error.name)+').'));
 let stopNotices=()=>{};let poll;client.once(Events.ClientReady,async()=>{if(!dryRun&&!process.argv.includes('--once'))stopNotices=require('./implementation-notices.cjs').watch({db,client,config:{...config.implementationNotices,guildId:config.guildId}});console.log('BOT DE ATRIBUTOS IROS // '+(dryRun?'SIMULAÇÃO - SEM ESCRITA':'DISCORD → IROS'));if(process.argv.includes('--once')){try{for(const entry of config.channels)await sync(entry);}catch(error){console.error('Falha ao conferir fichas ('+String(error.code||error.name)+').');process.exitCode=1;}finally{await shutdown();}return;}for(const entry of config.channels)schedule(entry.channelId,0);poll=setInterval(()=>{for(const entry of config.channels)schedule(entry.channelId,0);},config.pollSeconds*1000);});
 async function shutdown(){closing=true;stopNotices();clearInterval(poll);for(const timer of timers.values())clearTimeout(timer);client.destroy();await Promise.allSettled(queues.values());if(db)await db.app.delete();}
 process.once('SIGINT',shutdown);process.once('SIGTERM',shutdown);
 await client.login(process.env.DISCORD_BOT_TOKEN);
}
if(require.main===module)start().catch(error=>{console.error(error.code?'Falha de inicialização ('+error.code+').':error.message);process.exitCode=1;});
module.exports={readConfig};
