window.IyasakaAuth=(function(){
  const supabase=()=>window.IyasakaSupabase.getClient();
  let admin=false;
  let session=null;
  async function refreshAdmin(){
    const res=await supabase().auth.getSession();
    if(res.error)throw res.error;
    session=res.data.session||null;
    if(!session){admin=false;return false}
    const chk=await supabase().from(window.IyasakaSupabase.CONFIG.adminTableName).select("user_id").eq("user_id",session.user.id).maybeSingle();
    if(chk.error){admin=false;throw chk.error}
    admin=!!chk.data;
    return admin;
  }
  async function signIn(email,password){
    const r=await supabase().auth.signInWithPassword({email,password});
    if(r.error)throw r.error;
    await refreshAdmin();
    if(!admin)throw new Error("このユーザーは管理者ではありません。");
    return true;
  }
  async function signOut(){
    const r=await supabase().auth.signOut();
    if(r.error)throw r.error;
    admin=false;
    session=null;
  }
  async function init(){
    await refreshAdmin();
    supabase().auth.onAuthStateChange(async()=>{
      try{
        await refreshAdmin();
        document.dispatchEvent(new CustomEvent("iyasaka-auth-changed",{detail:{admin,isLoggedIn:!!session}}));
      }catch(_e){}
    });
  }
  function isAdmin(){return admin}
  return{init,signIn,signOut,isAdmin};
})();