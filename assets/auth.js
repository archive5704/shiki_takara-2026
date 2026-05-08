
window.ShikiAuth=(function(){
  const api=()=>window.ShikiSupabase.getClient();
  let admin=false;
  let session=null;
  async function refreshAdmin(){
    const sess=await api().auth.getSession();
    if(sess.error) throw sess.error;
    session=sess.data.session||null;
    if(!session){admin=false;return false;}
    const r=await api().from(window.ShikiSupabase.CONFIG.adminsTable).select("user_id").eq("user_id",session.user.id).maybeSingle();
    if(r.error){admin=false;throw r.error;}
    admin=!!r.data;
    return admin;
  }
  async function signIn(email,password){
    const r=await api().auth.signInWithPassword({email,password});
    if(r.error) throw r.error;
    await refreshAdmin();
    if(!admin) throw new Error("このユーザーは管理者ではありません。");
    return true;
  }
  async function signOut(){
    const r=await api().auth.signOut();
    if(r.error) throw r.error;
    admin=false;
    session=null;
  }
  async function init(){
    await refreshAdmin();
    api().auth.onAuthStateChange(async()=>{
      try{
        await refreshAdmin();
        document.dispatchEvent(new CustomEvent("shiki-auth-changed",{detail:{admin,isLoggedIn:!!session}}));
      }catch(_e){}
    });
  }
  function isAdmin(){return admin;}
  return{init,signIn,signOut,isAdmin};
})();
