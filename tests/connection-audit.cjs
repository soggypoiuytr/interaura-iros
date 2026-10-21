const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('site/connection-audit.js','utf8'),c);
const departures=c.window.IROSConnectionAudit.departures;
const roster={a:{online:true,at:10000,leaveId:'exit-a',characterName:'Lia',playerName:'Ana'},b:{online:false,at:12000,leaveId:'exit-b',characterName:'Janel',playerName:'Thiago'}};
for(const now of [28999,29000,60000,3600000]){const rows=departures(roster,now);assert.equal(rows.length,1,'Heartbeat atrasado não confirma saída de outro jogador');assert.equal(rows[0].id,'exit-b');assert.equal(rows[0].clientId,'b');assert.equal(rows[0].characterName,'Janel');assert.equal(rows[0].playerName,'Thiago');assert.equal(rows[0].at,12000);}
roster.a.online=false;roster.a.at=30500;const rows=departures(roster,30501);assert.equal(rows.length,2);assert.equal(rows[0].id,'exit-a');assert.equal(rows[0].playerName,'Ana');assert.equal(rows[0].at,30500);
roster.b={...roster.b,online:true,leaveId:'new-exit-b',at:30501};assert.equal(departures(roster,999999).length,1,'Reconectado não gera saída pela idade do heartbeat');
assert.equal(departures({},29000).length,0);assert.equal(departures({a:{online:false}},29000).length,0);assert.equal(departures({a:{at:1}},999999).length,0);
console.log('PASS: somente saídas confirmadas, múltiplos jogadores, identidade da sessão correta, heartbeat atrasado e reconexão.');
