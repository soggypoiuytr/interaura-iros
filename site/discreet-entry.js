(function(){
 const form=document.getElementById('control-claim-form'),player=document.getElementById('control-player'),character=document.getElementById('control-character');
 if(!form)return;
 const panel=document.createElement('section');panel.hidden=true;
 panel.innerHTML='<label>E-mail do mestre<input type="email" autocomplete="username"></label><label>Senha do mestre<input type="password" autocomplete="current-password"></label><p role="status"></p>';
 form.insertBefore(panel,form.querySelector('button'));
 const [email,password]=panel.querySelectorAll('input'),message=panel.querySelector('[role=status]');
 let busy=false;
 player.addEventListener('input',()=>{const active=player.value.trim().toLowerCase()==='/mestre';panel.hidden=!active;email.required=active;password.required=active;if(active&&!character.value){character.value='Observador';character.dispatchEvent(new Event('input',{bubbles:true}));}});
 form.addEventListener('submit',async event=>{
  const rt=window.InterauraRealtime;if(player.value.trim().toLowerCase()!=='/mestre'||rt.discreet)return;
  event.preventDefault();event.stopImmediatePropagation();panel.hidden=false;if(busy)return;busy=true;message.textContent='AUTORIZANDO...';
  try{await rt.init();await rt.enableDiscreet(email.value.trim(),password.value);password.value='';password.required=false;message.textContent='MODO DISCRETO AUTORIZADO';form.requestSubmit();}
  catch(error){password.value='';message.textContent=error.message;}
  finally{busy=false;}
 },true);
})();
