
const MONTHS=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const COLORS=[
  {value:"rose",label:"さくら",color:"#f3cfd9",glyph:"#c06f8a"},
  {value:"peach",label:"もも",color:"#f7d9c7",glyph:"#c77f5d"},
  {value:"lemon",label:"たんぽぽ",color:"#f6ebbe",glyph:"#a5891f"},
  {value:"mint",label:"みどり",color:"#cfead7",glyph:"#4f8a63"},
  {value:"sky",label:"そら",color:"#cfe4f6",glyph:"#4d7ea8"},
  {value:"lavender",label:"ふじ",color:"#ddd7f6",glyph:"#7460b6"},
  {value:"sand",label:"きなり",color:"#eadfcd",glyph:"#8d7653"}
];
const $=id=>document.getElementById(id);
const els={
  yearSelect:$("yearSelect"),prevBtn:$("prevBtn"),nextBtn:$("nextBtn"),addBtn:$("addBtn"),
  monthTitle:$("monthTitle"),monthHeadline:$("monthHeadline"),filterTrigger:$("filterTrigger"),
  filterValue:$("filterValue"),filterMenu:$("filterMenu"),sortSelect:$("sortSelect"),
  categoryManageBtn:$("categoryManageBtn"),viewerNote:$("viewerNote"),wrap:$("wrap"),
  nameGrid:$("nameGrid"),roadmap:$("roadmap"),legend:$("legend"),editor:$("editor"),
  editorTitle:$("editorTitle"),toggleEditor:$("toggleEditor"),resetBtn:$("resetBtn"),
  saveBtn:$("saveBtn"),colorValue:$("colorValue"),colorMenu:$("colorMenu"),
  categoryValue:$("categoryValue"),categoryMenu:$("categoryMenu"),formMsg:$("formMsg"),
  detailModal:$("detailModal"),detailTitle:$("detailTitle"),detailMeta:$("detailMeta"),
  detailPhoto:$("detailPhoto"),detailNote:$("detailNote"),detailClose:$("detailClose"),
  detailEdit:$("detailEdit"),detailDelete:$("detailDelete"),confirmModal:$("confirmModal"),
  confirmCancel:$("confirmCancel"),confirmDelete:$("confirmDelete"),loginModal:$("loginModal"),
  loginEmail:$("loginEmail"),loginPassword:$("loginPassword"),loginSubmit:$("loginSubmit"),
  loginCancel:$("loginCancel"),loginMsg:$("loginMsg"),categoryModal:$("categoryModal"),
  categoryClose:$("categoryClose"),newCategoryName:$("newCategoryName"),newCategorySort:$("newCategorySort"),
  newCategoryBtn:$("newCategoryBtn"),categoryList:$("categoryList"),
  categoryActionModal:$("categoryActionModal"),categoryActionTitle:$("categoryActionTitle"),
  categoryActionBody:$("categoryActionBody"),categoryActionCancel:$("categoryActionCancel"),
  categoryActionSubmit:$("categoryActionSubmit"),statusText:$("statusText"),
  loginOpenBtn:$("loginOpenBtn"),logoutBtn:$("logoutBtn"),imageFile:$("imageFile"),
  imagePreview:$("imagePreview"),removeImageBtn:$("removeImageBtn"),imageStatus:$("imageStatus")
};
const form={name:$("name"),start:$("start"),end:$("end"),categoryId:$("categoryId"),color:$("color"),detail:$("detail")};

let items=[],categories=[],currentYear=new Date().getFullYear(),currentMonth=new Date().getMonth()+1;
let activeCategory="all",activeSort="start",editingId=null,pendingDelete=null,pendingCategoryAction=null;
let currentImageUrl="",selectedImageFile=null,removeImageFlag=false;

function makeId(){return crypto.randomUUID?crypto.randomUUID():"id_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,10);}
function esc(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function escNl(t){return esc(t).replace(/\n/g,"<br>");}
function fmt(v){if(!v)return"";const d=new Date(v+"T00:00:00");return Number.isNaN(d.getTime())?v:(d.getMonth()+1)+"/"+d.getDate();}
function fmtFull(v){if(!v)return"";const d=new Date(v+"T00:00:00");return Number.isNaN(d.getTime())?v:d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate();}
function daysInMonth(y,m){return new Date(y,m,0).getDate();}
function diffDays(a,b){return Math.floor((b.getTime()-a.getTime())/86400000);}
function getColor(v){return COLORS.find(c=>c.value===v)||COLORS[0];}
function categoryName(id){const c=categories.find(x=>x.id===id);return c?c.name:"";}
function isSansai(item){return categoryName(item.category_id)==="山菜";}
function mountainGlyph(item,d){if(!isSansai(item))return"";const n=diffDays(new Date(item.start+"T00:00:00"),d);return n<0?"":n<7?"◎":n<14?"○":"△";}
function visible(item,y,m){const ms=new Date(y,m-1,1),me=new Date(y,m-1,daysInMonth(y,m)),s=new Date(item.start+"T00:00:00"),e=new Date(item.end+"T00:00:00");if(e<ms||s>me)return null;return{start:s<ms?1:s.getDate(),end:e>me?me.getDate():e.getDate()};}
function monthItems(){const ms=new Date(currentYear,currentMonth-1,1),me=new Date(currentYear,currentMonth-1,daysInMonth(currentYear,currentMonth));const list=items.filter(i=>{if(activeCategory!=="all"&&i.category_id!==activeCategory)return false;const s=new Date(i.start+"T00:00:00"),e=new Date(i.end+"T00:00:00");return !(e<ms||s>me);});list.sort((a,b)=>activeSort==="category"?(categoryName(a.category_id)+"_"+a.start).localeCompare(categoryName(b.category_id)+"_"+b.start,"ja"):activeSort==="name"?a.name.localeCompare(b.name,"ja"):a.start.localeCompare(b.start,"ja"));return list;}

function setPickerValue(el,label,color){el.innerHTML=color?`<span class="swatch" style="background:${color}"></span><span>${esc(label)}</span>`:`<span>${esc(label)}</span>`;}
function updateCategoryPicker(){setPickerValue(els.categoryValue,categoryName(form.categoryId.value)||"カテゴリを選択");els.categoryMenu.querySelectorAll(".picker-option").forEach(b=>b.classList.toggle("active",b.dataset.value===form.categoryId.value));}
function updateFilterPicker(){setPickerValue(els.filterValue,activeCategory==="all"?"すべて":categoryName(activeCategory));els.filterMenu.querySelectorAll(".picker-option").forEach(b=>b.classList.toggle("active",b.dataset.value===activeCategory));}
function updateColorPicker(){const c=getColor(form.color.value);setPickerValue(els.colorValue,c.label,c.color);els.colorMenu.querySelectorAll(".picker-option").forEach(b=>b.classList.toggle("active",b.dataset.value===form.color.value));}
function renderPickers(){els.categoryMenu.innerHTML="";categories.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="picker-option";b.dataset.value=c.id;b.textContent=c.name;els.categoryMenu.appendChild(b);});els.filterMenu.innerHTML="";const all=document.createElement("button");all.type="button";all.className="picker-option";all.dataset.value="all";all.textContent="すべて";els.filterMenu.appendChild(all);categories.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="picker-option";b.dataset.value=c.id;b.textContent=c.name;els.filterMenu.appendChild(b);});els.colorMenu.innerHTML="";COLORS.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="picker-option";b.dataset.value=c.value;b.innerHTML=`<span class="swatch" style="background:${c.color}"></span><span>${c.label}</span>`;els.colorMenu.appendChild(b);});updateCategoryPicker();updateFilterPicker();updateColorPicker();}
function renderYears(){els.yearSelect.innerHTML="";const ys=new Set([currentYear,currentYear-1,currentYear+1]);items.forEach(i=>{ys.add(Number(i.start.slice(0,4)));ys.add(Number(i.end.slice(0,4)));});Array.from(ys).filter(Number.isFinite).sort((a,b)=>a-b).forEach(y=>{const o=document.createElement("option");o.value=String(y);o.textContent=String(y);if(y===currentYear)o.selected=true;els.yearSelect.appendChild(o);});}
function renderLegend(show){els.legend.innerHTML=show?'<span><span>◎</span>最初の7日</span><span><span>○</span>次の7日</span><span><span>△</span>それ以降</span>':"";}
function renderRoadmap(){const list=monthItems(),d=daysInMonth(currentYear,currentMonth),today=new Date(),todayDay=(today.getFullYear()===currentYear&&today.getMonth()+1===currentMonth)?today.getDate():0;els.monthTitle.textContent=MONTHS[currentMonth-1];els.monthHeadline.textContent=currentYear+"年"+MONTHS[currentMonth-1];els.roadmap.style.setProperty("--days",String(d));els.roadmap.innerHTML="";els.nameGrid.innerHTML="";const nh=document.createElement("div");nh.className="name-row head";nh.innerHTML='<div class="name">たからもの</div>';els.nameGrid.appendChild(nh);const dh=document.createElement("div");dh.className="day-row head";const dds=document.createElement("div");dds.className="days";for(let i=1;i<=d;i++){const c=document.createElement("div");c.className="hcell"+(i===todayDay?" today":"");c.textContent=String(i);dds.appendChild(c);}dh.appendChild(dds);els.roadmap.appendChild(dh);if(!list.length){const e=document.createElement("div");e.className="empty";e.textContent="まだ記録がありません。";els.roadmap.appendChild(e);renderLegend(false);return;}renderLegend(list.some(isSansai));list.forEach(item=>{const nr=document.createElement("div");nr.className="name-row";const n=document.createElement("div");n.className="name clickable";n.innerHTML=`<div class="item"><strong>${esc(item.name)}</strong><small>${esc(categoryName(item.category_id))} / ${esc(fmt(item.start))}〜${esc(fmt(item.end))}</small></div>`;n.onclick=()=>openDetail(item);nr.appendChild(n);els.nameGrid.appendChild(nr);const dr=document.createElement("div");dr.className="day-row";const ds=document.createElement("div");ds.className="days";const range=visible(item,currentYear,currentMonth);for(let i=1;i<=d;i++){const c=document.createElement("div");c.className="cell"+(i===todayDay?" today":"");if(range&&i>=range.start&&i<=range.end){const m=document.createElement("div");if(isSansai(item)){m.className="mark mountain";m.style.color=getColor(item.color).glyph;m.textContent=mountainGlyph(item,new Date(currentYear,currentMonth-1,i));}else{m.className="mark";m.style.background=getColor(item.color).color;}c.appendChild(m);}ds.appendChild(c);}dr.appendChild(ds);els.roadmap.appendChild(dr);});}
function renderAll(){renderYears();renderPickers();renderRoadmap();}

function showMsg(t){els.formMsg.textContent=t;els.formMsg.classList.add("show");}
function clearMsg(){els.formMsg.textContent="";els.formMsg.classList.remove("show");}
function showLoginMsg(t){els.loginMsg.textContent=t;els.loginMsg.classList.add("show");}
function clearLoginMsg(){els.loginMsg.textContent="";els.loginMsg.classList.remove("show");}
function setPreview(url){els.imagePreview.innerHTML=url?`<img src="${url}" alt="preview">`:"画像なし";}
function setImageStatus(t){els.imageStatus.textContent=t||"";}

function resetImage(){currentImageUrl="";selectedImageFile=null;removeImageFlag=false;if(els.imageFile)els.imageFile.value="";setPreview("");setImageStatus("管理用のみ画像アップできます。");}
function startNew(){editingId=null;els.editorTitle.textContent="新しく記録する";els.saveBtn.textContent="保存する";clearMsg();form.name.value="";form.start.value="";form.end.value="";form.categoryId.value=categories[0]?.id||"";form.color.value=COLORS[0].value;form.detail.value="";updateCategoryPicker();updateColorPicker();resetImage();}
function fillForm(item){editingId=item.id;els.editorTitle.textContent="記録を修正する";els.saveBtn.textContent="修正を保存";clearMsg();form.name.value=item.name||"";form.start.value=item.start||"";form.end.value=item.end||"";form.categoryId.value=item.category_id||"";form.color.value=item.color||COLORS[0].value;form.detail.value=item.detail||"";currentImageUrl=item.image_url||"";selectedImageFile=null;removeImageFlag=false;if(els.imageFile)els.imageFile.value="";setPreview(currentImageUrl);setImageStatus(currentImageUrl?"現在の画像を使用中":"画像なし");updateCategoryPicker();updateColorPicker();if(els.editor.classList.contains("collapsed"))toggleEditor(true);}
async function reloadAll(){els.statusText.textContent="読み込み中…";try{const [cats,trs]=await Promise.all([ShikiSupabase.fetchCategories(),ShikiSupabase.fetchTreasures()]);categories=cats.map(c=>({id:c.id,name:c.name||"",sort_order:Number(c.sort_order||0)}));items=trs.map(t=>({id:t.id,name:t.name||"",start:t.start_date||"",end:t.end_date||"",category_id:t.category_id||"",color:t.color||"rose",detail:t.detail||"",image_url:t.image_url||""}));renderAll();els.statusText.textContent=items.length+"件を表示中";}catch(err){els.statusText.textContent=err.message||"読み込みに失敗しました。";}}
async function save(){clearMsg();if(!ShikiAuth.isAdmin())return showMsg("管理者ログインが必要です。");const isEdit=!!editingId;const payload={id:isEdit?editingId:makeId(),name:form.name.value.trim(),start:form.start.value,end:form.end.value,category_id:form.categoryId.value,color:form.color.value,detail:form.detail.value.trim(),image_url:currentImageUrl||""};if(!payload.name)return showMsg("たからもの名が未入力の為、保存できません。");if(!payload.start||!payload.end)return showMsg("開始日または終了日が未入力の為、保存できません。");if(!payload.category_id)return showMsg("カテゴリが未設定の為、保存できません。");if(payload.end<payload.start)return showMsg("開始日より、終了日が前の為、保存できません。");try{if(removeImageFlag)payload.image_url="";if(selectedImageFile){setImageStatus("画像をアップロード中…");const up=ShikiSupabase.uploadImage(selectedImageFile,payload.id);const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error("画像アップロードがタイムアウトしました。")),20000));payload.image_url=await Promise.race([up,timeout]);setImageStatus("画像をアップロードしました。");}const row={id:payload.id,name:payload.name,start_date:payload.start,end_date:payload.end,category_id:payload.category_id,color:payload.color,detail:payload.detail,image_url:payload.image_url||""};if(isEdit)await ShikiSupabase.updateTreasure(editingId,{name:row.name,start_date:row.start_date,end_date:row.end_date,category_id:row.category_id,color:row.color,detail:row.detail,image_url:row.image_url});else await ShikiSupabase.insertTreasure(row);currentYear=Number(payload.start.slice(0,4));currentMonth=Number(payload.start.slice(5,7));await reloadAll();startNew();}catch(err){setImageStatus(err.message||"画像アップロードに失敗しました。");showMsg(err.message||"保存に失敗しました。");}}

function openDetail(item){const chips=[`<span class="chip">カテゴリ ${esc(categoryName(item.category_id))}</span>`,`<span class="chip">${esc(fmtFull(item.start))}〜${esc(fmtFull(item.end))}</span>`];els.detailTitle.textContent=item.name||"";els.detailMeta.innerHTML=chips.join("");els.detailNote.innerHTML=item.detail?escNl(item.detail):"メモなし";els.detailPhoto.innerHTML=item.image_url?`<img src="${item.image_url}" alt="detail">`:"画像なし";els.detailEdit.onclick=()=>{closeDetail();fillForm(item);};els.detailDelete.onclick=()=>{pendingDelete=item;els.confirmModal.classList.add("open");};els.detailModal.classList.add("open");}
function closeDetail(){els.detailModal.classList.remove("open");}
function closeConfirm(){els.confirmModal.classList.remove("open");pendingDelete=null;}
async function deletePending(){if(!pendingDelete)return;try{await ShikiSupabase.deleteTreasure(pendingDelete.id);closeConfirm();closeDetail();await reloadAll();}catch(err){alert(err.message||"削除に失敗しました。");}}

function openCategoryModal(){renderCategoryList();els.categoryModal.classList.add("open");}
function closeCategoryModal(){els.categoryModal.classList.remove("open");}
function renderCategoryList(){els.categoryList.innerHTML="";if(!categories.length){els.categoryList.innerHTML='<div class="small-note">カテゴリがありません</div>';return;}categories.forEach(cat=>{const row=document.createElement("div");row.className="cat-row";const name=document.createElement("div");name.className="cat-name";name.innerHTML=`<strong>${esc(cat.name)}</strong><div class="cat-sort">並び順: ${esc(String(cat.sort_order??0))}</div>`;const rename=document.createElement("button");rename.className="btn";rename.textContent="名称変更";rename.onclick=()=>openRenameCategory(cat);const del=document.createElement("button");del.className="btn danger";del.textContent="削除";del.onclick=()=>openDeleteCategory(cat);row.append(name,rename,del);els.categoryList.appendChild(row);});}
async function addCategory(){const name=els.newCategoryName.value.trim();const sort=Number(els.newCategorySort.value||0);if(!name)return;if(categories.some(c=>c.name===name))return alert("同じ名前のカテゴリが既にあります");try{await ShikiSupabase.insertCategory(name,sort);els.newCategoryName.value="";els.newCategorySort.value="";await reloadAll();renderCategoryList();}catch(err){alert(err.message||"カテゴリ追加に失敗しました。");}}
function closeCategoryAction(){els.categoryActionModal.classList.remove("open");pendingCategoryAction=null;}
function openRenameCategory(cat){pendingCategoryAction={type:"rename",cat};els.categoryActionTitle.textContent="カテゴリ名変更";els.categoryActionBody.innerHTML=`<div class="field"><label for="catRenameInput">新しいカテゴリ名</label><input id="catRenameInput" value="${esc(cat.name)}"></div><div class="field"><label for="catRenameSort">並び順</label><input id="catRenameSort" type="number" value="${esc(String(cat.sort_order??0))}"></div>`;els.categoryActionSubmit.className="btn primary";els.categoryActionSubmit.textContent="変更する";els.categoryActionModal.classList.add("open");}
function openDeleteCategory(cat){pendingCategoryAction={type:"delete",cat};const opts=categories.filter(c=>c.id!==cat.id).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");els.categoryActionTitle.textContent="カテゴリ削除";els.categoryActionBody.innerHTML=`<div class="field"><label>削除するカテゴリ</label><input value="${esc(cat.name)}" disabled></div><div class="field"><label for="moveToCategory">記録の移動先</label><select id="moveToCategory" class="select">${opts}</select></div>`;els.categoryActionSubmit.className="btn danger";els.categoryActionSubmit.textContent="削除する";els.categoryActionModal.classList.add("open");}
async function submitCategoryAction(){if(!pendingCategoryAction)return;try{if(pendingCategoryAction.type==="rename"){const name=$("catRenameInput").value.trim();const sort=Number($("catRenameSort").value||0);if(!name)return alert("カテゴリ名を入力してください");await ShikiSupabase.updateCategory(pendingCategoryAction.cat.id,{name,sort_order:sort});}else{const moveTo=$("moveToCategory").value;if(!moveTo)return alert("移動先カテゴリを選んでください");await ShikiSupabase.moveTreasuresToCategory(pendingCategoryAction.cat.id,moveTo);await ShikiSupabase.deleteCategory(pendingCategoryAction.cat.id);}closeCategoryAction();await reloadAll();renderCategoryList();}catch(err){alert(err.message||"カテゴリ操作に失敗しました。");}}

function toggleEditor(force){const open=force===undefined?els.editor.classList.contains("collapsed"):force;els.editor.classList.toggle("collapsed",!open);els.toggleEditor.textContent=open?"折りたたむ":"開く";}
function openLogin(){clearLoginMsg();els.loginEmail.value="";els.loginPassword.value="";els.loginModal.classList.add("open");}
function closeLogin(){els.loginModal.classList.remove("open");}
function clearLoginMsg(){els.loginMsg.textContent="";els.loginMsg.classList.remove("show");}
function showLoginMsg(t){els.loginMsg.textContent=t;els.loginMsg.classList.add("show");}
function applyAdminState(){const viewer=!ShikiAuth.isAdmin();document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",viewer));els.editor.classList.toggle("hidden",viewer);els.loginOpenBtn.classList.toggle("hidden",!viewer);els.logoutBtn.classList.toggle("hidden",viewer);els.viewerNote.textContent=viewer?"閲覧用：公開データを見る画面です。":"管理用：Supabaseに保存できます。";if(viewer){closeDetail();closeConfirm();closeCategoryModal();closeCategoryAction();}}

els.prevBtn.onclick=()=>{if(currentMonth===1){currentMonth=12;currentYear--}else currentMonth--;renderYears();renderRoadmap(monthItems());};
els.nextBtn.onclick=()=>{if(currentMonth===12){currentMonth=1;currentYear++}else currentMonth++;renderYears();renderRoadmap(monthItems());};
els.yearSelect.onchange=()=>{currentYear=Number(els.yearSelect.value);renderRoadmap(monthItems());};
els.sortSelect.onchange=()=>{activeSort=els.sortSelect.value;renderRoadmap(monthItems());};
els.addBtn.onclick=()=>{startNew();const sm=String(currentMonth).padStart(2,"0");form.start.value=currentYear+"-"+sm+"-01";form.end.value=currentYear+"-"+sm+"-01";if(els.editor.classList.contains("collapsed"))toggleEditor(true);};
els.toggleEditor.onclick=()=>toggleEditor();
els.saveBtn.onclick=save;
els.resetBtn.onclick=startNew;
els.filterTrigger.onclick=()=>els.filterMenu.classList.toggle("open");
els.categoryTrigger.onclick=()=>els.categoryMenu.classList.toggle("open");
els.colorTrigger.onclick=()=>els.colorMenu.classList.toggle("open");
els.filterMenu.onclick=e=>{const b=e.target.closest(".picker-option");if(!b)return;activeCategory=b.dataset.value;updateFilterPicker();els.filterMenu.classList.remove("open");renderRoadmap(monthItems());};
els.categoryMenu.onclick=e=>{const b=e.target.closest(".picker-option");if(!b)return;form.categoryId.value=b.dataset.value;updateCategoryPicker();els.categoryMenu.classList.remove("open");};
els.colorMenu.onclick=e=>{const b=e.target.closest(".picker-option");if(!b)return;form.color.value=b.dataset.value;updateColorPicker();els.colorMenu.classList.remove("open");};
document.addEventListener("click",e=>{if(!e.target.closest("#filterTrigger")&&!e.target.closest("#filterMenu"))els.filterMenu.classList.remove("open");if(!e.target.closest("#categoryTrigger")&&!e.target.closest("#categoryMenu"))els.categoryMenu.classList.remove("open");if(!e.target.closest("#colorTrigger")&&!e.target.closest("#colorMenu"))els.colorMenu.classList.remove("open");});
els.detailClose.onclick=closeDetail;
els.detailModal.onclick=e=>{if(e.target===els.detailModal)closeDetail();};
els.confirmCancel.onclick=closeConfirm;
els.confirmDelete.onclick=deletePending;
els.confirmModal.onclick=e=>{if(e.target===els.confirmModal)closeConfirm();};
els.categoryManageBtn.onclick=openCategoryModal;
els.categoryClose.onclick=closeCategoryModal;
els.categoryModal.onclick=e=>{if(e.target===els.categoryModal)closeCategoryModal();};
els.newCategoryBtn.onclick=addCategory;
els.categoryActionCancel.onclick=closeCategoryAction;
els.categoryActionSubmit.onclick=submitCategoryAction;
els.categoryActionModal.onclick=e=>{if(e.target===els.categoryActionModal)closeCategoryAction();};
els.wrap.addEventListener("scroll",()=>{els.nameGrid.scrollTop=els.wrap.scrollTop;});
els.loginOpenBtn.onclick=openLogin;
els.logoutBtn.onclick=async()=>{await ShikiAuth.signOut();applyAdminState();};
els.loginCancel.onclick=closeLogin;
els.loginModal.onclick=e=>{if(e.target===els.loginModal)closeLogin();};
els.loginSubmit.onclick=async()=>{clearLoginMsg();try{await ShikiAuth.signIn(els.loginEmail.value.trim(),els.loginPassword.value);closeLogin();applyAdminState();}catch(err){showLoginMsg(err.message||"ログインに失敗しました。");}};
els.imageFile.onchange=e=>{const file=e.target.files&&e.target.files[0];if(!file){selectedImageFile=null;return;}selectedImageFile=file;removeImageFlag=false;setPreview(URL.createObjectURL(file));setImageStatus("新しい画像を選択しました。保存で反映されます。");};
els.removeImageBtn.onclick=()=>{selectedImageFile=null;removeImageFlag=true;currentImageUrl="";if(els.imageFile)els.imageFile.value="";setPreview("");setImageStatus("画像を外します。保存で反映されます。");};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(els.loginModal.classList.contains("open"))closeLogin();else if(els.confirmModal.classList.contains("open"))closeConfirm();else if(els.categoryActionModal.classList.contains("open"))closeCategoryAction();else if(els.categoryModal.classList.contains("open"))closeCategoryModal();else if(els.detailModal.classList.contains("open"))closeDetail();}});
document.addEventListener("shiki-auth-changed",applyAdminState);
(async function boot(){await ShikiAuth.init();applyAdminState();renderPickers();startNew();toggleEditor(true);await reloadAll();})();
