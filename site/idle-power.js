(function(root){
 root.IROSIdlePower={expired(participants,power,now){
  if(!power||power.mode!=='on')return false;
  const rows=Object.values(participants||{}).filter(p=>Number.isFinite(p.at));if(!rows.length)return false;
  if(rows.some(p=>p.online!==false&&now-p.at<90000))return false;
  const emptySince=Math.max(...rows.map(p=>p.at+(p.online===false?0:90000)));
  return power.at<=emptySince&&now-emptySince>=300000;
 }};
})(window);
