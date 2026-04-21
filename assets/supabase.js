window.IyasakaSupabase = (() => {
  let client = null;

  function isRemoteReady(config) {
    return Boolean(config && config.supabaseUrl && config.supabaseAnonKey && config.bucketName && config.tableName);
  }

  function init(config) {
    client = isRemoteReady(config) ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
    return client;
  }

  async function fetchRecords(config) {
    if (!client) init(config);
    const { data, error } = await client.from(config.tableName).select('*').order('start_date', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function upsertRecord(config, payload) {
    if (!client) init(config);
    const { error } = await client.from(config.tableName).upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  }

  async function deleteRecord(config, id) {
    if (!client) init(config);
    const { error } = await client.from(config.tableName).delete().eq('id', id);
    if (error) throw error;
  }

  async function uploadImage(config, recordId, file) {
    if (!client) init(config);
    const ext = ((file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')) || 'jpg';
    const path = `records/${recordId}/${Date.now()}.${ext}`;
    const { error } = await client.storage.from(config.bucketName).upload(path, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg'
    });
    if (error) throw error;
    const { data } = client.storage.from(config.bucketName).getPublicUrl(path);
    return data?.publicUrl || '';
  }

  async function removeImageByUrl(config, url) {
    if (!url) return;
    if (!client) init(config);
    const marker = `/storage/v1/object/public/${config.bucketName}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    await client.storage.from(config.bucketName).remove([path]);
  }

  async function test(config) {
    if (!client) init(config);
    const { error } = await client.from(config.tableName).select('id', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  }

  return { isRemoteReady, init, fetchRecords, upsertRecord, deleteRecord, uploadImage, removeImageByUrl, test };
})();
