
window.ShikiSupabase=(function(){
  const CONFIG={
    url:"https://gclsvjwkwzjlgywspudy.supabase.co",
    anonKey:"sb_publishable_x-eJSFYJ3Ycz2GVsQfAfmg_-w7hUv3s",
    treasuresTable:"treasures",
    categoriesTable:"categories",
    adminsTable:"admin_users",
    bucketName:"treasure-images"
  };
  let client=null;
  function getClient(){
    if(!window.supabase) throw new Error("supabase-js の読み込みに失敗しました。");
    if(!client) client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey);
    return client;
  }
  async function fetchCategories(){
    const r=await getClient().from(CONFIG.categoriesTable).select("id,name,sort_order").order("sort_order",{ascending:true}).order("name",{ascending:true});
    if(r.error) throw r.error;
    return r.data||[];
  }
  async function fetchTreasures(){
    const r=await getClient().from(CONFIG.treasuresTable).select("id,name,start_date,end_date,category_id,color,detail,image_url").order("start_date",{ascending:true});
    if(r.error) throw r.error;
    return r.data||[];
  }
  async function insertTreasure(row){
    const r=await getClient().from(CONFIG.treasuresTable).insert(row).select().single();
    if(r.error) throw r.error;
    return r.data;
  }
  async function updateTreasure(id,row){
    const r=await getClient().from(CONFIG.treasuresTable).update(row).eq("id",id).select().single();
    if(r.error) throw r.error;
    return r.data;
  }
  async function deleteTreasure(id){
    const r=await getClient().from(CONFIG.treasuresTable).delete().eq("id",id);
    if(r.error) throw r.error;
    return true;
  }
  async function insertCategory(name,sort_order){
    const r=await getClient().from(CONFIG.categoriesTable).insert({name,sort_order}).select().single();
    if(r.error) throw r.error;
    return r.data;
  }
  async function updateCategory(id,patch){
    const r=await getClient().from(CONFIG.categoriesTable).update(patch).eq("id",id).select().single();
    if(r.error) throw r.error;
    return r.data;
  }
  async function deleteCategory(id){
    const r=await getClient().from(CONFIG.categoriesTable).delete().eq("id",id);
    if(r.error) throw r.error;
    return true;
  }
  async function moveTreasuresToCategory(fromId,toId){
    const r=await getClient().from(CONFIG.treasuresTable).update({category_id:toId}).eq("category_id",fromId);
    if(r.error) throw r.error;
    return true;
  }
  async function uploadImage(file,itemId){
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
    const path="treasures/"+itemId+"-"+Date.now()+"."+ext;
    const r=await getClient().storage.from(CONFIG.bucketName).upload(path,file,{upsert:false,cacheControl:"3600",contentType:file.type||"image/jpeg"});
    if(r.error) throw r.error;
    const pub=getClient().storage.from(CONFIG.bucketName).getPublicUrl(path);
    return pub.data.publicUrl;
  }
  return{CONFIG,getClient,fetchCategories,fetchTreasures,insertTreasure,updateTreasure,deleteTreasure,insertCategory,updateCategory,deleteCategory,moveTreasuresToCategory,uploadImage};
})();
