(function(){
 const form=document.getElementById('control-claim-form'),player=document.getElementById('control-player'),character=document.getElementById('control-character');
 if(!form)return;
 const panel=document.createElement('section');panel.hidden=true;
 panel.innerHTML='<label>E-mail do mestre<input type="email" autocomplete="username" disabled></label><label>Senha do mestre<input type="password" autocomplete="current-password" disabled></label><p role="status"></p>';
 form.insertBefore(panel,form.querySelector('button'));
 const [email,password]=panel.querySelectorAll('input'),message=panel.querySelector('[role=status]');
 let busy=false;
 function syncMode(){const master=player.value.trim().toLowerCase()==='/mestre',active=master&&!window.InterauraRealtime?.discreet;panel.hidden=!active;email.disabled=!active;password.disabled=!active;email.required=active;password.required=active;if(master&&!character.value){character.value='Observador';character.dispatchEvent(new Event('input',{bubbles:true}));}}
 player.addEventListener('input',syncMode);player.addEventListener('change',syncMode);window.addEventListener('pageshow',syncMode);syncMode();
 form.addEventListener('submit',async event=>{
  const rt=window.InterauraRealtime;if(player.value.trim().toLowerCase()!=='/mestre'||rt.discreet)return;
  event.preventDefault();event.stopImmediatePropagation();panel.hidden=false;if(busy)return;busy=true;message.textContent='AUTORIZANDO...';
  try{await rt.init();await rt.enableDiscreet(email.value.trim(),password.value);password.value='';syncMode();message.textContent='MODO DISCRETO AUTORIZADO';form.requestSubmit();}
  catch(error){password.value='';message.textContent=error.message;}
  finally{busy=false;}
 },true);
})();
