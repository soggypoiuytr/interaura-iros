'use strict';
const {createHash}=require('node:crypto');
function valid(config){return config?.enabled===true&&/^[a-zA-Z0-9_-]{1,60}$/.test(config.room)&&/^\d{17,22}$/.test(config.channelId);}
function completed(sample){return sample?.status==='implemented'&&/^[a-zA-Z0-9_-]{1,120}$/.test(sample.id)&&/^\d{2}(?:-\d+)?$/.test(sample.module)&&Number.isFinite(sample.resultAt);}
function detected(sample){return sample?.status==='detected'&&/^[a-zA-Z0-9_-]{1,120}$/.test(sample.id)&&Number.isFinite(sample.resultAt);}
function message(sample){if(detected(sample))return '## <:interaura:1561211829752172585> INTERAURA - AMOSTRA CRYPTUM DETECTADA @everyone\n`SERVIDOR INT-JP-04 - IROS 3.7.12`\n\n```\n> MATERIAL CRYPTUM IDENTIFICADO NO COMPARTIMENTO CRY-01.\n> TRAVA DE CONTENÇÃO: ACIONADA.\n> ESTADO DA AMOSTRA: PRONTA PARA IMPLEMENTAÇÃO.\n\n> AGUARDANDO INÍCIO DO PROTOCOLO IIM.\n```';return '## <:interaura:1561211829752172585> INTERAURA - IMPLEMENTAÇÃO CRYPTUM CONCLUÍDA @everyone\n`SERVIDOR INT-JP-04 - IROS 3.7.12`\n\n## +100 PONTOS PARA O NÍVEL DE ASSIMILAÇÃO\n**Ganho compartilhado: 100 pontos para a progressão de nível dos módulos.**\n\n```\n> AMOSTRA CRYPTUM TRANSFERIDA AO HOSPEDEIRO MOD-'+sample.module+'.\n> ASSIMILAÇÃO REGISTRADA: 100 PONTOS.\n> INTERFACE NEURAL: ESTABELECIDA.\n> COMPARTIMENTO CRY-01: VAZIO.\n> TRAVA DE CONTENÇÃO: LIBERADA.\n\n> IMPLEMENTAÇÃO CONCLUÍDA.\n> REGISTRO COMPARTILHADO ATUALIZADO.\n```';}
function watch({db,client,config,now=Date.now,log=console}){
 if(!valid(config)||!db)return()=>{};
 const startedAt=now(),ref=db.ref('irosRooms/'+config.room+'/state/session/cryptum'),pending=new Set(),timers=new Set();let stopped=false;
 async function deliver(sample){
  const eventId=(detected(sample)?'detected-':'')+sample.id;
  if(stopped||pending.has(eventId))return;pending.add(eventId);
  const receipt=db.ref('irosBot/implementationNotices/'+config.room+'/'+eventId);
  try{
   const claim=await receipt.transaction(old=>old?.status==='sent'||(old?.leaseUntil||0)>now()?undefined:{status:'sending',leaseUntil:now()+60000,at:sample.resultAt});
   if(!claim.committed)return;
   const channel=await client.channels.fetch(config.channelId);
   if(!channel?.isTextBased()||channel.guildId!==config.guildId)throw Error('Canal de teste indisponível.');
   const nonce=BigInt('0x'+createHash('sha256').update(config.room+':'+eventId).digest('hex').slice(0,16)).toString();
   const sent=await channel.send({content:message(sample),allowedMentions:{parse:['everyone']},nonce,enforceNonce:true});
   await receipt.set({status:'sent',messageId:sent.id,channelId:config.channelId,at:sample.resultAt,sentAt:now()});
   log.log('AVISO CRYPTUM ENVIADO // '+(detected(sample)?'AMOSTRA DETECTADA':'MOD-'+sample.module+' / 100 PONTOS')+' // SALA '+config.room);
  }catch(error){
   log.error('Aviso de implementação pendente ('+String(error.code||error.name)+').');
   if(!stopped){const timer=setTimeout(()=>{timers.delete(timer);deliver(sample);},65000);timers.add(timer);}
  }finally{pending.delete(eventId);}
 }
 function receive(snapshot){const sample=snapshot.val();if((completed(sample)||detected(sample))&&sample.resultAt>=startedAt)void deliver(sample);}
 ref.on('value',receive,error=>log.error('Não foi possível acompanhar implementações ('+String(error.code||error.name)+').'));
 return()=>{stopped=true;ref.off('value',receive);for(const timer of timers)clearTimeout(timer);};
}
module.exports={valid,completed,detected,message,watch};
