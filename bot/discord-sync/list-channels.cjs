'use strict';
const fs=require('node:fs'),path=require('node:path');
async function main(){
 const token=process.env.DISCORD_BOT_TOKEN,guildId=process.env.DISCORD_GUILD_ID||'1065076970636980293';
 if(!token)throw Error('Defina DISCORD_BOT_TOKEN no arquivo .env local. Não envie o token pelo chat.');
 if(!/^\d{17,22}$/.test(guildId))throw Error('ID do servidor inválido.');
 const {Client,Events,GatewayIntentBits,ChannelType,PermissionFlagsBits}=require('discord.js');
 const client=new Client({intents:[GatewayIntentBits.Guilds]});
 try{
  const ready=new Promise(resolve=>client.once(Events.ClientReady,resolve));await client.login(token);await ready;
  const guild=await client.guilds.fetch(guildId),channels=await guild.channels.fetch();
  const rows=[...channels.values()].filter(channel=>channel&&[ChannelType.GuildText,ChannelType.GuildForum].includes(channel.type)&&channel.permissionsFor(client.user)?.has(PermissionFlagsBits.ViewChannel)).map(channel=>({name:channel.name,category:channel.parent?.name||'(sem categoria)',channelId:channel.id,type:channel.type===ChannelType.GuildForum?'forum':'texto',link:'https://discord.com/channels/'+guildId+'/'+channel.id})).sort((a,b)=>a.category.localeCompare(b.category,'pt-BR')||a.name.localeCompare(b.name,'pt-BR'));
  console.log('\nCANAIS VISÍVEIS AO BOT // '+guild.name+'\n');console.table(rows.map(row=>({categoria:row.category,canal:row.name,tipo:row.type,id:row.channelId})));
  const output=path.join(__dirname,'channel-inventory.local.json');fs.writeFileSync(output,JSON.stringify({guildId,channels:rows},null,2)+'\n');console.log('Lista salva em '+output+'\nNenhuma mensagem foi enviada ao Discord.');
 }finally{client.destroy();}
}
if(require.main===module)main().catch(error=>{console.error(error.code?'Não foi possível listar os canais ('+error.code+').':error.message);process.exitCode=1;});
