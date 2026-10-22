(function(){
 'use strict';
 const selector=['img','svg','.desktop-icon-glyph','.iros-pixel-icon','.menu-pixel-icon','.menu-mini-icon','.menu-game-icon','.menu-audio-icon','.menu-chat-icon','.menu-power-icon','.iros-start-emblem','.tree-state-icon','.iros-audio-file-icon','.recovered-audio-icon','.chat-desktop-icon','.explorer-file-icon','.messenger-contact-icon','.messenger-contact-photo','.iim-shortcut-icon','.cryptum-scanner-icon','.iros-information-icon','.audit-icon','[data-icon]','.iros-window-controls button','[data-window-action]','#iros-loading-cursor'].join(',');
 const variables=['--cryptum-icon-delay','--cryptum-icon-speed','--cryptum-icon-shift'];
 const affected=new Set();
 let takeover;
 function reset(){takeover?.remove();takeover=null;for(const node of affected){node.classList.remove('cryptum-icon-overridden');for(const property of variables)node.style.removeProperty(property);}affected.clear();}
 function sync(progress){
  const fraction=Math.min(1,Math.max(0,(progress-.5)/.34));if(!fraction){reset();return;}
  if(!takeover){takeover=document.createElement('div');takeover.className='cryptum-screen-takeover';takeover.setAttribute('aria-hidden','true');const symbol=document.createElement('span');symbol.className='cryptum-takeover-symbol';takeover.append(symbol);document.body.append(takeover);}
  const growth=Math.min(1,Math.max(0,(progress-.5)/.5));
  takeover.style.setProperty('--takeover-scale',String(.65+growth*.35));
  takeover.style.setProperty('--takeover-opacity',String(.22+growth*.22));
  takeover.style.setProperty('--takeover-speed',(.8-growth*.68)+'s');
  takeover.style.setProperty('--takeover-shift',(2+growth*12)+'px');
  takeover.classList.toggle('critical',growth>.6);
  const symbols=[...document.querySelectorAll('button')].filter(node=>/^[×_□■▶◀►◄▸▾▲▼⏮⏭⏵⏸⏹+−–↻→←⌂▧⚙]+$/u.test(node.textContent.trim()));
  const found=[...new Set([...document.querySelectorAll(selector),...symbols])],icons=found.filter(node=>!found.some(parent=>parent!==node&&parent.contains(node))),limit=Math.ceil(icons.length*fraction);
  icons.forEach((node,index)=>{if(index>=limit)return;if(!affected.has(node)){affected.add(node);node.style.setProperty('--cryptum-icon-delay',(-index*.079)+'s');node.classList.add('cryptum-icon-overridden');}node.style.setProperty('--cryptum-icon-speed',(.8-fraction*.65)+'s');node.style.setProperty('--cryptum-icon-shift',(1+fraction*11)+'px');});
 }
 window.IROSCryptumIcons={sync,reset};
})();
