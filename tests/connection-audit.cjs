const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('site/connection-audit.js','utf8'),context);
const departures=context.window.IROSConnectionAudit.departures,roster={a:{online:true,at:10000,leaveId:'exit-a',characterName:'Lia',playerName:'Teste'},b:{online:false,at:12000,leaveId:'exit-b',characterName:'Janel',playerName:'Thiago'}};
assert.equal(departures(roster,99999).length,1,'Presença recente permanece conectada');
const rows=departures(roster,100000);assert.equal(rows.length,2);assert.equal(rows[0].id,'exit-a');assert.equal(rows[0].at,100000);assert.equal(rows[1].id,'exit-b');assert.equal(rows[1].characterName,'Janel');assert.equal(rows[1].at,12000);
roster.a.online=false;roster.a.at=100500;assert.equal(departures(roster,100501)[0].id,'exit-a','Desconexão confirmada usa a mesma chave do fallback e não duplica');
assert.equal(departures({},100000).length,0);assert.equal(departures({a:{online:false}},100000).length,0);
console.log('PASS: saídas confirmadas e presenças expiradas, identificação preservada e chave única entre registro do servidor e recuperação pelo mestre.');
