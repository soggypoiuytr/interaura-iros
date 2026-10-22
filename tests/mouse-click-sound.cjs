const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let handler,capture,played=0;
const context={Audio:class{constructor(src){this.src=src;}},document:{hidden:false,body:{append(){}},addEventListener(name,fn,flag){assert.equal(name,'pointerdown');handler=fn;capture=flag;}},playTransientSound(source,volume){assert.equal(source.src,'assets/audio/mouse-click-npo.wav');assert(volume>0);played++;}};
vm.createContext(context);vm.runInContext(fs.readFileSync('site/mouse-click-sound.js','utf8'),context);assert.equal(capture,true);
for(const button of [0,1,2])handler({isTrusted:true,pointerType:'mouse',button});assert.equal(played,3,'Cada botão físico gera um som');
handler({isTrusted:false,pointerType:'mouse',button:0});handler({isTrusted:true,pointerType:'touch',button:0});assert.equal(played,3,'Eventos artificiais e toque não duplicam cliques de mouse');
context.document.hidden=true;handler({isTrusted:true,pointerType:'mouse',button:0});assert.equal(played,3);
const wav=fs.readFileSync('site/assets/audio/mouse-click-npo.wav');assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
console.log('PASS: clique local em captura, três botões, eventos sintéticos, aba oculta e WAV preservado.');
