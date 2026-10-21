'use strict';
const fs=require('node:fs'),path=require('node:path');const {selectSheet,moduleKey}=require('./sheet-parser.cjs');
async function main(){
 if(!process.env.DISCORD_BOT_TOKEN)throw Error('Token local não configurado.');
 const {Client,Events,GatewayIntentBits,ChannelType}=require('discord.js');const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});
 try{const ready=new Promise(resolve=>client.once(Events.ClientReady,resolve));await client.login(process.env.DISCORD_BOT_TOKEN);await ready;const guild=await client.guilds.fetch(process.env.DISCORD_GUILD_ID||'1065076970636980293'),channels=await guild.channels.fetch(),rows=[];
 for(const channel of channels.values()){
  if(!channel||channel.type!==ChannelType.GuildText||!channel.parent?.name.toUpperCase().includes('FICHAS')||channel.name==='ficha-base')continue;
  const messages=[];let before;while(messages.length<500){const batch=await channel.messages.fetch({limit:100,...(before?{before}:{})});if(!batch.size)break;messages.push(...batch.values());before=batch.last().id;if(batch.size<100)break;}
  const serialized=messages.filter(m=>!m.author.bot).map(m=>({id:m.id,authorId:m.author.id,content:m.content||'',bot:false})),modules=new Set();
  for(const m of serialized){for(const match of m.content.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[*_`>#]/g,'').matchAll(/(?:^|\n)\s*MODULO\s*[- ]?\s*(\d+(?:-\d+)?)\s*(?=\n|$)/gi))modules.add(moduleKey(match[1]));}
  const module=modules.size===1?[...modules][0]:null,result=module?selectSheet(serialized,{module}):{ok:false,reason:modules.size?'Mais de um módulo declarado.':'Número do módulo não encontrado.'};rows.push({channel:channel.name,channelId:channel.id,module,...result});
 }
 fs.writeFileSync(path.join(__dirname,'sheet-discovery.local.json'),JSON.stringify(rows,null,2)+'\n');for(const row of rows)console.log(JSON.stringify(row));
 }finally{client.destroy();}
}
if(require.main===module)main().catch(error=>{console.error('Não foi possível conferir fichas ('+String(error.code||error.name)+').');process.exitCode=1;});
