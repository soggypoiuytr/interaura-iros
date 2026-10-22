(function(root){
 'use strict';
 // Absolute event time makes delayed delivery catch up instead of replaying.
 function frame(length,age,id,profile){
  if(profile==='khyrentuk')return threateningFrame(length,age,id);
  age=Math.max(0,age);const duration=Math.min(6000,Math.max(400,length*9));
  let hash=0;for(const c of String(id))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
  const tick=Math.floor(age/40),ticks=Math.ceil(duration/40),progress=Math.min(1,tick/ticks);
  const index=age>=duration?length:Math.min(length,Math.floor(length*progress));
  const period=880+(hash%5)*120,offset=240+hash%280,joltAge=(age-offset)%period;
  return {index,done:age>=duration,jolt:age>=offset&&age<duration&&joltAge>=0&&joltAge<160,joltAge:Math.max(0,joltAge)};
 }
 function threateningFrame(length,age,id){
  age/=1.25; // Stretch speech, hesitations and glitches together.
  age=Math.max(0,age);const duration=Math.min(24000,Math.max(2400,length*65));
  let hash=0;for(const c of String(id))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;
  // Seeded bursts and hesitations keep every viewer on the same clock.
  const cycle=1300+hash%300,moving=cycle-(380+hash%180);
  const elapsed=t=>Math.floor(t/cycle)*moving+Math.min(t%cycle,moving);
  const progress=Math.min(1,elapsed(Math.floor(age/65)*65)/elapsed(duration));
  const joltAge=(age-(210+hash%200))%(1050+hash%170);
  return {index:age>=duration?length:Math.floor(length*progress),done:age>=duration,jolt:age<duration&&joltAge>=0&&joltAge<260,joltAge:Math.max(0,joltAge)};
 }
 root.IROSTerminalTimeline={frame};
})(typeof window==='undefined'?globalThis:window);
