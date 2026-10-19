(function(root){
 'use strict';
 const clip=(text,max)=>Array.from(String(text||'')).slice(0,max).join('');
 const snapshot=note=>note?{title:String(note.title||'SEM_TITULO.TXT'),text:clip(note.text,20000),truncated:Array.from(String(note.text||'')).length>20000}:null;
 function delta(before,after){const a=Array.from(String(before||'')),b=Array.from(String(after||''));let start=0,end=0;while(start<a.length&&start<b.length&&a[start]===b[start])start++;while(end<a.length-start&&end<b.length-start&&a[a.length-1-end]===b[b.length-1-end])end++;const removed=a.slice(start,a.length-end),added=b.slice(start,b.length-end);return {removed:removed.slice(0,2000).join(''),added:added.slice(0,2000).join(''),removedCount:removed.length,addedCount:added.length,truncated:removed.length>2000||added.length>2000};}
 function changes(previous,patch){const rows=[];for(const [id,note] of Object.entries(patch||{})){const old=previous?.[id]||null;if(!old&&!note)continue;if(old&&note&&old.title===note.title&&String(old.text||'')===String(note.text||''))continue;const renamed=!!(old&&note&&old.title!==note.title),edited=!!(old&&note&&String(old.text||'')!==String(note.text||''));const action=!old?'created':!note?'deleted':renamed&&edited?'renamed-edited':renamed?'renamed':edited&&!String(note.text||'')?'cleared':'edited';const diff=delta(old?.text,note?.text),before=snapshot(old),after=snapshot(note),verbs={created:'CRIADA',deleted:'EXCLUÍDA',edited:'ALTERADA',cleared:'ESVAZIADA',renamed:'RENOMEADA','renamed-edited':'RENOMEADA E ALTERADA'};const name=renamed?before.title+' → '+after.title:(after||before).title;rows.push({text:'NOTA '+verbs[action]+': '+name+(diff.addedCount||diff.removedCount?' // +'+diff.addedCount+' / −'+diff.removedCount+' caracteres':''),note:{id,action,before,after,diff}});}return rows;}
 function render(note){
  const box=document.createElement('details');box.className='audit-note-details';const heading=document.createElement('summary');heading.textContent='Ver alteração do arquivo';box.append(heading);
  const label=document.createElement('p');label.textContent=[note.before?'Anterior: '+note.before.title:'',note.after?'Salvo: '+note.after.title:''].filter(Boolean).join('\n');box.append(label);
  function section(title,text,kind){const caption=document.createElement('b'),pre=document.createElement('pre');caption.textContent=title;pre.className=kind;pre.textContent=text||'(arquivo vazio)';box.append(caption,pre);}
  if(note.diff?.removedCount)section('Trecho anterior',note.diff.removed,'note-removed');
  if(note.diff?.addedCount)section('Trecho salvo',note.diff.added,'note-added');
  if(note.diff?.truncated){const hint=document.createElement('p');hint.textContent='Trechos resumidos. Consulte as versões abaixo.';box.append(hint);}
  for(const [title,value] of [['Versão anterior',note.before],['Versão salva',note.after]]){if(!value)continue;const version=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent=title+(value.truncated?' (até 20 mil caracteres)':'');pre.textContent=value.text||'(arquivo vazio)';version.append(summary,pre);box.append(version);}
  return box;
 }
 root.IROSNotesAudit={changes,delta,render};
})(typeof window==='undefined'?globalThis:window);
