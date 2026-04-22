(function(global){
  const CONFIG_KEY = "iyasaka_supabase_config_v1";
  function loadConfig(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||"null")||{supabaseUrl:"",supabaseAnonKey:"",bucketName:"treasure-images",tableName:"treasures"};}
    catch(_e){return{supabaseUrl:"",supabaseAnonKey:"",bucketName:"treasure-images",tableName:"treasures"};}
  }
  function saveConfig(config){ localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }
  function isRemoteReady(config){ return Boolean(config&&config.supabaseUrl&&config.supabaseAnonKey&&config.bucketName&&config.tableName); }
  function createClient(config){ if(!isRemoteReady(config)||!global.supabase||!global.supabase.createClient) return null; try{return global.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);}catch(_e){return null;} }
  async function fetchRecords(client, config){ const {data,error}=await client.from(config.tableName).select("*").order("start_date",{ascending:true}); if(error) throw error; return Array.isArray(data)?data.map(normalizeRemoteRecord):[]; }
  async function upsertRecord(client, config, record){ const {error}=await client.from(config.tableName).upsert(normalizeRemotePayload(record),{onConflict:"id"}); if(error) throw error; }
  async function deleteRecord(client, config, id){ const {error}=await client.from(config.tableName).delete().eq("id",id); if(error) throw error; }
  async function uploadImage(client, config, recordId, file){ const ext=((file.name||"jpg").split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg"; const path=`records/${recordId}/${Date.now()}.${ext}`; const {error}=await client.storage.from(config.bucketName).upload(path,file,{upsert:true,contentType:file.type||"image/jpeg"}); if(error) throw error; const {data}=client.storage.from(config.bucketName).getPublicUrl(path); return data&&data.publicUrl?data.publicUrl:""; }
  async function removeImageByUrl(client, config, url){ if(!url) return; const marker=`/storage/v1/object/public/${config.bucketName}/`; const idx=url.indexOf(marker); if(idx===-1) return; const path=decodeURIComponent(url.slice(idx+marker.length)); const {error}=await client.storage.from(config.bucketName).remove([path]); if(error) throw error; }
  function normalizeRemoteRecord(row){ return {id:row.id,name:row.name||"",start:row.start_date||"",end:row.end_date||"",category:row.category||"",color:row.color||"rose",detail:row.detail||"",image_url:row.image_url||"",created_at:row.created_at||new Date().toISOString()}; }
  function normalizeRemotePayload(record){ return {id:record.id,name:record.name,start_date:record.start,end_date:record.end,category:record.category,color:record.color,detail:record.detail||"",image_url:record.image_url||"",created_at:record.created_at||new Date().toISOString()}; }
  global.SupabaseManager={loadConfig,saveConfig,isRemoteReady,createClient,fetchRecords,upsertRecord,deleteRecord,uploadImage,removeImageByUrl};
})(window);
