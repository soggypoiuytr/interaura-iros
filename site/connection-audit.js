(function(root){
 root.IROSConnectionAudit={departures(participants,now){
  return Object.entries(participants||{}).filter(([,p])=>Number.isFinite(p.at)&&(p.online===false||now-p.at>=19000)).map(([clientId,p])=>({
   id:p.leaveId||'disconnect-'+clientId,
   at:p.online===false?p.at:p.at+19000,
   text:'DESCONECTOU-SE DA CREDENCIAL IROS',kind:'disconnection',
   playerName:p.playerName||'',characterName:p.characterName||'',clientId,authUid:p.authUid||null
  }));
 }};
})(window);
