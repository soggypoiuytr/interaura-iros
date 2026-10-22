window.IROS_IIM_TEXT={"connected":"RESPOSTA DA UNIDADE IIM RECEBIDA.\n\nIDENTIDADE DECLARADA: MOD-07\nASSINATURA BIOMÉTRICA: COMPATÍVEL\nMALHA CRYPTUM: RECONHECIDA\nMARCA DE VÍNCULO: PRESENTE\nCONTEMPLADOR: INCERTO\nCORRESPONDÊNCIA MODULAR: 99,81%\n\nACOPLAMENTO VASCULAR: ESTABELECIDO\nINTERFACE NEURAL: ESTABELECIDA\nINTERFACE OCULAR: DORMENTE\n\nHOSPEDEIRO CONFIRMADO: MOD-07\nDigite HELP para consultar os comandos da IIM.","scan":"VARREDURA COMPLEMENTAR INICIADA.\nANALISANDO RESSONÂNCIA FORA DO PERÍMETRO CORPORAL...","alert":"VARREDURA COMPLEMENTAR CONCLUÍDA.\n\nALERTA // INTERFERÊNCIA AURÍTICA EXTERNA\n\nA IIM detectou uma assinatura energética que não pertence ao módulo, à malha Cryptum implantada ou ao Contemplador registrado.\n\nA fonte permanece fora do organismo, porém exerce influência mensurável sobre sua atividade neural, suas manifestações auríticas e seus processos de adaptação biológica. Nenhuma matéria ou energia estranha foi localizada dentro do corpo.\n\nORIGEM EXTERNA: NÃO LOCALIZADA\nDISTÂNCIA: INDETERMINADA\nINTENÇÃO: NÃO DETERMINADA\nRECOMENDAÇÃO: MANTER MONITORAMENTO DURANTE TODA A CONEXÃO.","ocular":"INICIANDO REATIVAÇÃO OCULAR // MOD-07\n\nENERGIZANDO MICROPROCESSADORES... OK\nREABRINDO CANAL DO NERVO ÓPTICO... OK\nSINCRONIZANDO UNIDADE ESQUERDA... OK\nSINCRONIZANDO UNIDADE DIREITA... OK\nCARREGANDO SOBREPOSIÇÃO TÁTICA... OK\nINICIALIZANDO VOZ INTERNA... OK\n\nINTERFACE OCULAR REATIVADA.\nA MOD-07 PODE APRESENTAR DESORIENTAÇÃO DURANTE OS PRIMEIROS MINUTOS."};
(function(root){
 'use strict';
 const remoteArmor={"connected":"RESPOSTA DA UNIDADE IIM RECEBIDA.\n\nIDENTIDADE DECLARADA: MOD-06\nUNIDADE ACOPLADA: ARMADURA REMOTA\nCONTROLE: CONSCIÊNCIA DO MOD-06 / REMOTO\nCORPO DO HOSPEDEIRO: AUSENTE\n\nACOPLAMENTO VASCULAR: NÃO ESTABELECIDO\nINTERFACE DE CONTROLE: RESPONSIVA\nTELEMETRIA BIOLÓGICA: INDISPONÍVEL\nINTERFACE OCULAR DO HOSPEDEIRO: SEM LEITURA\n\nHOSPEDEIRO CONFIRMADO: MOD-06 / VÍNCULO REMOTO\nDigite STATUS para consultar a armadura.","scan":"VARREDURA COMPLEMENTAR INICIADA.\nANALISANDO RESSONÂNCIA NO PERÍMETRO DA ARMADURA...","alert":"VARREDURA COMPLEMENTAR CONCLUÍDA.\n\nALERTA // INTERFERÊNCIA AURÍTICA EXTERNA\n\nUNIDADE LOCAL: ARMADURA REMOTA\nCONTROLE CONSCIENTE: MOD-06\nCORPO DO HOSPEDEIRO: AUSENTE\n\nRESSONÂNCIA EXTERNA: DETECTADA\nORIGEM DA INTERFERÊNCIA: NÃO LOCALIZADA\nINFLUÊNCIA SOBRE O ORGANISMO: NÃO AFERÍVEL POR ESTA CONEXÃO\n\nA leitura está limitada à armadura e ao vínculo de controle. A ausência de sinais vitais locais não confirma óbito do hospedeiro.\nRECOMENDAÇÃO: MANTER MONITORAMENTO DO VÍNCULO REMOTO.","ocular":"INTERFACE OCULAR // MOD-06\n\nUNIDADE ACOPLADA: ARMADURA REMOTA\nCORPO DO HOSPEDEIRO: AUSENTE\nUNIDADE ESQUERDA: SEM LEITURA\nUNIDADE DIREITA: SEM LEITURA\nVISÃO BIOLÓGICA: NÃO AFERÍVEL\n\nA conexão com a armadura não permite determinar o estado dos implantes oculares do hospedeiro.","ocularDenied":"REATIVAÇÃO OCULAR INDISPONÍVEL NESTA CONEXÃO.\nA IIM ESTÁ ACOPLADA À ARMADURA REMOTA.\nO CORPO DO MOD-06 NÃO ESTÁ PRESENTE.\nNENHUMA ALTERAÇÃO FOI APLICADA AOS IMPLANTES DO HOSPEDEIRO.","implantDenied":"IMPLEMENTAÇÃO INDISPONÍVEL // CORPO DO MOD-06 AUSENTE.\nUNIDADE ACOPLADA: ARMADURA REMOTA\nACOPLAMENTO VASCULAR: NÃO ESTABELECIDO\n\nO vínculo de controle não constitui um canal de transferência da amostra ao organismo.\nA AMOSTRA PERMANECE NO COMPARTIMENTO."};
 const initial=()=>({version:2,seq:0,power:{mode:'off',epoch:'initial',at:0},iim:{mode:false,ocular:false},recover:0,entries:{}});
 const text=(value,type='data')=>'<pre class="terminal-response '+type+'" data-revealed="true">'+String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</pre>';
 function ocularStatus(module,active){if(module==='06')return remoteArmor.ocular;const state=active?'ATIVA':'DORMENTE',single=module==='49-1';return 'INTERFACE OCULAR BIOAURÍTICA\n\nUNIDADE ESQUERDA: '+state+'\nUNIDADE DIREITA: '+(single?'DANIFICADA / SEM INTERFACE FUNCIONAL':state)+'\n'+(single?'UNIDADES OCULARES BIÔNICAS FUNCIONAIS: 1\nOLHO ESQUERDO: VISÃO NORMAL\nOLHO DIREITO: VISÃO RESIDUAL ATÉ APROXIMADAMENTE 8 METROS':'VISÃO BIOLÓGICA: FUNCIONAL')+'\nSOBREPOSIÇÃO TÁTICA: '+(active?'DISPONÍVEL':'INATIVA')+'\nLEITURA AURÍTICA: '+(active?'DISPONÍVEL':'INATIVA')+'\nVOZ INTERNA: '+(active?'INICIALIZADA':'INATIVA')+'\nTRANSMISSÃO PARA IIM: '+(active?'ATIVA':'INATIVA')+'\n\n'+(active?'PRIMEIRA CALIBRAÇÃO PÓS-INCIDENTE CONCLUÍDA.':'A interface não responde desde 29/12/1999.\nUtilize OCULAR ACTIVATE para iniciar a reativação individual.');}
 function channelMessage(command){const match=String(command).trim().match(/^SAY\s+TO\s+(KRYTUX|KHYRENTUK)(?:\s+([\s\S]*))?$/i);return match?{channel:match[1].toUpperCase(),message:(match[2]||'').trim()}:null;}
 function validRequest(m){return !!m&&/^[a-zA-Z0-9_-]{1,100}$/.test(m.id)&&['KRYTUX','KHYRENTUK'].includes(m.channel)&&typeof m.message==='string'&&m.message.trim().length>0&&m.message.length<=500&&Number.isFinite(m.at);}
 function isSpontaneous(reply){return reply?.spontaneous===true||!String(reply?.message||'').trim();}
 function replyEntry(id,reply){if(!reply||!['KRYTUX','KHYRENTUK'].includes(reply.channel)||typeof reply.text!=='string'||!Number.isFinite(reply.at))return null;const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const from=reply.characterName||reply.playerName||'SESSÃO REMOTA',kind=reply.channel==='KHYRENTUK'?'khyrentuk':'secret';return {id:'channel-'+id,at:reply.at,seq:0,channel:reply.channel,html:'<section class="channel-thread">'+(isSpontaneous(reply)?'<pre class="channel-question">CANAL '+esc(reply.channel)+' // TRANSMISSÃO RECEBIDA</pre>':'<pre class="channel-question">CANAL '+esc(reply.channel)+' // RESPOSTA RECEBIDA\nREFERÊNCIA: MSG-'+esc(String(id).slice(0,8).toUpperCase())+'\nEM RESPOSTA A: '+esc(from)+'\nMENSAGEM ORIGINAL:\n&gt; '+esc(reply.message)+'</pre>')+text(reply.channel+' > '+reply.text,kind)+'</section>'};}
 function replyEntries(replies,session){const clearAt=Math.max(session?.power?.at||0,...Object.values(session?.entries||{}).filter(e=>e.command?.toUpperCase()==='CLEAR'&&e.target!=='iim').map(e=>e.at));const result={};for(const [id,reply] of Object.entries(replies||{})){if(reply.epoch!==session?.power?.epoch||reply.at<clearAt)continue;const entry=replyEntry(id,reply);if(entry)result[entry.id]=entry;}return result;}
 root.IROSChannelMail={parse:channelMessage,validRequest,isSpontaneous,replyEntry,replyEntries};
 function reduce(current,op,answer){
  const s=JSON.parse(JSON.stringify(current||initial()));
  s.entries ||= {};s.iim ||= {mode:false,ocular:false};
  const host=()=>s.iim.module||'07',supported=['06','07','11','42','49-1','67'];
  const text=(value,type='data')=>root.IROSSharedSession.text(String(value).replaceAll('MOD-07','MOD-'+host()),type);
  if(s.entries[op.id])return;
  function append(html,delay=0,id=op.id,command=''){s.entries[id]={id,seq:++s.seq,at:op.at+delay,html,command,module:current?.iim?.mode?(current.iim.module||'07'):null,target:(op.target==='iim'||(op.kind==='approval'&&(op.status==='approved'||s.iim.mode||s.request?.target==='iim')))?'iim':'terminal',by:op.identity?.discreet?'':op.identity?.characterName||'',byPlayer:op.identity?.discreet?'':op.identity?.playerName||''};const rows=Object.values(s.entries).sort((a,b)=>a.seq-b.seq);for(const row of rows.slice(0,-200))delete s.entries[row.id];}
  if(op.kind==='shared-window'){
   if(!['iim','cryptum'].includes(op.app)||s.power.mode!=='on'||!s.power.loginAt||(!s.iim.consoleOpen&&!s.iim.mode)||op.epoch!==s.power.epoch||op.token!==(s.iim.openId||'legacy'))return;
   const patch=op.patch||{},next={};
   if(['open','close'].includes(patch.effect)&&typeof op.actor==='string')next.effect={id:op.id,kind:patch.effect,actor:op.actor,at:op.at};
   for(const key of ['open','minimized','maximized'])if(typeof patch[key]==='boolean')next[key]=patch[key];
   if(patch.focus===true){s.sharedWindowFocus={app:op.app,id:op.id};next.open=true;next.minimized=false;}
   if(patch.rect&&['x','y','w','h'].every(key=>Number.isFinite(patch.rect[key]))){next.rect={};for(const key of ['x','y','w','h'])next.rect[key]=Math.max(0,Math.min(1,patch.rect[key]));}
   if(!Object.keys(next).length)return;
   s.sharedWindows ||= {};const old=s.sharedWindows[op.app]||{};
   s.sharedWindows[op.app]={...old,...next,revision:(old.revision||0)+1,epoch:op.epoch,token:op.token};return s;
  }
  if(op.kind==='cryptum-destroy-complete'){
   if(!['destroying','implementing'].includes(s.cryptum?.status)||s.cryptum.id!==op.requestId||op.at<s.cryptum.finishAt)return;
   const implemented=s.cryptum.status==='implementing';if(implemented){for(const [id,row] of Object.entries(s.entries))if(row.target==='iim')delete s.entries[id];}s.cryptum.status=implemented?'implemented':'destroyed';s.cryptum.resultAt=op.at;if(implemented){s.cryptum.assimilatedPoints=100;s.iim.lastImplementation={module:s.cryptum.module||host(),at:op.at,sampleJob:s.cryptum.id,assimilatedPoints:100};}
   append(text(implemented?'IIM // IMPLEMENTAÇÃO CRYPTUM CONCLUÍDA\n\nHOSPEDEIRO: MOD-07\nTRANSFERÊNCIA DA AMOSTRA: CONCLUÍDA\nASSIMILAÇÃO REGISTRADA: 100 PONTOS\nINTERFACE NEURAL: ESTABELECIDA\nCOMPARTIMENTO CRY-01: VAZIO\nTRAVA DE CONTENÇÃO: LIBERADA':'IIM // DESTRUIÇÃO DA AMOSTRA CONCLUÍDA\n\nMATERIAL CRYPTUM: DESTRUÍDO\nCOMPARTIMENTO CRY-01: VAZIO\nTRAVA DE CONTENÇÃO: LIBERADA\n\nO COMPARTIMENTO PODE SER ABERTO NOVAMENTE.','iim'));s.entries[op.id].target='iim';return s;
  }
  if(op.kind==='cryptum-tray'||op.kind==='cryptum-scan'||op.kind==='cryptum-result'){
   if(s.power.mode!=='on'||!s.power.loginAt||!s.iim.consoleOpen&&!s.iim.mode)return;
   s.cryptum ||= {tray:'closed',status:'idle'};
   if(op.kind==='cryptum-tray'){if(['pending','detected','destroying','implementing'].includes(s.cryptum.status))return;s.cryptum={tray:op.open?'open':'closed',status:'idle',at:op.at,id:op.id};}
   if(op.kind==='cryptum-scan'){if(s.cryptum.tray==='open'||['pending','detected','destroying','implementing'].includes(s.cryptum.status))return;s.cryptum={tray:'closed',status:'pending',at:op.at,id:op.id};}
   if(op.kind==='cryptum-result'){if(s.cryptum.status!=='pending'||s.cryptum.id!==op.requestId||!['detected','empty'].includes(op.result))return;s.cryptum.status=op.result;s.cryptum.resultAt=op.at;s.sharedWindows ||= {};s.sharedWindows.cryptum={...s.sharedWindows.cryptum,open:true,minimized:false,epoch:s.power.epoch,token:s.iim.openId||'legacy',revision:(s.sharedWindows.cryptum?.revision||0)+1};if(op.result==='detected'){append(text('IIM // AMOSTRA CRYPTUM DETECTADA\n\nCOMPARTIMENTO CRY-01: TRANCADO\nAMOSTRA: PRONTA PARA IMPLEMENTAÇÃO\n\nA IMPLEMENTAÇÃO AINDA NÃO FOI INICIADA.','iim-warning'));s.entries[op.id].target='iim';}}
   return s;
  }
  if(op.kind==='chat-connect'){
   if(s.power.mode!=='on'||!s.power.loginAt||!Number.isFinite(op.at)||s.internalChatConnection?.epoch===s.power.epoch)return;
   s.internalChatConnection={id:op.id,at:op.at,epoch:s.power.epoch};return s;
  }
  if(op.kind==='chat-self'){
   if(s.power.mode!=='on'||!s.power.loginAt||typeof op.text!=='string'||!op.text.trim()||op.text.length>2000||!Number.isFinite(op.at))return;
   s.chatSelfMessages ||= {};s.chatSelfMessages[op.id]={text:op.text.trim(),at:op.at};
   const messages=Object.entries(s.chatSelfMessages).sort((a,b)=>a[1].at-b[1].at||a[0].localeCompare(b[0]));for(const [id] of messages.slice(0,-200))delete s.chatSelfMessages[id];return s;
  }
  if(op.kind==='media'){if(s.power.mode!=='on'||!s.power.loginAt)return;s.media={playing:!!op.playing,position:Math.max(0,Math.min(32.5,Number(op.position)||0)),at:op.at,by:op.identity?.discreet?'':op.identity?.characterName||'',byPlayer:op.identity?.discreet?'':op.identity?.playerName||''};return s;}
  if(['on','off','restart'].includes(op.kind)){
   if(op.kind==='on'&&s.power.mode!=='off')return;
   if(op.kind!=='off'){s.entries={};s.recover=0;}
   const shutdownMs=op.kind==='on'?0:Math.max(3500,Math.min(30000,op.shutdownMs||6500));
   const revision=(s.power.revision||0)+1;
   s.power={revision,mode:op.kind==='off'?'off':'on',epoch:op.id,at:op.at+(op.kind==='restart'?shutdownMs:0),postMs:op.postMs||7600,splashMs:op.splashMs||5200,shutdownAt:op.kind==='on'?0:op.at,shutdownMs};
   s.iim={mode:false,ocular:false};delete s.sharedWindows;delete s.sharedWindowFocus;delete s.cryptum;delete s.media;delete s.internalChatConnection;delete s.request;return s;
  }
  if(op.kind==='login'){if(s.power.mode!=='on'||s.power.loginAt)return;s.power.loginAt=op.at;return s;}
  if(op.kind==='cable-off'){for(const [id,row] of Object.entries(s.entries))if(row.sampleJob&&row.at>op.at)delete s.entries[id];s.iim={mode:false,ocular:false};delete s.sharedWindows;delete s.sharedWindowFocus;delete s.cryptum;delete s.request;return s;}
  if(op.kind==='approval'){
   if(!s.request||s.request.id!==op.requestId||s.request.status!=='pending')return;
   s.request.status=op.status;
   if(op.status==='approved'){
    if(s.request.command==='OCULAR ACTIVATE'&&host()==='06'){append(text(remoteArmor.ocularDenied,'iim-warning'));}
    else if(s.request.command==='OCULAR ACTIVATE'){s.iim.ocular=true;s.ocularModules ||= {};s.ocularModules[host()]={active:true,activatedAt:op.at};append(text(host()==='49-1'?'REATIVAÇÃO OCULAR // MOD-07\n\nENERGIZANDO MICROPROCESSADORES... OK\nSINCRONIZANDO UNIDADE ESQUERDA... OK\nUNIDADE DIREITA: DANIFICADA / NÃO REATIVADA\nCARREGANDO SOBREPOSIÇÃO TÁTICA... OK\nINICIALIZANDO VOZ INTERNA... OK\n\nINTERFACE OCULAR ESQUERDA: ATIVA\nESTADO PERMANENTE REGISTRADO.':host()==='07'?root.IROS_IIM_TEXT.ocular:'REATIVAÇÃO OCULAR // MOD-07\n\nENERGIZANDO MICROPROCESSADORES... OK\nESTABELECENDO CANAL ÓPTICO FUNCIONAL... OK\nCARREGANDO SOBREPOSIÇÃO TÁTICA... OK\nINICIALIZANDO VOZ INTERNA... OK\n\nINTERFACE OCULAR: ATIVA\nESTADO PERMANENTE REGISTRADO NO SERVIDOR.','iim'));}
    else {s.iim.mode=true;s.iim.module=s.request.module||'07';s.iim.connectedAt=op.at;s.iim.ocular=host()!=='06'&&s.ocularModules?.[host()]?.active===true;s.iim.samplePrompts={};append(text((host()==='06'?remoteArmor.connected:host()==='07'?root.IROS_IIM_TEXT.connected:'RESPOSTA DA UNIDADE IIM RECEBIDA.\n\nIDENTIDADE DECLARADA: MOD-07\nACOPLAMENTO VASCULAR: ESTABELECIDO\nINTERFACE NEURAL: ESTABELECIDA\n\nHOSPEDEIRO CONFIRMADO: MOD-07\nDigite STATUS para consultar os parâmetros corporais.').replace('INTERFACE OCULAR: DORMENTE','INTERFACE OCULAR: '+(s.iim.ocular?'ATIVA':'DORMENTE')),'iim'));append(text(host()==='06'?remoteArmor.scan:root.IROS_IIM_TEXT.scan,'iim-warning'),6200,op.id+'-scan');append(text(host()==='06'?remoteArmor.alert:root.IROS_IIM_TEXT.alert,'iim-critical'),10500,op.id+'-alert');}
   }else append(text('AÇÃO IIM RECUSADA PELA UNIDADE.\nNENHUMA ALTERAÇÃO FOI APLICADA.','error'));
   return s;
  }
  if(op.kind==='notes'){s.notes ||= {};for(const [id,note] of Object.entries(op.patch||{})){if(note===null)delete s.notes[id];else s.notes[id]=note;}return s;}
  if(op.kind==='message'){append(text(op.text,op.type||'secret'));if(op.notice)s.entries[op.id].notice=op.text;return s;}
  if(op.kind!=='command'||!s.power.loginAt||s.power.mode==='off')return;
  const command=String(op.command).trim().slice(0,500),c=command.toUpperCase().replace(/\s+/g,' '),inIim=s.iim.mode&&op.target!=='terminal';
  if(!command)return;
  const opener=op.clientId||op.identity?.clientId||'local';
  if(op.target==='terminal'&&c==='IIM'){
   if(!op.cable){if(s.iim.openPrompts)delete s.iim.openPrompts[opener];append(text('ERRO IIM-01 // CABO NÃO DETECTADO\nCONECTE O CABO FÍSICO DA IIM AO COMPUTADOR PARA ABRIR O CONSOLE.','error'),0,op.id,command);return s;}
   s.iim.openPrompts ||= {};s.iim.openPrompts[opener]={at:op.at};append(text('INTERFACE IIM DETECTADA.\nPORTA FÍSICA: IIM-EXT / CONECTADA\n\nDESEJA ABRIR O CONSOLE DA IIM? [Y/N]','iim-warning'),0,op.id,command);return s;
  }
  if(op.target==='terminal'&&s.iim.openPrompts?.[opener]){
   if(!op.cable){delete s.iim.openPrompts[opener];append(text('ERRO IIM-01 // O CABO FOI DESCONECTADO.\nCONECTE A IIM E DIGITE IIM NOVAMENTE.','error'),0,op.id,command);return s;}
   if(c==='N'){delete s.iim.openPrompts[opener];append(text('ABERTURA DO CONSOLE IIM CANCELADA.','warning'),0,op.id,command);return s;}
   if(c!=='Y'){append(text('RESPONDA Y PARA ABRIR OU N PARA CANCELAR.','warning'),0,op.id,command);return s;}
   delete s.iim.openPrompts[opener];s.iim.consoleOpen=true;s.iim.openId=op.id;s.sharedWindows={iim:{open:true,minimized:false,maximized:false,revision:1,epoch:s.power.epoch,token:op.id},cryptum:{open:false,minimized:false,maximized:false,revision:1,epoch:s.power.epoch,token:op.id}};append(text('ABRINDO CONSOLE IIM...\nATALHO DISPONIBILIZADO NA ÁREA DE TRABALHO.','iim'),0,op.id,command);append(text('CONSOLE IIM INICIALIZADO.\nPORTA: IIM-EXT\n\nUTILIZE HELP PARA CONSULTAR OS COMANDOS DA INTERFACE.','iim'),0,op.id+'-console');s.entries[op.id+'-console'].target='iim';return s;
  }
  if(op.target==='terminal'&&/^IIM CONNECT /.test(c)&&!s.iim.consoleOpen){append(text('DIGITE IIM E CONFIRME COM Y PARA ABRIR O CONSOLE.\nA IDENTIFICAÇÃO DO HOSPEDEIRO É FEITA NO CONSOLE DA IIM.','warning'),0,op.id,command);return s;}
  if(op.target==='iim'&&(s.iim.samplePrompts?.[opener]||['DESTROY SAMPLE','DESTRUIR AMOSTRA','IMPLEMENT SAMPLE','IMPLEMENTAR AMOSTRA','INTEGRATE SAMPLE'].includes(c))){
   const prompt=s.iim.samplePrompts?.[opener],implement=['IMPLEMENT SAMPLE','IMPLEMENTAR AMOSTRA','INTEGRATE SAMPLE'].includes(c);
   function report(message,type='warning'){append(text(message,type),0,op.id,command);return s;}
   if(!op.cable||!s.iim.consoleOpen&&!s.iim.mode){if(s.iim.samplePrompts)delete s.iim.samplePrompts[opener];return report('ERRO IIM-01 // CONECTE O CABO E ABRA O CONSOLE DA IIM.');}
   if(s.iim.mode&&host()==='06'&&(implement||prompt?.action==='implement')){if(s.iim.samplePrompts)delete s.iim.samplePrompts[opener];return report(remoteArmor.implantDenied);}
   if(prompt){
    if(c==='N'){delete s.iim.samplePrompts[opener];return report('OPERAÇÃO CANCELADA. A AMOSTRA PERMANECE NO COMPARTIMENTO.');}
    if(c!=='Y')return report('CONFIRME COM Y OU CANCELE COM N.');
    delete s.iim.samplePrompts[opener];
    if(s.cryptum?.status!=='detected'||s.cryptum.id!==prompt.sampleId)return report('A AMOSTRA NÃO ESTÁ MAIS DISPONÍVEL. SOLICITE NOVAMENTE A OPERAÇÃO.');
    if(prompt.action==='implement'&&(!s.iim.mode||prompt.module!==host()))return report('IMPLEMENTAÇÃO ABORTADA // NENHUM HOSPEDEIRO CONECTADO.');
    s.iim.samplePrompts={};
    const integrating=prompt.action==='implement',effectAt=op.at+(integrating?8100:0);s.sharedWindows ||= {};const activeWindow=integrating?'iim':'cryptum';s.sharedWindows[activeWindow]={...s.sharedWindows[activeWindow],open:true,minimized:false,epoch:s.power.epoch,token:s.iim.openId||'legacy',revision:(s.sharedWindows[activeWindow]?.revision||0)+1};
    s.cryptum={tray:'closed',status:integrating?'implementing':'destroying',at:op.at,effectAt,finishAt:effectAt+5395,id:op.id,module:integrating?host():null};
    report(integrating?'IIM // IMPLEMENTAÇÃO CRYPTUM AUTORIZADA - MOD-07':'IIM // DESTRUIÇÃO AUTORIZADA. COMPARTIMENTO TRANCADO.','iim');
    if(integrating){
     const stages=['VALIDANDO ASSINATURA DO HOSPEDEIRO MOD-07','ISOLANDO CÂMARA CRY-01 // TRAVAS ATIVAS','MAPEANDO INTERFACE VASCULAR','INICIANDO LEITURA DE POTENCIAL NEURAL','ESTABELECENDO CANAL DE RETORNO SINÁPTICO','SINCRONIZANDO MALHA CRYPTUM DO HOSPEDEIRO','CALIBRANDO DIFERENCIAL BIOAURÍTICO','RECONHECENDO MATRIZ DA AMOSTRA','ALINHANDO FASE AURÍTICA','AJUSTANDO IMPEDÂNCIA NEURAL','VALIDANDO CONTINUIDADE AXONAL','ABRINDO PONTE DE TRANSFERÊNCIA','CANAL VASCULAR // ESTÁVEL','CANAL NEURAL // ESTABELECIDO','MATRIZ CRYPTUM // RESPONSIVA','SINCRONIA DE FASE // AJUSTADA','RECALCULANDO ROTAS DE CONDUÇÃO','SENSOR AFERENTE // OK','SENSOR EFERENTE // OK','FEEDBACK NEURAL // OK','ACOPLAMENTO DE MATRIZ // OK','TRANSFERÊNCIA PREPARADA','LIBERANDO FLUXO BIOAURÍTICO','INICIANDO IMPLEMENTAÇÃO'];
     const weights=stages.map((_,i)=>Math.pow(.84,i)),sum=weights.reduce((a,b)=>a+b,0);let elapsed=0;
     stages.forEach((line,i)=>{elapsed+=weights[i]/sum*7900;const id=op.id+'-implant-'+i;append(text('> '+line,'iim'),Math.round(elapsed),id);s.entries[id].sampleJob=op.id;});
    }
    return s;
   }
   if(['destroying','implementing','pending'].includes(s.cryptum?.status))return report('A UNIDADE CRY-01 ESTÁ OCUPADA. AGUARDE O FIM DA OPERAÇÃO.');
   if(s.cryptum?.status!=='detected')return report('NENHUMA AMOSTRA CRYPTUM CONFIRMADA NO COMPARTIMENTO.');
   if(implement&&!s.iim.mode)return report('IMPLEMENTAÇÃO INDISPONÍVEL // CONECTE UM HOSPEDEIRO À IIM.');
   s.iim.samplePrompts ||= {};s.iim.samplePrompts[opener]={action:implement?'implement':'destroy',sampleId:s.cryptum.id,module:host()};
   return report(implement?'IMPLEMENTAR A AMOSTRA CRYPTUM NO CORPO DO MOD-07? [Y/N]':'DESTRUIR A AMOSTRA CRYPTUM NO COMPARTIMENTO? [Y/N]');
  }
  if(op.target==='iim'&&c==='DISCONNECT'&&s.cryptum?.status==='implementing'){append(text('IMPLEMENTAÇÃO EM ANDAMENTO. AGUARDE O ENCERRAMENTO DO CICLO.','warning'),0,op.id,command);return s;}
  if(op.target==='iim'&&!s.iim.mode){
   if(!op.cable||!s.iim.consoleOpen){append(text('CANAL IIM ENCERRADO. CONECTE O CABO E ABRA A IIM PELO TERMINAL PRINCIPAL.','warning'),0,op.id,command);return s;}
   if(c==='HELP'){append(text('CONSOLE IIM // COMANDOS DISPONÍVEIS\n\nIIM CONNECT MOD-XX  Solicita identificação e acoplamento\nSTATUS              Consulta a conexão da interface\nDESTROY SAMPLE      Destrói a amostra (Y/N)\nIMPLEMENT SAMPLE    Implementa no hospedeiro (Y/N)\nCLEAR               Limpa este console\n\nApós o acoplamento: OCULAR / OCULAR ACTIVATE / DISCONNECT.','help'),0,op.id,command);return s;}
   if(c==='STATUS'){append(text('IIM-EXT // CABO CONECTADO\nCONSOLE: OPERACIONAL\nHOSPEDEIRO: NENHUM\nACOPLAMENTO VASCULAR / NEURAL: NÃO ESTABELECIDO\n\nUTILIZE IIM CONNECT MOD-XX PARA SOLICITAR O ACOPLAMENTO.','iim'),0,op.id,command);return s;}
   if(c!=='CLEAR'&&!/^IIM CONNECT /.test(c)){append(text('NENHUM HOSPEDEIRO ACOPLADO.\nUTILIZE HELP PARA CONSULTAR OS COMANDOS DA INTERFACE.','warning'),0,op.id,command);return s;}
  }
  if(c==='CLEAR'){if(op.target){for(const [id,row] of Object.entries(s.entries))if((row.target||'terminal')===op.target)delete s.entries[id];}else s.entries={};append('',0,op.id,command);return s;}
  let html;
  const mail=channelMessage(command);
  if(mail){
   if(mail.message){s.mailbox ||= {};s.mailbox[op.id]={id:op.id,channel:mail.channel,message:mail.message,at:op.at,characterName:op.identity?.discreet?'':op.identity?.characterName||'',playerName:op.identity?.discreet?'':op.identity?.playerName||''};html=text('CANAL '+mail.channel+' // MENSAGEM ENVIADA\n\n'+mail.message+'\n\nAGUARDANDO RESPOSTA DE '+mail.channel+'.\nA RESPOSTA SERÁ TRANSMITIDA QUANDO O CANAL ESTIVER DISPONÍVEL.',mail.channel==='KRYTUX'?'secret':'data');}
   else html=text('USO: say to '+mail.channel.toLowerCase()+' <mensagem>','warning');
  }
  else if(!op.cable&&(/^IIM(?: |$)/.test(c)||inIim))html=text('ERRO IIM-01 // INTERFACE NÃO DETECTADA\nO CABO FÍSICO DA IIM NÃO ESTÁ CONECTADO AO COMPUTADOR.','error');
  else if(/^IIM CONNECT /.test(c)){
   const match=c.match(/^IIM CONNECT (?:MOD-)?(\d{1,2}(?:-\d+)?)$/),module=match?match[1].split('-').map((v,i)=>i?v:v.padStart(2,'0')).join('-'):null;
   if(!supported.includes(module))html=text('MÓDULO SEM REGISTRO VINCULADO.\nVERIFIQUE A DESIGNAÇÃO INFORMADA. USO: IIM CONNECT MOD-XX','error');
   else if(s.iim.mode)html=text('A IIM JÁ ESTÁ CONECTADA AO MOD-07.\nUTILIZE DISCONNECT ANTES DE CONECTAR OUTRO HOSPEDEIRO.','warning');
   else if(s.request?.status==='pending')html=text('A PORTA IIM ESTÁ OCUPADA. AGUARDANDO RESPOSTA DA UNIDADE.','warning');
   else {s.request={id:op.id,command:'IIM CONNECT MOD-'+module,target:op.target||'terminal',module,requestedBy:op.identity,createdAt:op.at,status:'pending'};html=text('IIM // SOLICITAÇÃO TRANSMITIDA\nHOSPEDEIRO SOLICITADO: MOD-'+module+'\nPORTA FÍSICA: DETECTADA\nAGUARDANDO CONFIRMAÇÃO DA UNIDADE IIM...','iim-warning');}
  }else if(inIim&&c==='OCULAR')html=text(ocularStatus(host(),s.iim.ocular),s.iim.ocular?'iim':'iim-warning');
  else if(inIim&&host()==='06'&&c==='OCULAR ACTIVATE')html=text(remoteArmor.ocularDenied,'iim-warning');
  else if(inIim&&c==='OCULAR ACTIVATE'&&s.iim.ocular)html=text('INTERFACE OCULAR JÁ ATIVA.\nATIVAÇÃO PERMANENTE REGISTRADA PARA MOD-07.','iim');
  else if(inIim&&c==='OCULAR ACTIVATE'&&!s.iim.ocular){
   if(s.request?.status==='pending')html=text('A PORTA IIM ESTÁ OCUPADA. AGUARDANDO RESPOSTA DA UNIDADE.','warning');
   else {s.request={id:op.id,command:'OCULAR ACTIVATE',target:'iim',module:host(),requestedBy:op.identity,createdAt:op.at,status:'pending'};html=text('IIM // SOLICITAÇÃO TRANSMITIDA\nAGUARDANDO CONFIRMAÇÃO DA UNIDADE IIM...','iim-warning');}
  }else if(inIim&&c==='DISCONNECT'){const remote=host()==='06';s.iim.mode=false;s.iim.ocular=false;s.iim.samplePrompts={};delete s.iim.module;html=text((remote?'VÍNCULO COM A ARMADURA REMOTA ENCERRADO.\nCONTROLE CONSCIENTE DO MOD-06: DESVINCULADO DA IIM.\nCONSOLE IIM EM ESPERA.':'ACOPLAMENTO ENCERRADO.\nHOSPEDEIRO LIBERADO.\nCONSOLE IIM EM ESPERA.'));}
  else {if(c==='RECOVER'&&!s.iim.mode)s.recover++;html=answer(command,s,op.target);}
  append(html,0,op.id,command);return s;
 }
 root.IROSSharedSession={initial,reduce,text,ocularStatus};
})(typeof window==='undefined'?globalThis:window);
