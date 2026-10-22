'use strict';
const names={CORPO:'body',MENTE:'mind',REFLEXO:'reflex',INFLUENCIA:'influence',ENERGIA:'energy'};
function normalize(text){return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/<a?:\w+:\d+>/g,'').replace(/[*_`>#]/g,'').toUpperCase().split(/\r?\n/).map(line=>line.replace(/^[^A-Z0-9+-]+/u,'').trim());}
function parseSheet(text){
 const lines=normalize(text),start=lines.findIndex(line=>line==='ATRIBUTOS');
 if(start<0)return {ok:false,reason:'Seção ATRIBUTOS não encontrada.'};
 const attributes={},errors=[];let pending=null;
 function put(key,value){if(key in attributes)errors.push('Atributo repetido: '+key);if(!/^-?\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Math.abs(Number(value))>1000000||(key==='remaining'&&Number(value)<0))errors.push('Valor inválido: '+key);else attributes[key]=Number(value);}
 for(const line of lines.slice(start+1)){
  if(!line||/^[\s\-─━=]+$/.test(line))continue;
  if(/^(PERICIAS|HABILIDADES|INVENTARIO|EQUIPAMENTOS|HISTORIA|STATUS|ATRIBUTOS|MODULO\b)/.test(line))break;
  const remaining=line.match(/^PONTOS DE ATRIBUTOS RESTANTES\s*:\s*(.*?)\s*$/);
  if(remaining){put('remaining',remaining[1]);pending=null;continue;}
  const heading=line.match(/^(CORPO|MENTE|REFLEXO|INFLUENCIA|ENERGIA)\b(.*)$/);
  if(heading){if(pending)errors.push('Valor ausente: '+pending);pending=names[heading[1]];const value=heading[2].match(/:\s*([^:]+)\s*$/);if(value){put(pending,value[1].trim());pending=null;}continue;}
  const value=line.match(/^VALOR\s*:\s*(.*?)\s*$/);if(value&&pending){put(pending,value[1]);pending=null;}
 }
 if(pending)errors.push('Valor ausente: '+pending);
 for(const key of ['remaining',...Object.values(names)])if(!(key in attributes))errors.push('Campo ausente: '+key);
 if(errors.length)return {ok:false,reason:errors.join('; ')};
 const levels=lines.slice(0,start).map(line=>line.match(/^NIVEL DE EXPERIENCIA\s*:\s*(\d+)\s*$/)).filter(Boolean).map(match=>Number(match[1]));
 const assimilationLevel=levels.length===1&&Number.isSafeInteger(levels[0])&&levels[0]<=1000000?levels[0]:null;
 return {ok:true,attributes,assimilationLevel};
}
function moduleKey(value){const match=String(value).trim().toUpperCase().match(/^(?:MOD(?:ULO)?[-\s]*)?(\d{1,3})(-\d+)?$/);if(!match)throw Error('Módulo inválido');return String(Number(match[1])).padStart(2,'0')+(match[2]||'');}
function selectSheet(messages,mapping){
 const ordered=messages.filter(m=>!m.bot&&(!mapping.authorIds?.length||mapping.authorIds.includes(m.authorId))).sort((a,b)=>BigInt(a.id)<BigInt(b.id)?-1:1);
 let selected;
 if(mapping.messageIds?.length){selected=mapping.messageIds.map(id=>ordered.find(m=>m.id===id));if(selected.some(m=>!m))return {ok:false,reason:'Uma mensagem de ficha configurada foi excluída ou não pôde ser lida.'};}
 else{const headers=ordered.filter(m=>normalize(m.content).includes('ATRIBUTOS'));const header=headers.at(-1);if(!header)return {ok:false,reason:'Nenhuma seção ATRIBUTOS nas mensagens consultadas.'};const authorMessages=ordered.filter(m=>m.authorId===header.authorId),index=authorMessages.indexOf(header);let first=index;for(let i=index-1;i>=Math.max(0,index-6);i--){const lines=normalize(authorMessages[i].content);if(lines.includes('ATRIBUTOS'))break;if(lines.some(line=>/^NIVEL DE EXPERIENCIA\s*:/.test(line))){first=i;break;}if(lines.some(line=>/^MODULO\b/.test(line)))break;}selected=authorMessages.slice(first,index+12);}
 const content=selected.map(m=>m.content).join('\n'),declared=normalize(content).map(line=>line.match(/^MODULO\s*[- ]?\s*(\d+(?:-\d+)?)\s*$/)).filter(Boolean);
 if(declared.some(m=>moduleKey(m[1])!==moduleKey(mapping.module)))return {ok:false,reason:'O módulo declarado na ficha não corresponde ao canal configurado.'};
 const result=parseSheet(content);return result.ok?{...result,messageIds:selected.map(m=>m.id)}:result;
}
module.exports={parseSheet,selectSheet,moduleKey};
