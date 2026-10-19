(function(root){
 'use strict';
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function inline(text,depth=0){
  if(depth>6)return escape(text);
  const tokens=/`([^`\n]+)`|\*\*(.+?)\*\*|~~(.+?)~~|\*([^*\n]+)\*/g;let out='',at=0,m;
  while((m=tokens.exec(text))){out+=escape(text.slice(at,m.index));out+=m[1]!==undefined?'<code>'+escape(m[1])+'</code>':m[2]!==undefined?'<strong>'+inline(m[2],depth+1)+'</strong>':m[3]!==undefined?'<del>'+inline(m[3],depth+1)+'</del>':'<em>'+inline(m[4],depth+1)+'</em>';at=tokens.lastIndex;}
  return out+escape(text.slice(at));
 }
 const special=line=>/^\s*(?:#{1,3}\s|>|```|[-*+]\s|\d+\.\s|(?:-{3,}|\*{3,}|_{3,})\s*$)/.test(line);
 function render(text,depth=0){
  if(depth>8)return '<p>'+escape(text).replace(/\n/g,'<br>')+'</p>';
  const lines=String(text||'').replace(/\r\n?/g,'\n').split('\n');let out='',i=0;
  while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue}
   if(/^\s*```/.test(line)){const code=[];i++;while(i<lines.length&&!/^\s*```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;out+='<pre><code>'+escape(code.join('\n'))+'</code></pre>';continue}
   const heading=line.match(/^\s*(#{1,3})\s+(.+)$/);if(heading){const level=heading[1].length;out+='<h'+level+'>'+inline(heading[2])+'</h'+level+'>';i++;continue}
   if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)){out+='<hr>';i++;continue}
   if(/^\s*>/.test(line)){const quote=[];while(i<lines.length&&/^\s*>/.test(lines[i]))quote.push(lines[i++].replace(/^\s*> ?/,''));out+='<blockquote>'+render(quote.join('\n'),depth+1)+'</blockquote>';continue}
   const first=line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);if(first){const ordered=!!first[2],tag=ordered?'ol':'ul';out+='<'+tag+(ordered?' start="'+Math.min(9999,Number(first[2]))+'"':'')+'>';while(i<lines.length){const item=lines[i].match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);if(!item||!!item[2]!==ordered)break;const task=item[3].match(/^\[([ xX])\]\s+(.*)$/);out+=task?'<li class="note-task"><span aria-label="'+(task[1].toLowerCase()==='x'?'Concluído':'Pendente')+'">'+(task[1].toLowerCase()==='x'?'[x]':'[ ]')+'</span> '+inline(task[2])+'</li>':'<li>'+inline(item[3])+'</li>';i++;}out+='</'+tag+'>';continue}
   const paragraph=[line];i++;while(i<lines.length&&lines[i].trim()&&!special(lines[i]))paragraph.push(lines[i++]);out+='<p>'+paragraph.map(x=>inline(x)).join('<br>')+'</p>';
  }
  return out;
 }
 root.IROSNotesMarkdown={render};
 if(typeof document==='undefined')return;
 const editor=document.querySelector('.notepad-editor'),text=document.getElementById('notepad-text');if(!editor||!text)return;
 const bar=document.createElement('div');bar.className='notepad-formatbar';bar.setAttribute('aria-label','Formatação da anotação');
 const modes=document.createElement('div');modes.className='notepad-modebar';
 modes.innerHTML='<button type="button" data-note-mode="edit" aria-pressed="true">EDITAR</button><button type="button" data-note-mode="read" aria-pressed="false">VISUALIZAR</button><button type="button" data-note-help aria-expanded="false">AJUDA</button>';
 const tools=[['bold','N','Negrito — **texto**'],['italic','I','Itálico — *texto*'],['strike','RISCAR','Riscado — ~~texto~~'],['heading','TÍTULO','Título — ## texto'],['quote','CITAÇÃO','Citação — > texto'],['list','LISTA','Lista — - item'],['task','TAREFA','Tarefa — - [ ] item'],['code','CÓDIGO','Código — `texto`']];
 for(const [kind,label,title] of tools){const button=document.createElement('button');button.type='button';button.dataset.noteFormat=kind;button.textContent=label;button.title=title;button.setAttribute('aria-label',title);bar.append(button)}
 const preview=document.createElement('article');preview.id='notepad-preview';preview.className='notepad-preview';preview.hidden=true;preview.setAttribute('aria-label','Anotação formatada');
 const help=document.createElement('div');help.className='notepad-markdown-help';help.hidden=true;help.textContent='## Título · **negrito** · *itálico* · ~~riscado~~\n> Citação (comece cada linha com >)\n- Item · 1. Item · - [ ] Pendente · - [x] Concluído\n`código` · três crases para um bloco · --- para separar\nUse VISUALIZAR para ler com formatação. SALVAR compartilha o texto com todos.';
 text.before(modes,bar,help);text.after(preview);let mode='edit';
 function refresh(){if(mode==='read')preview.innerHTML=render(text.value)||'<p class="note-empty">ARQUIVO VAZIO</p>'}
 function setMode(next){mode=next;text.hidden=mode==='read';preview.hidden=mode!=='read';bar.hidden=mode==='read';for(const b of modes.querySelectorAll('[data-note-mode]'))b.setAttribute('aria-pressed',String(b.dataset.noteMode===mode));refresh()}
 modes.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(button.dataset.noteMode)setMode(button.dataset.noteMode);else{help.hidden=!help.hidden;button.setAttribute('aria-expanded',String(!help.hidden))}});
 function format(kind){
  setMode('edit');const start=text.selectionStart,end=text.selectionEnd,selection=text.value.slice(start,end),wraps={bold:['**','**'],italic:['*','*'],strike:['~~','~~'],code:['`','`']};let replacement,selectionStart,selectionEnd;
  if(wraps[kind]){const [a,b]=wraps[kind],value=selection||'texto';replacement=a+value+b;selectionStart=start+a.length;selectionEnd=selectionStart+value.length;text.setRangeText(replacement,start,end,'select')}
  else{const a=text.value.lastIndexOf('\n',start-1)+1,last=text.value.indexOf('\n',end),b=last<0?text.value.length:last,part=text.value.slice(a,b)||'texto',prefix={heading:'## ',quote:'> ',list:'- ',task:'- [ ] '}[kind];replacement=part.split('\n').map(line=>prefix+line).join('\n');text.setRangeText(replacement,a,b,'select');selectionStart=a;selectionEnd=a+replacement.length;}
  text.focus();text.setSelectionRange(selectionStart,selectionEnd);text.dispatchEvent(new Event('input',{bubbles:true}));
 }
 bar.addEventListener('click',e=>{const kind=e.target.closest('[data-note-format]')?.dataset.noteFormat;if(kind)format(kind)});
 text.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const key=e.key.toLowerCase();if(key==='b'||key==='i'){e.preventDefault();format(key==='b'?'bold':'italic')}});
 const originalLoad=loadActiveNote;loadActiveNote=function(){const result=originalLoad();refresh();return result};
 document.getElementById('note-new').addEventListener('click',()=>setMode('edit'),true);
 for(const id of ['note-save','note-delete','note-rename'])document.getElementById(id).addEventListener('click',()=>setTimeout(refresh,0));
})(typeof window==='undefined'?globalThis:window);
