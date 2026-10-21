(function(root){
 root.IROSConnectionAudit={departures(participants,now){
  return Object.entries(participants||{}).filter(([,p])=>Number.isFinite(p.at)&&p.online===false).map(([clientId,p])=>({
   id:p.leaveId||'disconnect-'+clientId,
   at:p.at,
   text:'DESCONECTOU-SE DA CREDENCIAL IROS',kind:'disconnection',
   playerName:p.playerName||'',characterName:p.characterName||'',clientId,authUid:p.authUid||null
  }));
 }};
})(window);
