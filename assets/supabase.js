window.IyasakaSupabase=(function(){
  const CONFIG={
    url:"https://gclsvjwkwzjlgywspudy.supabase.co",
    anonKey:"sb_publishable_x-eJSFYJ3Ycz2GVsQfAfmg_-w7hUv3s",
    tableName:"treasures",
    categoriesTableName:"categories",
    adminTableName:"admin_users",
    bucketName:"treasure-images"
  };
  let client=null;
  function getClient(){
    if(!window.supabase)throw new Error("supabase-js の読み込みに失敗しました。");
    if(!client)client=window.supabase.createClient(CONFIG.url,CONFIG.anonKey);
    return client;
  }
  async function fetchCategories(){
    const s=getClient();
    const res=await s.from(CONFIG.categoriesTableName).select("id,name,sort_order").order("sort_order",{ascending:true}).order("name",{ascending:true});
    if(res.error)throw res.error;
    return res.data||[];
  }
  async function fetchTreasures(){
    const s=getClient();
    const res=await s.from(CONFIG.tableName).select("id,name,start_date,end_date,category_id,color,detail,image_url").order("start_date",{ascending:true});
    if(res.error)throw res.error;
    return res.data||[];
  }
  async function insertTreasure(row){
    const s=getClient();
    const res=await s.from(CONFIG.tableName).insert({
      id:row.id,
      name:row.name,
      start_date:row.start_date,
      end_date:row.end_date,
      category_id:row.category_id,
      color:row.color,
      detail:row.detail||"",
      image_url:row.image_url||""
    }).select().single();
    if(res.error)throw res.error;
    return res.data;
  }
  async function updateTreasure(id,row){
    const s=getClient();
    const res=await s.from(CONFIG.tableName).update({
      name:row.name,
      start_date:row.start_date,
      end_date:row.end_date,
      category_id:row.category_id,
      color:row.color,
      detail:row.detail||"",
      image_url:row.image_url||""
    }).eq("id",id).select().single();
    if(res.error)throw res.error;
    return res.data;
  }
  async function deleteTreasure(id){
    const s=getClient();
    const res=await s.from(CONFIG.tableName).delete().eq("id",id);
    if(res.error)throw res.error;
    return true;
  }
  async function insertCategory(name,sortOrder){
    const s=getClient();
    const res=await s.from(CONFIG.categoriesTableName).insert({name:name,sort_order:sortOrder}).select().single();
    if(res.error)throw res.error;
    return res.data;
  }
  async function updateCategory(id,patch){
    const s=getClient();
    const res=await s.from(CONFIG.categoriesTableName).update(patch).eq("id",id).select().single();
    if(res.error)throw res.error;
    return res.data;
  }
  async function deleteCategory(id){
    const s=getClient();
    const res=await s.from(CONFIG.categoriesTableName).delete().eq("id",id);
    if(res.error)throw res.error;
    return true;
  }
  async function moveTreasuresToCategory(fromId,toId){
    const s=getClient();
    const res=await s.from(CONFIG.tableName).update({category_id:toId}).eq("category_id",fromId);
    if(res.error)throw res.error;
    return true;
  }
  async function uploadImage(file,itemId){
    const s=getClient();
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
    const path="treasures/"+itemId+"-"+Date.now()+"."+ext;
    const up=await s.storage.from(CONFIG.bucketName).upload(path,file,{upsert:false,cacheControl:"3600",contentType:file.type||"image/jpeg"});
    if(up.error)throw up.error;
    const pub=s.storage.from(CONFIG.bucketName).getPublicUrl(path);
    return pub.data.publicUrl;
  }
  return{CONFIG,getClient,fetchCategories,fetchTreasures,insertTreasure,updateTreasure,deleteTreasure,insertCategory,updateCategory,deleteCategory,moveTreasuresToCategory,uploadImage};
})();