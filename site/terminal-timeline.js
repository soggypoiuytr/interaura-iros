(function(root){
 'use strict';
 // Absolute event time makes delayed delivery catch up instead of replaying.
 function frame(length,age,id){
  age=Math.max(0,age);const duration=Math.min(6000,Math.max(400,length*9));
  let hash=0;for(const c of String(id))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
  const tick=Math.floor(age/40),ticks=Math.ceil(duration/40),progress=Math.min(1,tick/ticks);
  const index=age>=duration?length:Math.min(length,Math.floor(length*progress));
  const period=880+(hash%5)*120,offset=240+hash%280,joltAge=(age-offset)%period;
  return {index,done:age>=duration,jolt:age>=offset&&age<duration&&joltAge>=0&&joltAge<160,joltAge:Math.max(0,joltAge)};
 }
 root.IROSTerminalTimeline={frame};
})(typeof window==='undefined'?globalThis:window);
