
window.AppAuth=(function(){
  const api=()=>window.AppDB.clientOf();
  let admin=false;
  let session=null;
  async function refresh(){
    const r=await api().auth.getSession();
    if(r.error)throw r.error;
    session=r.data.session||null;
    if(!session){admin=false;return false;}
    const chk=await api().from(window.AppDB.CONFIG.adminsTable).select("user_id").eq("user_id",session.user.id).maybeSingle();
    if(chk.error)throw chk.error;
    admin=!!chk.data;
    return admin;
  }
  async function signIn(email,password){
    const r=await api().auth.signInWithPassword({email,password});
    if(r.error)throw r.error;
    await refresh();
    if(!admin)throw new Error("このユーザーは管理者ではありません。");
    return true;
  }
  async function signOut(){
    const r=await api().auth.signOut();
    if(r.error)throw r.error;
    admin=false;
    session=null;
  }
  async function init(){
    try{await refresh();}catch(e){console.warn("auth init",e);admin=false;session=null;}
    api().auth.onAuthStateChange(async()=>{try{await refresh();document.dispatchEvent(new CustomEvent("app-auth-changed"));}catch(_e){}});
  }
  function isAdmin(){return admin;}
  return{init,signIn,signOut,isAdmin};
})();
