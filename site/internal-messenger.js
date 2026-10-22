(function(){
 'use strict';const rt=window.InterauraRealtime,$=id=>document.getElementById(id);let connected=false,selected='admin',selfMessages={},signature='',powerEpoch;
 const sounds=Object.fromEntries(['login','send','receive','online'].map(name=>{const audio=new Audio('assets/audio/chat-'+name+(name==='login'?'.mp3':'.wav'));audio.preload='auto';audio.id='chat-sound-'+name;audio.hidden=true;document.body.append(audio);return [name,audio];}));
 const cue=name=>{if(!connected||document.body.dataset.irosPhase!=='desktop')return;window.IROSLocalCue?.(sounds[name],['send','receive'].includes(name)?1:.72);};
 let initialized=false,seenSelf=new Set(),contacts={},contactsInitialized=false,seenIncoming=new Set(),incomingInitialized=false,incoming={},receiptTimer,connectionAnnounceTimer;
 const unreadKey='iros-chat-unread:'+ (new URLSearchParams(location.search).get('sala')||window.INTERAURA_ROOM||'local');let unread={};try{const saved=JSON.parse(sessionStorage.getItem(unreadKey)||'{}');for(const [id,count] of Object.entries(saved))if(/^[a-zA-Z0-9_-]+$/.test(id)&&Number.isSafeInteger(count)&&count>0)unread[id]=Math.min(count,9999);}catch{}
 delete unread.self;
 const deliveredKey=unreadKey+':delivered';let delivered=new Set();try{delivered=new Set(JSON.parse(sessionStorage.getItem(deliveredKey)||'[]'));}catch{}
 function pendingMessage(id,contact,text){if(delivered.has(id))return;delivered.add(id);try{sessionStorage.setItem(deliveredKey,JSON.stringify([...delivered].slice(-2000)));}catch{}if(contact==='self')return;if(connected&&document.body.dataset.irosPhase==='desktop')notice('message',contact,text);else{unread[contact]=Math.min(9999,(unread[contact]||0)+1);badges();}}
 function contactBadges(){for(const button of document.querySelectorAll('[data-chat-contact]')){const id=button.dataset.chatContact,count=id==='self'?0:(unread[id]||0);let badge=button.querySelector('.messenger-contact-unread');if(!badge){badge=document.createElement('span');badge.className='messenger-contact-unread';button.append(badge);}badge.hidden=count===0;badge.textContent=count>99?'99+':String(count);badge.setAttribute('aria-label',count+' mensagens não lidas');button.classList.toggle('has-unread',count>0);}}
 function badges(){contactBadges();const total=Object.values(unread).reduce((sum,n)=>sum+n,0),label=total>99?'99+':String(total),tray=$('chat-tray-unread'),desktop=$('chat-desktop-unread');tray.hidden=!connected;$('chat-tray-count').hidden=total===0;desktop.hidden=total===0;desktop.textContent=label;$('chat-tray-count').textContent=label;tray.setAttribute('aria-label','Chat Interno '+(connected?'conectado':'desconectado')+': '+total+' mensagens não lidas');const tooltip=$('chat-tray-info');if(tooltip)tooltip.textContent='CHAT INTERNO\nSESSÃO: A.CHIYOMI\nESTADO: '+(connected?'CONECTADO':'DESCONECTADO')+'\nMENSAGENS PENDENTES: '+total;document.querySelector('.desktop-icon[data-open-app="chat"]').setAttribute('aria-label',total?'CHAT INTERNO - '+total+' mensagens não lidas':'CHAT INTERNO');try{sessionStorage.setItem(unreadKey,JSON.stringify(unread));}catch{}}
 function reading(id){return selected===id&&$('chat-message-window').classList.contains('open')&&!$('chat-message-window').classList.contains('minimized')&&!document.hidden&&document.hasFocus();}
 function markRead(id){delete unread[id];badges();}
 function openUnread(){const id=Object.keys(unread)[0];if(!connected){openIrosApp('chat');return;}if(id)document.querySelector('[data-chat-contact="'+id+'"]')?.click();else openIrosApp('chat-list');}
 $('chat-message-window').addEventListener('pointerdown',()=>markRead(selected));$('chat-message-window').addEventListener('focusin',()=>markRead(selected));badges();
 const notifications=document.createElement('div');notifications.id='chat-notifications';notifications.setAttribute('aria-live','polite');document.body.append(notifications);
 function profile(id){if(id==='reika')return {name:'R. MIZUHARA',photo:'assets/embedded/a2cefd47ca264f7f.png'};if(id==='self')return {name:'A.CHIYOMI',photo:'assets/portraits/ariella-chiyomi-v2.png?rev=neck-braid'};if(id==='admin')return {name:'INTERAURA',photo:'assets/branding/interaura-document-logo.png'};const c=contacts[id];return c?.recovered===true?{name:String(c.name||'CONTATO RECUPERADO').slice(0,60),photo:typeof c.photo==='string'&&/^assets\/[a-zA-Z0-9_./?=-]+$/.test(c.photo)?c.photo:null}:null;}
 function notice(kind,id,preview=''){
  if(!connected||document.body.dataset.irosPhase!=='desktop')return;if(kind==='message'&&id!=='self'&&!reading(id)){unread[id]=Math.min(9999,(unread[id]||0)+1);badges();}const contact=profile(id)||{name:'CONTATO EM RECUPERAÇÃO'},box=document.createElement('article'),head=document.createElement('header'),title=document.createElement('strong'),close=document.createElement('button'),open=document.createElement('button'),picture=document.createElement('span'),body=document.createElement('span'),name=document.createElement('b'),summary=document.createElement('small');
  box.className='messenger-notice';box.dataset.kind=kind;title.textContent=kind==='connected'?'CHAT INTERNO CONECTADO':kind==='online'?'CONTATO ONLINE':'MENSAGEM RECEBIDA';close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar notificação do chat');head.append(title,close);open.type='button';open.className='messenger-notice-open';picture.className='messenger-contact-photo'+(id==='admin'?' messenger-interaura-emblem':'');if(contact.photo){const img=document.createElement('img');img.src=contact.photo;img.alt='';picture.append(img);}else picture.textContent='▧';name.textContent=contact.name;summary.textContent=kind==='online'?'Acabou de se conectar.':String(preview||'Uma nova mensagem está disponível.').slice(0,100);body.append(name,summary);open.append(picture,body);box.append(head,open);notifications.append(box);while(notifications.children.length>3)notifications.firstElementChild.remove();let expiry;
  const dismiss=()=>{clearTimeout(expiry);box.classList.add('leaving');setTimeout(()=>box.remove(),320);};close.onclick=dismiss;open.onclick=()=>{dismiss();if(kind==='connected')openUnread();else document.querySelector('[data-chat-contact="'+id+'"]')?.click();};expiry=setTimeout(dismiss,8500);if(kind!=='connected')cue(kind==='online'?'online':'receive');
 }
 function updateContacts(){for(const b of document.querySelectorAll('[data-chat-contact^="broken-"]')){const c=profile(b.dataset.chatContact);if(!c)continue;b.classList.remove('messenger-corrupt-contact');b.setAttribute('aria-label',c.name);b.querySelector('b').textContent=c.name;b.querySelector('small').textContent=contacts[b.dataset.chatContact]?.online?'ONLINE':'OFFLINE';const icon=b.querySelector('.messenger-contact-icon');icon.classList.add('messenger-contact-photo');icon.replaceChildren();if(c.photo){const img=document.createElement('img');img.src=c.photo;img.alt=c.name;icon.append(img);}else icon.textContent='▧';}}
 const localSends=new Set();
 const error=document.createElement('aside');error.id='chat-contact-error';error.className='custom-system-error';error.hidden=true;error.setAttribute('role','alertdialog');error.setAttribute('aria-modal','true');error.setAttribute('aria-label','Conversas não recuperadas');error.innerHTML='<article class="program-error"><header><span class="iros-pixel-icon warning" aria-hidden="true"></span><span>ERRO DE SISTEMA // CHATINT.EXE</span></header><section><b>CONVERSAS AINDA NÃO RECUPERADAS.</b><p>A conexão com o chat interno foi restabelecida, mas o histórico e a identidade deste contato continuam em indexação.</p><code>ERRO INTMSG-041<br>HISTÓRICO: NÃO RECUPERADO<br>NÓ DO CONTATO: RECONECTANDO</code><p>Aguarde a recuperação deste contato para abrir a conversa.</p></section><footer><button type="button">FECHAR</button></footer></article>';document.body.append(error);let errorSource,errorGlitchTimer;
 function glitchContactError(){const dialog=error.querySelector('.program-error');clearTimeout(errorGlitchTimer);dialog.classList.remove('camera-image-glitch','error-shudder');void dialog.offsetWidth;dialog.classList.add('camera-image-glitch');errorGlitchTimer=setTimeout(()=>dialog.classList.remove('camera-image-glitch'),430);}
 function closeError(){clearTimeout(errorGlitchTimer);error.querySelector('.program-error').classList.remove('camera-image-glitch');error.hidden=true;errorSource?.focus();}error.querySelector('button').onclick=closeError;error.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeError();}});
 const administrative=[
  {
    "at": "21/12/1999 - 14:32",
    "text": "PESQUISA // REVISÃO AUR-12-B\nOs novos protocolos do Projeto AURA já estão em vigor. Exposições induzidas acima de onze minutos exigem autorização da direção. Consulte o tópico publicado pelo Dr. Hiroshino antes do próximo turno."
  },
  {
    "at": "21/12/1999 - 15:12",
    "text": "PADRONIZAÇÃO DE REGISTROS\n“Aura” permanece uma designação operacional provisória. Para respostas anteriores ao estímulo, utilize “antecipação por ressonância”. Encaminhe o registro diretamente ao responsável pela revisão AUR-12-B."
  },
  {
    "at": "22/12/1999 - 08:10",
    "text": "SAÚDE OCUPACIONAL // REGISTRO OBRIGATÓRIO\nFuncionários expostos devem registrar sonhos recorrentes, lapsos temporais e sensação de observação. Não substitua o formulário individual por um relato coletivo. Perda de memória ou reconhecimento falso durante ensaio exige interrupção imediata."
  },
  {
    "at": "22/12/1999 - 16:40",
    "text": "CIRCULAÇÃO DE INFORMAÇÕES\nEvite citar designações de módulos em discussões de índice geral. Resultados identificáveis devem permanecer nos prontuários e canais autorizados. A credencial da direção não amplia o acesso dos demais participantes de um tópico."
  },
  {
    "at": "23/12/1999 - 10:45",
    "text": "CRY-02 // MOVIMENTAÇÃO DE AMOSTRAS\nA cessão de material Cryptum para AUR-01 depende de registro de origem e autorização de Akira Hakurei. Amostras AURA e organismos Cryptum vivos não podem compartilhar um setor sem isolamento duplo."
  },
  {
    "at": "26/12/1999 - 07:30",
    "text": "SISTEMAS // ENCERRAMENTO DE TURNO\nFinalize os registros em andamento antes de sair da estação. O envio pelo CHATINT.EXE não substitui o arquivamento de pareceres. Não deixe a credencial de direção aberta em um terminal desacompanhado."
  },
  {
    "at": "27/12/1999 - 18:05",
    "text": "CONTENÇÃO // ENTREGA DE OBSERVAÇÕES\nRegistre o horário do equipamento e o horário observado pelo funcionário quando houver divergência. Preserve ambas as marcações. Não ajuste o relato de outro observador para fazê-lo coincidir com o seu."
  },
  {
    "at": "28/12/1999 - 22:19",
    "text": "LOGÍSTICA // TRANSPORTE ENTRE SETORES SUSPENSO\nO aviso de ADM_LOGÍSTICA foi fixado às 22:16 na rede interna. Novas movimentações permanecem suspensas até liberação do setor. Solicitações em andamento devem aguardar confirmação; não utilize rotas alternativas por iniciativa própria."
  },
  {
    "at": "28/12/1999 - 23:05",
    "text": "SISTEMAS // CÓPIA DE SEGURANÇA\nMantenha os volumes de trabalho disponíveis para a rotina de backup. Não remova arquivos locais nem interrompa a estação durante a gravação. A confirmação de uma mensagem entregue não equivale à confirmação de uma cópia arquivada."
  },
  {
    "at": "28/12/1999 - 23:41",
    "text": "ENGENHARIA // DIVERGÊNCIA DE CONSUMO\nOs medidores registram desvio de energia sem correspondência nas cargas autorizadas. Nenhum equipamento adicional consta nas ordens de serviço. Não religue circuitos isolados para compensar a queda; a origem do consumo permanece em investigação."
  },
  {
    "at": "29/12/1999 - 03:12",
    "text": "ENGENHARIA // DESVIO NÃO LOCALIZADO\nA demanda continua aumentando mesmo após o desligamento das cargas secundárias. O balanço entre alimentação e retorno não fecha. Os circuitos de contenção seguem prioritários. Toda oscilação deve ser comunicada pela linha interna; não abra os painéis dos níveis inferiores."
  },
  {
    "at": "29/12/1999 - 03:36",
    "severity": "emergency",
    "text": "MONITOR AUTOMÁTICO // FALHA NO NÓ B-04\nO nó de contenção deixou de confirmar pacotes. Foram detectadas quedas simultâneas de tensão e interrupções na telemetria. A transferência para a alimentação de reserva não estabilizou a rede. Aguarde instruções da contenção."
  },
  {
    "at": "29/12/1999 - 03:42",
    "severity": "emergency",
    "text": "ALERTA DE EMERGÊNCIA // REDE INTERNA INSTÁVEL\nVários servidores estão perdendo a conexão simultaneamente. As rotas de redundância não respondem. A ordem das falhas não corresponde à distribuição dos circuitos.\n\nNÓ B-04: OFFLINE\nBACKUP-B07: SEM RESPOSTA\nTELEMETRIA CRY-02: INTERMITENTE\nNÓ X10-03: CONEXÃO PERDIDA\nSERVIÇO DE AUTENTICAÇÃO: INDISPONÍVEL\n\nA confirmação de entrega entre setores foi interrompida. Não considere uma estação silenciosa como indicação de que o setor está seguro."
  },
  {
    "at": "29/12/1999 - 03:42",
    "severity": "emergency",
    "text": "ALARME ESTRUTURAL // NÍVEIS INFERIORES\nRuptura de suportes detectada. Sensores registram deslocamento de placas, queda de estruturas e perda de continuidade entre passagens. As leituras de pressão e vibração excederam os limites de segurança antes de os sensores pararem de transmitir.\n\nMAPA DE ROTAS: NÃO CONFIÁVEL\nPORTAS DE CONTENÇÃO: ESTADO NÃO CONFIRMADO\nCOMUNICAÇÃO COM EQUIPES LOCAIS: PERDIDA\n\nNão utilize elevadores nem atravesse corredores com deformação aparente. A central não consegue confirmar quais acessos permanecem transitáveis."
  },
  {
    "at": "29/12/1999 - 03:42",
    "severity": "emergency",
    "text": "ÚLTIMO PACOTE LOCAL // TRANSMISSÃO INCOMPLETA\nOs nós restantes estão deixando de responder. A lista de estações conectadas não pôde ser atualizada.\n\nCONTENÇÃO: [SEM RETORNO]\nENGENHARIA: [SEM RETORNO]\nDIREÇÃO: [SEM RETORNO]\nCHATINT // ROTA REMOTA: PERDIDA\n\n[FLUXO INTERROMPIDO]\n[CONFIRMAÇÃO DE ENTREGA AUSENTE]"
  }
];
 const notes=[
  {
    "at": "20/12/1999 - 06:41",
    "text": "teste"
  },
  {
    "at": "20/12/1999 - 06:41",
    "text": "teste 2"
  },
  {
    "at": "20/12/1999 - 06:42",
    "text": "031 031"
  },
  {
    "at": "21/12/1999 - 12:07",
    "text": "colher"
  },
  {
    "at": "21/12/1999 - 12:08",
    "text": "11 / 4 / 11"
  },
  {
    "at": "21/12/1999 - 19:26",
    "text": "palimpsesto"
  },
  {
    "at": "23/12/1999 - 08:13",
    "text": "a"
  },
  {
    "at": "23/12/1999 - 08:13",
    "text": "aaaa"
  },
  {
    "at": "23/12/1999 - 08:14",
    "text": "não era aqui"
  },
  {
    "at": "24/12/1999 - 17:02",
    "text": "074 074 074"
  },
  {
    "at": "24/12/1999 - 17:04",
    "text": "azulejo"
  },
  {
    "at": "26/12/1999 - 07:42",
    "text": "teste. chegou."
  },
  {
    "at": "26/12/1999 - 07:43",
    "text": "."
  },
  {
    "at": "26/12/1999 - 07:45",
    "text": "café"
  },
  {
    "at": "26/12/1999 - 22:18",
    "text": "entressono"
  },
  {
    "at": "27/12/1999 - 09:11",
    "text": "00017"
  },
  {
    "at": "27/12/1999 - 09:12",
    "text": "vidro / sal / colher"
  },
  {
    "at": "27/12/1999 - 21:16",
    "text": "xilófago"
  },
  {
    "at": "27/12/1999 - 21:17",
    "text": "como se escreve isso"
  },
  {
    "at": "28/12/1999 - 06:58",
    "text": "teste teste"
  },
  {
    "at": "28/12/1999 - 06:59",
    "text": "8 8 13 8"
  },
  {
    "at": "28/12/1999 - 18:33",
    "text": "nacre"
  },
  {
    "at": "28/12/1999 - 23:12",
    "text": "véspera"
  },
  {
    "at": "28/12/1999 - 23:12",
    "text": "000"
  }
];
 const reikaConversation=[
  {
    "at": "28/12/1999 - 02:21",
    "author": "R. MIZUHARA",
    "text": "Ariella, você ainda está na estação?"
  },
  {
    "at": "28/12/1999 - 02:22",
    "author": "A.CHIYOMI",
    "text": "Estou. Seja breve."
  },
  {
    "at": "28/12/1999 - 02:23",
    "author": "R. MIZUHARA",
    "text": "A 42 fez de novo. Às 02:17, levantou a cabeça e acompanhou o corredor com os olhos. As câmeras não mostram ninguém."
  },
  {
    "at": "28/12/1999 - 02:23",
    "author": "R. MIZUHARA",
    "text": "Perguntei o que ela estava esperando. A mesma resposta: “Ainda não vieram me buscar.” Não muda uma palavra."
  },
  {
    "at": "28/12/1999 - 02:24",
    "author": "A.CHIYOMI",
    "text": "Registre a repetição e compare o intervalo com as noites anteriores. Mantenha a gravação contínua."
  },
  {
    "at": "28/12/1999 - 02:25",
    "author": "R. MIZUHARA",
    "text": "Não é só a frase. Ela só aceita continuar as avaliações quando estou no visor externo. Se outro pesquisador assume, ela deixa de responder. Quando me afasto, vai até a porta e pergunta por mim."
  },
  {
    "at": "28/12/1999 - 02:26",
    "author": "R. MIZUHARA",
    "text": "Hoje precisei ficar no corredor protegido até terminarem a leitura. Tentamos minha voz pela linha interna. Ela perguntou por que eu estava longe. Isso está comprometendo a troca de equipe e eu não consigo acompanhar todos os turnos."
  },
  {
    "at": "28/12/1999 - 02:27",
    "author": "A.CHIYOMI",
    "text": "Então separe as condições: presença no visor, voz remota e ausência. Meça o tempo de resposta em cada uma. A preferência por você é uma variável de pesquisa."
  },
  {
    "at": "28/12/1999 - 02:29",
    "author": "R. MIZUHARA",
    "text": "Ela não quer os outros perto. Não está pedindo para sair. Só pede que eu fique. Tenho a impressão de que está com medo de alguma coisa que não conseguimos registrar."
  },
  {
    "at": "28/12/1999 - 02:30",
    "author": "A.CHIYOMI",
    "text": "Impressões não entram na conclusão. Não interprete a recusa como confiança, nem a calma como ausência de risco. O acesso presencial à cela continua proibido."
  },
  {
    "at": "28/12/1999 - 02:32",
    "author": "R. MIZUHARA",
    "text": "Eu sei. Ninguém entrou. Estou preocupada com ela, não propondo suspender a contenção."
  },
  {
    "at": "28/12/1999 - 02:33",
    "author": "A.CHIYOMI",
    "text": "Não deve se preocupar. Siga com a pesquisa. Se ela só colabora na sua presença, use essa condição para concluir a série. Não altere o protocolo para tranquilizá-la."
  },
  {
    "at": "28/12/1999 - 02:34",
    "author": "R. MIZUHARA",
    "text": "Entendido."
  },
  {
    "at": "28/12/1999 - 02:35",
    "author": "A.CHIYOMI",
    "text": "Quero os registros comparativos antes do próximo turno."
  }
];
 const broken=$('chat-corrupted-contacts');for(let i=0;i<7;i++){const b=document.createElement('button');b.type='button';b.dataset.chatContact='broken-'+i;b.className='messenger-corrupt-contact';b.setAttribute('aria-label','Contato não identificado '+(i+1)+' em indexação');const icon=document.createElement('span');icon.className='messenger-contact-icon';icon.textContent='▧';const label=document.createElement('span'),name=document.createElement('b'),state=document.createElement('small');name.textContent=['▒▒░ ▓▒▒','░▓▒ ░░▓','▓░▒▒ ▒▓'][i%3];name.dataset.corrupt='▒▓░▒ ░▓';state.textContent=i%2?'INDEXANDO...':'RECONECTANDO...';label.append(name,state);b.append(icon,label);broken.append(b);}
 function row(message,author){const article=document.createElement('article'),header=document.createElement('header'),name=document.createElement('b'),time=document.createElement('small'),body=document.createElement('p');name.textContent=author+':';article.className=author==='A.CHIYOMI'?'messenger-self-message':'messenger-admin-message';if(message.severity==='emergency')article.classList.add('messenger-emergency');time.textContent=message.at;header.append(name,time);body.textContent=message.text;article.append(header,body);return article;}
 function render(){const list=$('chat-message-history'),nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<60;list.replaceChildren();const admin=selected==='admin',self=selected==='self',reika=selected==='reika',contact=profile(selected);$('chat-conversation-title').textContent='MENSAGEM // '+(contact?.name||'▒▒░▓▒');$('chat-conversation-kind').textContent=admin?'CANAL ADMINISTRATIVO':self?'PRÓPRIA CREDENCIAL':reika?'HISTÓRICO RECUPERADO':'NÓ EM RECUPERAÇÃO';$('chat-conversation-banner').textContent=admin?'INTERAURA // AVISOS AUTOMÁTICOS':self?'A.CHIYOMI → A.CHIYOMI // CÓPIA LOCAL DA CONVERSA':'IDENTIDADE NÃO RECONSTRUÍDA';$('chat-compose-form').hidden=!self;$('chat-readonly').hidden=self;$('chat-readonly').textContent=admin?'CANAL AUTOMÁTICO // RESPOSTAS DESABILITADAS':'CONTATO EM INDEXAÇÃO // ENVIO INDISPONÍVEL';
  if(admin){for(const message of administrative)list.append(row(message,'INTERAURA'));for(const message of Object.values(incoming).filter(m=>m.contact==='admin'&&typeof m.text==='string').sort((a,b)=>a.at-b.at))list.append(row({at:'SESSÃO ATUAL',text:message.text},'INTERAURA'));}
  else if(self){for(const message of notes)list.append(row(message,'A.CHIYOMI'));for(const [,message] of Object.entries(selfMessages).sort((a,b)=>a[1].at-b[1].at||a[0].localeCompare(b[0])))list.append(row({at:'SESSÃO ATUAL',text:message.text},'A.CHIYOMI'));}
  else if(reika){const recovered=document.createElement('p');recovered.className='messenger-history-gap';recovered.textContent='FRAGMENTO LOCAL RECUPERADO // 28/12/1999\nO cliente conservava em disco apenas blocos recentes de conversas consultadas nesta estação. Mensagens mais antigas eram movidas automaticamente para volumes de arquivo. Esses volumes e seus índices não estão montados; o histórico anterior não pôde ser reconstruído.';list.append(recovered);for(const message of reikaConversation)list.append(row(message,message.author));$('chat-conversation-banner').textContent='R. MIZUHARA // ÚLTIMA CONVERSA RECUPERADA';$('chat-readonly').textContent='CONTATO OFFLINE // ROTA DE ENTREGA NÃO RESTABELECIDA';}
  else if(contact){for(const message of Object.values(incoming).filter(m=>m.contact===selected&&typeof m.text==='string').sort((a,b)=>a.at-b.at))list.append(row({at:'SESSÃO ATUAL',text:message.text},contact.name));$('chat-conversation-banner').textContent=contact.name+' // CONTATO RECUPERADO';$('chat-readonly').textContent='CANAL EM RECUPERAÇÃO // ENVIO INDISPONÍVEL';}else {const p=document.createElement('p');p.className='messenger-unresolved';p.textContent='INTMSG.DLL // RECONSTRUINDO ÍNDICE\n\nNOME: [NÃO RECUPERADO]\nROTA: AGUARDANDO RESPOSTA\nHISTÓRICO: NÃO INDEXADO\n\nO transporte de mensagens foi recuperado. A conexão com este contato ainda não pôde ser estabelecida.';list.append(p);}
  document.querySelectorAll('[data-chat-contact]').forEach(b=>b.classList.toggle('selected',b.dataset.chatContact===selected));if(nearBottom)list.scrollTop=list.scrollHeight;contactBadges();
 }
 document.querySelectorAll('[data-chat-contact]').forEach(b=>b.onclick=()=>{if(!connected)return;if(b.dataset.chatContact.startsWith('broken-')&&!profile(b.dataset.chatContact)){errorSource=b;error.hidden=false;playSystemError();glitchContactError();error.querySelector('button').focus();return;}selected=b.dataset.chatContact;markRead(selected);render();openIrosApp('chat-message');$('chat-message-history').scrollTop=$('chat-message-history').scrollHeight;if(selected==='self')$('chat-compose').focus();});
 $('chat-compose-form').onsubmit=async e=>{e.preventDefault();const input=$('chat-compose'),text=input.value.trim();if(!connected||selected!=='self'||!text||!window.IROSTable?.isController())return;$('chat-send').disabled=true;const messageId=crypto.randomUUID();localSends.add(messageId);try{const next=await rt.transact('session',s=>window.IROSSharedSession.reduce(s,{kind:'chat-self',id:messageId,at:rt.now(),text}));if(!next)throw Error('Sessão indisponível');seenSelf.add(messageId);cue('send');clearTimeout(receiptTimer);receiptTimer=setTimeout(()=>notice('message','self',text),500);if(input.value.trim()===text)input.value='';$('chat-compose-status').textContent='MENSAGEM ENTREGUE À PRÓPRIA CREDENCIAL';window.IROSTable?.recordAction('CHAT INTERNO: MENSAGEM PARA A PRÓPRIA CREDENCIAL');}catch{$('chat-compose-status').textContent='FALHA AO ENVIAR. TENTE NOVAMENTE.';}finally{localSends.delete(messageId);$('chat-send').disabled=false;input.focus();}};
 $('chat-compose').addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();$('chat-compose-form').requestSubmit();}});
 let chatSessionReady=false;
 function activateChat(announce){if(connected)return;connected=true;$('chat-link-state').textContent='CONECTADA';badges();if(!announce)return;cue('login');const tray=$('chat-tray-unread');tray.classList.add('announcing');clearTimeout(connectionAnnounceTimer);connectionAnnounceTimer=setTimeout(()=>tray.classList.remove('announcing'),6500);rt.getState('settings').then(applyChatSettings).catch(()=>{}).finally(()=>{if(!connected)return;const total=Object.values(unread).reduce((sum,n)=>sum+n,0);const popup=window.IROSTrayNotice?.(tray,'CHAT INTERNO CONECTADO','SESSÃO: A.CHIYOMI\nCONEXÃO: ESTABELECIDA\nMENSAGENS PENDENTES: '+total);popup?.classList.add('messenger-connected-balloon');window.IROSLocalCue?.($('iim-connected-audio'),.85);});}
 window.IROSInternalChat={get connected(){return connected;},async open(){if(!connected){if(!window.IROSTable?.isController())return;try{const state=await rt.transact('session',s=>window.IROSSharedSession.reduce(s,{kind:'chat-connect',id:crypto.randomUUID(),at:rt.now()}))||await rt.getState('session');if(!state?.internalChatConnection||state.internalChatConnection.epoch!==state.power?.epoch)return;activateChat(true);}catch{$('chat-link-state').textContent='FALHA AO SINCRONIZAR CONEXÃO';return;}}closeIrosWindow($('chat-login-window'));openIrosApp('chat-list');render();}};

 rt.init().then(()=>rt.onState('session',s=>{if(powerEpoch&&powerEpoch!==s?.power?.epoch||s?.power?.mode==='off'){connected=false;badges();clearTimeout(connectionAnnounceTimer);$('chat-tray-unread').classList.remove('announcing');error.hidden=true;notifications.replaceChildren();clearTimeout(receiptTimer);for(const sound of Object.values(sounds)){sound.pause();sound.currentTime=0;}}powerEpoch=s?.power?.epoch;if(s?.power?.mode==='on'&&s.internalChatConnection?.epoch===powerEpoch)activateChat(chatSessionReady);chatSessionReady=true;const messages=s?.chatSelfMessages||{},ids=new Set(Object.keys(messages));if(initialized)for(const id of ids)if(!seenSelf.has(id)&&!localSends.has(id))pendingMessage('self:'+id,'self',messages[id].text);seenSelf=ids;initialized=true;const next=JSON.stringify(messages);if(next!==signature){signature=next;selfMessages=s?.chatSelfMessages||{};render();}}));
 // Only newly delivered events play cues; loading history establishes a quiet baseline.
 function applyChatSettings(settings){const chat=settings?.internalChat||{},nextContacts=chat.contacts||{};
  const arrivals=contactsInitialized?Object.entries(nextContacts).filter(([id,c])=>c.online===true&&contacts[id]?.online!==true).map(([id])=>id):[];contacts=nextContacts;contactsInitialized=true;updateContacts();for(const id of arrivals)notice('online',id);
  const messages=chat.messages||{},ids=new Set(Object.keys(messages));for(const id of ids)if(typeof messages[id]?.text==='string')pendingMessage('incoming:'+id,messages[id].contact||'admin',messages[id].text);seenIncoming=ids;incomingInitialized=true;incoming=messages;render();
 }
 window.addEventListener('iros-settings',e=>applyChatSettings(e.detail));
 rt.init().then(()=>rt.getState('settings')).then(applyChatSettings).catch(()=>{});
})();
