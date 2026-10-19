const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('site/notes-audit.js','utf8'),c);const m=c.IROSNotesAudit,n=(title,text)=>({title,text,updated:'fixo'});
assert.equal(m.changes({a:n('A.TXT','texto')},{a:n('A.TXT','texto')}).length,0);
const made=m.changes({},{a:n('A.TXT','Olá')})[0];assert.equal(made.note.action,'created');assert.equal(made.note.diff.addedCount,3);assert.equal(made.note.after.text,'Olá');
const edited=m.changes({a:n('A.TXT','torre antiga')},{a:n('A.TXT','torre nova')})[0];assert.equal(edited.note.action,'edited');assert.equal(edited.note.diff.removed,'antig');assert.equal(edited.note.diff.added,'nov');
assert.equal(m.changes({a:n('A.TXT','x')},{a:n('B.TXT','x')})[0].note.action,'renamed');assert.equal(m.changes({a:n('A.TXT','x')},{a:n('B.TXT','y')})[0].note.action,'renamed-edited');
assert.equal(m.changes({a:n('A.TXT','texto')},{a:n('A.TXT','')})[0].note.action,'cleared');
const gone=m.changes({a:n('A.TXT','recuperável')},{a:null})[0];assert.equal(gone.note.before.text,'recuperável');assert.equal(gone.note.action,'deleted');assert.equal(gone.note.after,null);assert.equal(m.changes({},{a:null}).length,0);
assert.equal(m.changes({},{a:n('A.TXT',''),b:n('B.TXT','')}).length,2);assert.equal(m.delta('a🚀z','a🌙z').added,'🌙');assert.equal(m.delta('a🚀z','a🌙z').removed,'🚀');
const long=m.changes({},{a:n('A.TXT','x'.repeat(25000))})[0];assert(long.note.after.truncated);assert.equal(long.note.after.text.length,20000);assert(long.note.diff.truncated);assert.equal(long.note.diff.added.length,2000);assert(long.text.length<=500);
// The compared version is the one currently committed, not a stale local baseline.
assert.equal(m.changes({a:n('A.TXT','edição concorrente')},{a:n('A.TXT','salvo')})[0].note.before.text,'edição concorrente');
console.log('PASS: criação, edição, renomeação, exclusão com cópia anterior, lote, salvamento sem mudança, Unicode e limites de tamanho.');
