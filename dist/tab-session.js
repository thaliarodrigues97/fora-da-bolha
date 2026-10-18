// Preserve identity on reload, without sharing a participant across tabs.
let optionsPromise;
export function getTabAuthOptions(){
 return optionsPromise??=new Promise(resolve=>{
  try{
   const storage=window.sessionStorage;
   const tabKey='fora-da-bolha-tab';
   const claim=()=>{
    let id=storage.getItem(tabKey);
    if(!id||!navigator.locks?.request){id=crypto.randomUUID();storage.setItem(tabKey,id)}
    const options={storage,storageKey:'fora-da-bolha-auth-'+id,persistSession:true};
    if(!navigator.locks?.request){resolve(options);return}
    void navigator.locks.request('fora-da-bolha-session-'+id,{ifAvailable:true},async lock=>{
     if(!lock){
      // Duplicating a tab can copy sessionStorage. Give the copy a fresh identity.
      storage.setItem(tabKey,crypto.randomUUID());claim();return;
     }
     resolve(options);
     // The browser releases this lock when the document is closed or reloaded.
     await new Promise(()=>{});
    }).catch(()=>resolve({persistSession:false}));
   };
   claim();
  }catch{resolve({persistSession:false})}
 });
}
