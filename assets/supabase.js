
window.AppDB=(function(){
  const CONFIG={
    url:"https://gclsvjwkwzjlgywspudy.supabase.co",
    anonKey:"sb_publishable_x-eJSFYJ3Ycz2GVsQfAfmg_-w7hUv3s",
    treasuresTable:"treasures",
    categoriesTable:"categories",
    adminsTable:"admin_users",
    bucketName:"treasure-images"
  };
  let client=null;
  function clientOf(){
    if(!window.supabase)throw new Error("supabase-js の読み込みに失敗しました。");
    if(!client)client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey);
    return client;
  }
  function withTimeout(promise,ms,message){
    return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(message)),ms))]);
  }
  async function fetchCategories(){
    const r=await withTimeout(clientOf().from(CONFIG.categoriesTable).select("id,name,sort_order").order("sort_order",{ascending:true}).order("name",{ascending:true}),15000,"categories の読込がタイムアウトしました。");
    if(r.error)throw r.error;
    return r.data||[];
  }
  async function fetchTreasures(){
    const r=await withTimeout(clientOf().from(CONFIG.treasuresTable).select("id,name,start_date,end_date,category_id,color,detail,image_url").order("start_date",{ascending:true}),15000,"treasures の読込がタイムアウトしました。");
    if(r.error)throw r.error;
    return r.data||[];
  }
  async function insertTreasure(row){
    const r=await clientOf().from(CONFIG.treasuresTable).insert(row).select().single();
    if(r.error)throw r.error;
    return r.data;
  }
  async function updateTreasure(id,row){
    const r=await clientOf().from(CONFIG.treasuresTable).update(row).eq("id",id).select().single();
    if(r.error)throw r.error;
    return r.data;
  }
  async function deleteTreasure(id){
    const r=await clientOf().from(CONFIG.treasuresTable).delete().eq("id",id);
    if(r.error)throw r.error;
    return true;
  }
  async function insertCategory(name,sort_order){
    const r=await clientOf().from(CONFIG.categoriesTable).insert({name,sort_order}).select().single();
    if(r.error)throw r.error;
    return r.data;
  }
  async function updateCategory(id,patch){
    const r=await clientOf().from(CONFIG.categoriesTable).update(patch).eq("id",id).select().single();
    if(r.error)throw r.error;
    return r.data;
  }
  async function deleteCategory(id){
    const r=await clientOf().from(CONFIG.categoriesTable).delete().eq("id",id);
    if(r.error)throw r.error;
    return true;
  }
  async function moveTreasuresToCategory(fromId,toId){
    const r=await clientOf().from(CONFIG.treasuresTable).update({category_id:toId}).eq("category_id",fromId);
    if(r.error)throw r.error;
    return true;
  }
  async function uploadImage(file,itemId){
    const s=clientOf();
    const sessionRes=await s.auth.getSession();
    if(sessionRes.error)throw sessionRes.error;
    const session=sessionRes.data.session;
    if(!session||!session.access_token)throw new Error("管理者ログインのセッションが見つかりません。再ログインしてください。");
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
    const path="treasures/"+itemId+"-"+Date.now()+"."+ext;
    const encoded=path.split("/").map(encodeURIComponent).join("/");
    const url=CONFIG.url+"/storage/v1/object/"+encodeURIComponent(CONFIG.bucketName)+"/"+encoded;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),60000);
    let res;
    try{
      res=await fetch(url,{method:"POST",headers:{apikey:CONFIG.anonKey,Authorization:"Bearer "+session.access_token,"Content-Type":file.type||"image/jpeg","Cache-Control":"3600","x-upsert":"false"},body:file,signal:controller.signal});
    }catch(err){
      clearTimeout(timer);
      if(err.name==="AbortError")throw new Error("画像アップロードがタイムアウトしました。");
      throw err;
    }
    clearTimeout(timer);
    if(!res.ok){
      let message="画像アップロードに失敗しました。";
      try{const data=await res.json();message=data.message||data.error||JSON.stringify(data);}catch(_e){try{message=await res.text();}catch(_e2){}}
      throw new Error(message);
    }
    return s.storage.from(CONFIG.bucketName).getPublicUrl(path).data.publicUrl;
  }
  return{CONFIG,clientOf,fetchCategories,fetchTreasures,insertTreasure,updateTreasure,deleteTreasure,insertCategory,updateCategory,deleteCategory,moveTreasuresToCategory,uploadImage};
})();
