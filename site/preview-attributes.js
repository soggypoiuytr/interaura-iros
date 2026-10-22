(function(){
 'use strict';
 const query=new URLSearchParams(location.search),source=query.get('fichas'),rt=window.InterauraRealtime;
 // This source-room reader is for the authorized local preview only; never runs on the published host.
 if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||query.get('preview')!=='1'||source!=='int-jp-04'||!rt)return;
 rt.init().then(()=>{
  if(!rt.firebaseReady)return;
  // Only this attribute path is read from the source room. All actions keep rt.room.
  rt.db.ref('irosRooms/'+source+'/state/settings/characterAttributes').on('value',snapshot=>{
   window.IROSCharacterAttributes?.setSource(snapshot.val()||{});
  },error=>console.error('Não foi possível consultar as fichas da prévia:',error.code));
 }).catch(console.error);
})();
