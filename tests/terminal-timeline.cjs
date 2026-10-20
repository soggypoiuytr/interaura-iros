const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const contexts=[{},{}];for(const c of contexts){vm.createContext(c);vm.runInContext(fs.readFileSync('site/terminal-timeline.js','utf8'),c);}
const a=contexts[0].IROSTerminalTimeline,b=contexts[1].IROSTerminalTimeline;
for(let age=0;age<=7000;age+=40)assert.deepEqual(JSON.parse(JSON.stringify(a.frame(800,age,'event'))),JSON.parse(JSON.stringify(b.frame(800,age,'event'))));
assert(a.frame(800,2500,'event').index>0);assert.equal(a.frame(800,7000,'event').index,800);assert(a.frame(800,7000,'event').done);
let last=0;for(let age=0;age<6500;age+=17){const f=a.frame(800,age,'event');assert(f.index>=last);last=f.index;}
assert(Array.from({length:150},(_,i)=>a.frame(800,i*40,'event')).some(f=>f.jolt));
let previous=0,pauses=0;for(let age=0;age<=25000;age+=65){const f=a.frame(180,age,'khyrentuk-test','khyrentuk');assert.deepEqual(JSON.parse(JSON.stringify(f)),JSON.parse(JSON.stringify(b.frame(180,age,'khyrentuk-test','khyrentuk'))));assert(f.index>=previous);if(f.index===previous&&!f.done)pauses++;previous=f.index;}
assert(pauses>10);assert(!a.frame(180,6000,'khyrentuk-test','khyrentuk').done);assert(a.frame(180,25000,'khyrentuk-test','khyrentuk').done);assert.equal(previous,180);
console.log('PASS: relógio comum, entrega atrasada alcança a digitação, histórico completo, Khyrentuk lento com pausas e glitches determinísticos.');
