(function(root){
 'use strict';
 function create(random=Math.random){
  const s={mines:new Set(),flags:new Set(),opened:new Set(),started:false,ended:false,won:false};
  s.neighbors=i=>{const list=[],x=i%9,y=Math.floor(i/9);for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)if(xx>=0&&xx<9&&yy>=0&&yy<9&&(xx!==x||yy!==y))list.push(yy*9+xx);return list;};
  s.count=i=>s.neighbors(i).filter(n=>s.mines.has(n)).length;
  s.flag=i=>{if(s.ended||s.opened.has(i))return false;if(s.flags.has(i))s.flags.delete(i);else{if(s.flags.size===10)return false;s.flags.add(i);}return true;};
  s.open=i=>{
   if(s.ended||s.flags.has(i)||s.opened.has(i))return {kind:'ignored',cells:[]};
   if(!s.started){const safe=new Set([i,...s.neighbors(i)]),pool=Array.from({length:81},(_,n)=>n).filter(n=>!safe.has(n));for(let j=pool.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[pool[j],pool[k]]=[pool[k],pool[j]];}pool.slice(0,10).forEach(n=>s.mines.add(n));s.started=true;}
   if(s.mines.has(i)){s.ended=true;return {kind:'loss',cells:[i]};}
   const stack=[i],cells=[];while(stack.length){const n=stack.pop();if(s.opened.has(n)||s.flags.has(n)||s.mines.has(n))continue;s.opened.add(n);cells.push(n);if(!s.count(n))stack.push(...s.neighbors(n));}
   if(s.opened.size===71){s.ended=true;s.won=true;s.flags=new Set(s.mines);return {kind:'win',cells};}
   return {kind:cells.length>1?'area':'click',cells};
  };return s;
 }
 root.IROSMinefield={create};
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id),board=$('mine-grid');if(!board)return;
 const sounds=Object.fromEntries(['click','flag','reveal-area','hit-bomb','reveal-bomb','victory'].map(name=>[name,new Audio('assets/audio/mines/'+name+'.wav')]));
 for(const sound of Object.values(sounds))sound.preload='auto';
 const cue=(name,volume=.6)=>playTransientSound(sounds[name],volume);
 let game,timer,seconds=0,markMode=false,revealTimers=[],shownMines=new Set(),detonated=-1;
 function render(){
  $('mine-count').textContent=String(10-game.flags.size).padStart(3,'0');
  $('mine-progress').textContent='SETORES SEGUROS: '+String(game.opened.size).padStart(2,'0')+' / 71';
  board.dataset.state=game.won?'won':game.ended?'lost':'active';
  for(const cell of board.children){const i=Number(cell.dataset.index),open=game.opened.has(i),flag=game.flags.has(i),mine=shownMines.has(i),count=open?game.count(i):0,wrong=game.ended&&!game.won&&flag&&!game.mines.has(i);
   cell.className='mine-cell'+(open||mine?' open':'')+(flag?' flagged':'')+(mine?' mine':'')+(wrong?' wrong-flag':'')+(i===detonated?' detonated':'');
   cell.dataset.count=String(count);cell.textContent=mine?'':flag?'':count||'';cell.disabled=game.ended;
   cell.setAttribute('aria-label','Linha '+(Math.floor(i/9)+1)+', coluna '+(i%9+1)+': '+(mine?'mina':wrong?'bandeira incorreta':flag?'bandeira':open?(count?count+' minas próximas':'setor vazio'):'fechado'));
  }
 }
 function flag(i){if(game.flag(i)){cue('flag',.58);render();}}
 function open(i){
  if(markMode){flag(i);return;}const wasStarted=game.started,result=game.open(i);if(result.kind==='ignored')return;
  if(!wasStarted&&!game.ended)timer=setInterval(()=>{$('mine-time').textContent=String(seconds=Math.min(999,seconds+1)).padStart(3,'0');},1000);
  if(result.kind==='loss'){
   clearInterval(timer);detonated=i;shownMines.add(i);cue('hit-bomb',.82);$('mine-reset').textContent=':-(';$('mine-message').textContent='FALHA // SETOR MINADO ACIONADO.';
   [...game.mines].filter(n=>n!==i).forEach((n,j)=>revealTimers.push(setTimeout(()=>{shownMines.add(n);cue('reveal-bomb',.36);render();},150+j*90)));
  }else if(result.kind==='win'){clearInterval(timer);cue('victory',.75);$('mine-reset').textContent=':-D';$('mine-message').textContent='VARREDURA CONCLUÍDA // TODOS OS SETORES SEGUROS.';}
  else cue(result.kind==='area'?'reveal-area':'click',result.kind==='area'?.56:.48);
  render();
 }
 function reset(){
  clearInterval(timer);revealTimers.forEach(clearTimeout);revealTimers=[];game=create();shownMines=new Set();detonated=-1;seconds=0;markMode=false;
  $('mine-time').textContent='000';$('mine-reset').textContent=':-)';$('mine-flag-mode').setAttribute('aria-pressed','false');$('mine-message').textContent='ABRIR: CLIQUE // BANDEIRA: DIREITO OU F';board.replaceChildren();
  for(let i=0;i<81;i++){const cell=document.createElement('button');cell.type='button';cell.className='mine-cell';cell.dataset.index=i;cell.addEventListener('click',()=>open(i));cell.addEventListener('contextmenu',e=>{e.preventDefault();flag(i);});cell.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'){e.preventDefault();flag(i);}});board.append(cell);}render();
 }
 $('mine-reset').onclick=reset;$('mine-new').onclick=reset;
 $('mine-flag-mode').onclick=()=>{markMode=!markMode;$('mine-flag-mode').setAttribute('aria-pressed',String(markMode));$('mine-message').textContent=markMode?'MARCAÇÃO ATIVA // CLIQUE PARA COLOCAR OU TIRAR BANDEIRA.':'ABRIR: CLIQUE // BANDEIRA: DIREITO OU F';};
 let lastPowerPhase=document.body.dataset.irosPhase;new MutationObserver(()=>{const phase=document.body.dataset.irosPhase;if(phase===lastPowerPhase)return;lastPowerPhase=phase;if(phase!=='desktop')reset();}).observe(document.body,{attributes:true,attributeFilter:['data-iros-phase']});
 reset();
})(typeof window==='undefined'?globalThis:window);
