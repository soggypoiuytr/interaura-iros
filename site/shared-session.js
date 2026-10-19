window.IROS_IIM_TEXT={"connected":"RESPOSTA DA UNIDADE IIM RECEBIDA.\n\nIDENTIDADE DECLARADA: MOD-07\nASSINATURA BIOMÉTRICA: COMPATÍVEL\nMALHA CRYPTUM: RECONHECIDA\nMARCA DE VÍNCULO: PRESENTE\nCONTEMPLADOR: INCERTO\nCORRESPONDÊNCIA MODULAR: 99,81%\n\nACOPLAMENTO VASCULAR: ESTABELECIDO\nINTERFACE NEURAL: ESTABELECIDA\nINTERFACE OCULAR: DORMENTE\n\nHOSPEDEIRO CONFIRMADO: MOD-07\nDigite HELP para consultar os comandos da IIM.","scan":"VARREDURA COMPLEMENTAR INICIADA.\nANALISANDO RESSONÂNCIA FORA DO PERÍMETRO CORPORAL...","alert":"VARREDURA COMPLEMENTAR CONCLUÍDA.\n\nALERTA // INTERFERÊNCIA AURÍTICA EXTERNA\n\nA IIM detectou uma assinatura energética que não pertence ao módulo, à malha Cryptum implantada ou ao Contemplador registrado.\n\nA fonte permanece fora do organismo, porém exerce influência mensurável sobre sua atividade neural, suas manifestações auríticas e seus processos de adaptação biológica. Nenhuma matéria ou energia estranha foi localizada dentro do corpo.\n\nORIGEM EXTERNA: NÃO LOCALIZADA\nDISTÂNCIA: INDETERMINADA\nINTENÇÃO: NÃO DETERMINADA\nRECOMENDAÇÃO: MANTER MONITORAMENTO DURANTE TODA A CONEXÃO.","ocular":"INICIANDO REATIVAÇÃO OCULAR // MOD-07\n\nENERGIZANDO MICROPROCESSADORES... OK\nREABRINDO CANAL DO NERVO ÓPTICO... OK\nSINCRONIZANDO UNIDADE ESQUERDA... OK\nSINCRONIZANDO UNIDADE DIREITA... OK\nCARREGANDO SOBREPOSIÇÃO TÁTICA... OK\nINICIALIZANDO VOZ INTERNA... OK\n\nINTERFACE OCULAR REATIVADA.\nA MOD-07 PODE APRESENTAR DESORIENTAÇÃO DURANTE OS PRIMEIROS MINUTOS."};
(function(root){
 'use strict';
 const initial=()=>({version:2,seq:0,power:{mode:'off',epoch:'initial',at:0},iim:{mode:false,ocular:false},recover:0,entries:{}});
 const text=(value,type='data')=>'<pre class="terminal-response '+type+'" data-revealed="true">'+String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</pre>';
 function reduce(current,op,answer){
  const s=JSON.parse(JSON.stringify(current||initial()));
  s.entries ||= {};s.iim ||= {mode:false,ocular:false};
  if(s.entries[op.id])return;
  function append(html,delay=0,id=op.id,command=''){s.entries[id]={id,seq:++s.seq,at:op.at+delay,html,command,by:op.identity?.discreet?'':op.identity?.characterName||'',byPlayer:op.identity?.discreet?'':op.identity?.playerName||''};const rows=Object.values(s.entries).sort((a,b)=>a.seq-b.seq);for(const row of rows.slice(0,-200))delete s.entries[row.id];}
  if(op.kind==='media'){if(s.power.mode!=='on'||!s.power.loginAt)return;s.media={playing:!!op.playing,position:Math.max(0,Math.min(32.5,Number(op.position)||0)),at:op.at,by:op.identity?.discreet?'':op.identity?.characterName||'',byPlayer:op.identity?.discreet?'':op.identity?.playerName||''};return s;}
  if(['on','off','restart'].includes(op.kind)){
   if(op.kind==='on'&&s.power.mode!=='off')return;
   if(op.kind!=='off'){s.entries={};s.recover=0;}
   const shutdownMs=op.kind==='on'?0:Math.max(3500,Math.min(30000,op.shutdownMs||6500));
   const revision=(s.power.revision||0)+1;
   s.power={revision,mode:op.kind==='off'?'off':'on',epoch:op.id,at:op.at+(op.kind==='restart'?shutdownMs:0),postMs:op.postMs||7600,splashMs:op.splashMs||5200,shutdownAt:op.kind==='on'?0:op.at,shutdownMs};
   s.iim={mode:false,ocular:false};delete s.media;delete s.request;return s;
  }
  if(op.kind==='login'){if(s.power.mode!=='on'||s.power.loginAt)return;s.power.loginAt=op.at;return s;}
  if(op.kind==='cable-off'){s.iim={mode:false,ocular:false};delete s.request;return s;}
  if(op.kind==='approval'){
   if(!s.request||s.request.id!==op.requestId||s.request.status!=='pending')return;
   s.request.status=op.status;
   if(op.status==='approved'){
    if(s.request.command==='OCULAR ACTIVATE'){s.iim.ocular=true;append(text(root.IROS_IIM_TEXT.ocular,'iim'));}
    else {s.iim.mode=true;append(text(root.IROS_IIM_TEXT.connected,'iim'));append(text(root.IROS_IIM_TEXT.scan,'iim-warning'),6200,op.id+'-scan');append(text(root.IROS_IIM_TEXT.alert,'iim-critical'),10500,op.id+'-alert');}
   }else append(text('AÇÃO IIM RECUSADA PELA UNIDADE.\nNENHUMA ALTERAÇÃO FOI APLICADA.','error'));
   return s;
  }
  if(op.kind==='notes'){s.notes ||= {};for(const [id,note] of Object.entries(op.patch||{})){if(note===null)delete s.notes[id];else s.notes[id]=note;}return s;}
  if(op.kind==='message'){append(text(op.text,op.type||'secret'));if(op.notice)s.entries[op.id].notice=op.text;return s;}
  if(op.kind!=='command'||!s.power.loginAt||s.power.mode==='off')return;
  const command=String(op.command).trim().slice(0,500),c=command.toUpperCase().replace(/\s+/g,' ');
  if(!command)return;
  if(c==='CLEAR'){s.entries={};append('',0,op.id,command);return s;}
  let html;
  if(/^SAY TO KRYTUX(?:\s|$)/i.test(command)){
   const message=command.replace(/^SAY TO KRYTUX\s*/i,'').trim();
   html=message?text('CANAL KRYTUX // MENSAGEM ENVIADA\n\n'+message+'\n\nAGUARDANDO RESPOSTA DE KRYTUX.\nA RESPOSTA SERÁ TRANSMITIDA QUANDO O CANAL ESTIVER DISPONÍVEL.','secret'):text('USO: say to krytux <mensagem>','warning');
  }
  else if(!op.cable&&(/^IIM(?: |$)/.test(c)||s.iim.mode))html=text('ERRO IIM-01 // INTERFACE NÃO DETECTADA\nO CABO FÍSICO DA IIM NÃO ESTÁ CONECTADO AO COMPUTADOR.','error');
  else if((!s.iim.mode&&/^IIM CONNECT MOD-0?7$/.test(c))||(s.iim.mode&&c==='OCULAR ACTIVATE'&&!s.iim.ocular)){
   if(s.request?.status==='pending')html=text('A PORTA IIM ESTÁ OCUPADA. AGUARDANDO RESPOSTA DA UNIDADE.','warning');
   else {s.request={id:op.id,command:s.iim.mode?'OCULAR ACTIVATE':'IIM CONNECT MOD-07',module:'07',requestedBy:op.identity,createdAt:op.at,status:'pending'};html=text('IIM // SOLICITAÇÃO TRANSMITIDA\nPORTA FÍSICA: DETECTADA\nAGUARDANDO CONFIRMAÇÃO DA UNIDADE IIM...','iim-warning');}
  }else if(s.iim.mode&&c==='DISCONNECT'){s.iim.mode=false;html=text('CANAL IIM ENCERRADO.\nPORTA EXTERNA LIBERADA.\nTERMINAL INT-JP-04 RESTAURADO.');}
  else {if(c==='RECOVER'&&!s.iim.mode)s.recover++;html=answer(command,s);}
  append(html,0,op.id,command);return s;
 }
 root.IROSSharedSession={initial,reduce,text};
})(typeof window==='undefined'?globalThis:window);
