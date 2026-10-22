(function(){
 'use strict';
 const plain=value=>{const t=document.createElement('template');t.innerHTML=String(value||'').replace(/<br\s*\/?>/gi,'\n');return t.content.textContent.trim();};
 function get(module){
  if(module==='49-1'){
   const t=document.createElement('template');t.innerHTML=derivedModuleDocument();const facts={};for(const row of t.content.querySelectorAll('.record-facts>div'))facts[row.querySelector('dt')?.textContent.trim()]=row.querySelector('dd')?.textContent.trim();
   return {image:t.content.querySelector('.profile-layout img')?.getAttribute('src'),status:'ATIVO / VIVO',classe:facts['CLASSIFICAÇÃO OPERACIONAL'],compat:null,contemplador:'INCERTO',sequelas:facts['COMPOSIÇÃO BIOLÓGICA'],manifestacoes:[facts['CONDIÇÃO OCULAR']],sections:[...t.content.querySelectorAll('.record-section')].map(section=>({title:section.querySelector('h4')?.textContent,text:plain(section.innerHTML.replace(/<h4[\s\S]*?<\/h4>/i,''))}))};
  }
  const r=records[Number(module)];if(!r||r.placeholder)return ['11','67'].includes(module)?{pending:true,contemplador:'KRYTUX',image:'assets/portraits/mod-'+module+'-unreachable-v2.webp',portraitUncertain:true}:null;
  return {...r,contemplador:[4,11,24,35,49,67].includes(Number(module))?'KRYTUX':'INCERTO'};
 }
 function status(module){
  if(module==='06')return 'TELEMETRIA DA ARMADURA\nCOMANDOS MOTORES: RESPOSTA PRESENTE\nVÍNCULO DE CONTROLE CONSCIENTE: DETECTADO\nOCUPANTE BIOLÓGICO LOCAL: NÃO DETECTADO\nATIVIDADE ENCEFÁLICA LOCAL: NÃO AFERÍVEL\nCIRCULAÇÃO / RESPIRAÇÃO: SEM LEITURA DO HOSPEDEIRO\nINTEGRIDADE ESTRUTURAL: DIAGNÓSTICO NÃO CONCLUÍDO\n\nAUSÊNCIA DE CORPO LOCAL NÃO CONSTITUI CONFIRMAÇÃO DE ÓBITO.\nDADOS DO PRONTUÁRIO NÃO SUBSTITUEM TELEMETRIA DO ORGANISMO REMOTO.';
  const r=get(module);if(!r||r.pending)return 'LEITURAS CORPORAIS\nPRONTUÁRIO: EM RECONSTRUÇÃO\nCLASSIFICAÇÃO: NÃO INDEXADA\nCOMPATIBILIDADE CRYPTUM: SEM LEITURA\nCONTEMPLADOR: '+(r?.contemplador||'SEM LEITURA');
  const readings={
   '06':['MALHA NEURAL DO BRAÇO: PRESENTE','MATRIZ DE LÂMINA CRYPTUM: REGISTRADA','VÍNCULO COM ARMADURA HAKUREI: COMPATÍVEL','ALERTA: SOBRECARGA TÉRMICA / PERDA DE SENSIBILIDADE'],
   '42':['ALTERAÇÃO MORFOLÓGICA: VULPINA','SENSIBILIDADE OLFATIVA: AMPLIADA','REGENERAÇÃO POR CONSUMO ORGÂNICO: REGISTRADA','ALERTA: REJEIÇÃO INTERMITENTE'],
   '49-1':['COMPOSIÇÃO CORPORAL: INTEGRALMENTE CRYPTUM','TECIDO HUMANO: AUSENTE','CORRESPONDÊNCIA GENÉTICA COM MOD-49: NEGATIVA','OLHO ESQUERDO: VISÃO NORMAL','OLHO DIREITO: DANIFICADO / VISÃO RESIDUAL ATÉ APROXIMADAMENTE 8 METROS','ALERTA: DESCARGAS ELETROAURÍTICAS INVOLUNTÁRIAS']
  };
  return ['LEITURAS CORPORAIS','CONDIÇÃO REGISTRADA: '+r.status,'CLASSIFICAÇÃO: '+r.classe,'COMPATIBILIDADE NO PRONTUÁRIO: '+(r.compat||'NÃO DETERMINADA'),'CONTEMPLADOR: '+r.contemplador,'',...(readings[module]||['LEITURA COMPLEMENTAR: AGUARDANDO INDEXAÇÃO'])].join('\n');
 }
 window.IIMModuleRecords={get,status};
})();
