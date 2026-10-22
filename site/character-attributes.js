(function(root){
 'use strict';let sheets={},localSheets={},sourceSheets=null;const keys=['remaining','body','mind','reflex','influence','energy'];
 function valid(attributes){return !!attributes&&keys.every(key=>Number.isSafeInteger(attributes[key])&&Math.abs(attributes[key])<=1000000)&&(attributes.remaining>=0);}
 function apply(html,module){html=html.replace(/<span class="iim-assimilation-level">[^<]*<\/span>\n\n/g,'');const record=sheets[String(module).padStart(2,'0')];if(!record)return html;const ready=record.status==='synced'&&valid(record.attributes),a=record.attributes||{},value=key=>ready?a[key]:'NÃO DISPONÍVEL';
  const lines=['ATRIBUTOS','PONTOS DE ATRIBUTOS RESTANTES: '+value('remaining'),'CORPO - Força e Vigor: '+value('body'),'MENTE - Inteligência e Técnica: '+value('mind'),'REFLEXO - Destreza e Percepção: '+value('reflex'),'INFLUÊNCIA - Lábia e Moral: '+value('influence'),'ENERGIA - Poder Aurítico e Concentração: '+value('energy'),ready?'FONTE: REGISTRO BIOMÉTRICO / SINCRONIZADO':'FONTE: REGISTRO BIOMÉTRICO / LEITURA INDISPONÍVEL'].join('\n');
  const level=Number.isSafeInteger(record.assimilationLevel)&&record.assimilationLevel>=0?record.assimilationLevel:'NÃO INDEXADO';
  return html.replace(/ATRIBUTOS\nPONTOS DE ATRIBUTOS RESTANTES:[\s\S]*?(?:\n\n(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])|(?=<\/pre>))/u,'<span class="iim-assimilation-level">NÍVEL DE ASSIMILAÇÃO: '+level+'</span>\n\n'+lines+'\n\n');
 }
 function answer(command,module,text,ocular=false){
  const c=command.trim().toUpperCase();
  if(module==='06'&&(c==='STATUS'||c==='FICHA'))return apply(text('STATUS DA ARMADURA REMOTA // MOD-06\n\nCONEXÃO IIM\nUNIDADE ACOPLADA: ARMADURA REMOTA\nCONTROLE: CONSCIÊNCIA DO MOD-06 / REMOTO\nCORPO DO HOSPEDEIRO: AUSENTE\nACOPLAMENTO VASCULAR: NÃO ESTABELECIDO\nINTERFACE DE CONTROLE: RESPONSIVA\nSINAIS VITAIS DO HOSPEDEIRO: SEM LEITURA\n\nATRIBUTOS\nPONTOS DE ATRIBUTOS RESTANTES: NÃO DISPONÍVEL\n\nLEITURAS COMPLEMENTARES\nINTERFACE OCULAR DO HOSPEDEIRO: SEM LEITURA','iim'),module);
  if(c==='STATUS'||c==='FICHA')return apply(text('STATUS DO SISTEMA CORPORAL // MOD-'+module+'\n\nCONEXÃO IIM\nACOPLAMENTO VASCULAR: ESTABELECIDO\nINTERFACE NEURAL: ATIVA\n\nATRIBUTOS\nPONTOS DE ATRIBUTOS RESTANTES: NÃO DISPONÍVEL\n\nLEITURAS COMPLEMENTARES\nINTERFACE OCULAR: '+(ocular?'ATIVA':'DORMENTE'),'iim'),module);
  if(module==='06'&&c==='HELP')return text('COMANDOS IIM // MOD-06 / ARMADURA REMOTA\n\nSTATUS - Consulta a telemetria da armadura\nOCULAR - Informa os limites da leitura remota\nDISCONNECT - Encerra o vínculo da IIM com a armadura\nCLEAR - Limpa o console\n\nIMPLEMENTAÇÃO E REATIVAÇÃO OCULAR EXIGEM ACESSO AO CORPO DO HOSPEDEIRO.','help');
  if(c==='HELP')return text('COMANDOS IIM // MOD-'+module+'\n\nSTATUS - Consulta os parâmetros corporais\nIMPLEMENT SAMPLE - Implementa a amostra (Y/N)\nDESTROY SAMPLE - Destrói a amostra (Y/N)\nDISCONNECT - Libera o hospedeiro\nCLEAR - Limpa o console','help');
  if(c==='OCULAR'||c==='OCULAR ACTIVATE')return text('INTERFACE OCULAR: '+(ocular?'ATIVA':'DORMENTE'),'iim');
  return text('COMANDO IIM NÃO RECONHECIDO. Digite HELP.','error');
 }
 const api={valid,apply,answer,set(value){localSheets=value&&typeof value==='object'?value:{};sheets=sourceSheets||localSheets;},setSource(value){sourceSheets=value&&typeof value==='object'?value:null;sheets=sourceSheets||localSheets;}};root.IROSCharacterAttributes=api;if(typeof module==='object')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
