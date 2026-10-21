(function(root){
 'use strict';let sheets={};const keys=['remaining','body','mind','reflex','influence','energy'];
 function valid(attributes){return !!attributes&&keys.every(key=>Number.isSafeInteger(attributes[key])&&Math.abs(attributes[key])<=1000000)&&(attributes.remaining>=0);}
 function apply(html,module){const record=sheets[String(module).padStart(2,'0')];if(!record)return html;const ready=record.status==='synced'&&valid(record.attributes),a=record.attributes||{},value=key=>ready?a[key]:'NÃO DISPONÍVEL';
  const lines=['ATRIBUTOS','PONTOS DE ATRIBUTOS RESTANTES: '+value('remaining'),'CORPO - Força e Vigor: '+value('body'),'MENTE - Inteligência e Técnica: '+value('mind'),'REFLEXO - Destreza e Percepção: '+value('reflex'),'INFLUÊNCIA - Lábia e Moral: '+value('influence'),'ENERGIA - Poder Aurítico e Concentração: '+value('energy'),ready?'FONTE: FICHA DISCORD / SINCRONIZADA':'FONTE: FICHA DISCORD / LEITURA INDISPONÍVEL'].join('\n');
  return html.replace(/ATRIBUTOS\nPONTOS DE ATRIBUTOS RESTANTES:[\s\S]*?(?:\n\n(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])|(?=<\/pre>))/u,lines+'\n\n');
 }
 function answer(command,module,text){
  const c=command.trim().toUpperCase();
  if(c==='STATUS'||c==='FICHA')return apply(text('STATUS DO SISTEMA CORPORAL // MOD-'+module+'\n\nCONEXÃO IIM\nACOPLAMENTO VASCULAR: ESTABELECIDO\nINTERFACE NEURAL: ATIVA\n\nATRIBUTOS\nPONTOS DE ATRIBUTOS RESTANTES: NÃO DISPONÍVEL\n\nLEITURAS COMPLEMENTARES\nPROTOCOLO OCULAR PADRÃO: REGISTRADO\nLEITURA OCULAR INDIVIDUAL: NÃO RECUPERADA','iim'),module);
  if(c==='HELP')return text('COMANDOS IIM // MOD-'+module+'\n\nSTATUS / FICHA - Atributos sincronizados do Discord\nIMPLEMENT SAMPLE - Implementa a amostra (Y/N)\nDESTROY SAMPLE - Destrói a amostra (Y/N)\nDISCONNECT - Libera o hospedeiro\nCLEAR - Limpa o console','help');
  if(c==='OCULAR'||c==='OCULAR ACTIVATE')return text('PROTOCOLO OCULAR PADRÃO: REGISTRADO\nLEITURA INDIVIDUAL: AINDA NÃO INDEXADA\nROTINA DE REATIVAÇÃO NESTE CONSOLE: NÃO RECUPERADA\n\nA indisponibilidade da rotina não indica ausência de implante. Consulte as limitações anatômicas do prontuário.','warning');
  return text('COMANDO IIM NÃO RECONHECIDO. Digite HELP.','error');
 }
 const api={valid,apply,answer,set(value){sheets=value&&typeof value==='object'?value:{};}};root.IROSCharacterAttributes=api;if(typeof module==='object')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
