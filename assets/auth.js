window.AppAuth=(function(){
  const api=()=>window.AppDB.clientOf();
  let admin=false;
  let session=null;
  let subscription=null;

  async function refresh(){
    const r=await api().auth.getSession();
    if(r.error)throw r.error;

    session=r.data.session||null;
    if(!session){
      admin=false;
      return false;
    }

    const chk=await api()
      .from(window.AppDB.CONFIG.adminsTable)
      .select("user_id")
      .eq("user_id",session.user.id)
      .maybeSingle();

    if(chk.error)throw chk.error;

    admin=!!chk.data;
    return admin;
  }

  async function signIn(email,password){
    const r=await api().auth.signInWithPassword({email,password});
    if(r.error)throw r.error;

    await refresh();

    if(!admin){
      await api().auth.signOut({scope:"local"});
      admin=false;
      session=null;
      throw new Error("このユーザーは管理者ではありません。");
    }

    return true;
  }

  async function signOut(){
    try{
      const r=await api().auth.signOut({scope:"local"});
      if(r.error)throw r.error;
    }finally{
      admin=false;
      session=null;
      document.dispatchEvent(new CustomEvent("app-auth-changed"));
    }
  }

  async function init(){
    try{
      await refresh();
    }catch(e){
      console.warn("auth init",e);
      admin=false;
      session=null;
    }

    if(subscription){
      subscription.unsubscribe();
      subscription=null;
    }

    const {data}=api().auth.onAuthStateChange((event,nextSession)=>{
      session=nextSession||null;

      if(event==="SIGNED_OUT" || !session){
        admin=false;
        document.dispatchEvent(new CustomEvent("app-auth-changed"));
        return;
      }

      // Do not await Supabase calls inside this callback.
      // Schedule admin verification outside the callback stack.
      if(event==="SIGNED_IN" || event==="INITIAL_SESSION" || event==="TOKEN_REFRESHED"){
        setTimeout(async()=>{
          try{
            await refresh();
          }catch(e){
            console.warn("auth refresh",e);
            admin=false;
          }
          document.dispatchEvent(new CustomEvent("app-auth-changed"));
        },0);
      }
    });

    subscription=data.subscription;
  }

  function isAdmin(){return admin;}

  return{init,signIn,signOut,isAdmin};
})();