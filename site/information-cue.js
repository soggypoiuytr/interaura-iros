(function(){
 const sound=new Audio('assets/audio/information-chimes.mp3');sound.preload='auto';
 window.IROSInformationCue={play(){window.IROSLocalCue?.(sound,.72);},stop(){sound.pause();sound.currentTime=0;}};
})();
