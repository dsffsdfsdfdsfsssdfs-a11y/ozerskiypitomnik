(()=>{'use strict';
const OZ_MOBILE_PREVIEW=new URLSearchParams(location.search).has('oz-mobile-preview');
const KEY='oz_simple_editor_v1_'+location.pathname;
// The original inline editor restores per-browser layouts (including old logos).
// Preserve its drafts as backups and stop them from overriding the public site.
try{
 const migration='oz_canonical_public_migration_20261015_v2';
 if(!localStorage.getItem(migration)){
  const build=document.documentElement.dataset.ozBuild||'base';
  const prefixes=['ozersky_studio_'+build,'oz_menu_positions_'+build,'oz_phone_edit_'+build,'oz_floating_panel_location_'+build];
  const keys=Object.keys(localStorage).filter(k=>prefixes.some(p=>k===p||k.startsWith(p+'_')));
  for(const k of keys){
   const value=localStorage.getItem(k);
   if(value!==null)localStorage.setItem('oz_legacy_backup_20261015_'+k,value);
   localStorage.removeItem(k);
  }
  localStorage.setItem(migration,'1');
  if(keys.length){location.reload();return}
 }
}catch(e){console.warn('Legacy layout migration:',e)}

document.documentElement.classList.remove('oz-public-ready');
let finished=false;
const finishLoading=()=>{if(finished)return;finished=true;document.documentElement.classList.add('oz-public-ready')};
// The original full nursery logo (with the name) is bundled in the page.
// The former pinned file contained only the greenhouse pictogram.
const fullNurseryLogo=window.EMBEDDED_ASSETS?.['logo.webp'];
if(fullNurseryLogo){
 window.OZ_LOGO=fullNurseryLogo;
 const current=document.querySelector('#ozFreeLogo img');
 if(current && !window.OZ_PUBLIC_LOGO_OVERRIDE) current.src=fullNurseryLogo;
}

const root=document.createElement('div');root.id='simpleEdit';root.innerHTML=`<button id="seLaunch" type="button">✎ Редактор</button><div id="sePanel"><div class="seHead"><b>Редактор логотипа и текста</b><span class="seHeadButtons"><button id="seMin" type="button" title="Свернуть">−</button><button id="seClose" type="button" title="Закрыть">×</button></span></div><p>Нажми на надпись или логотип. Перетаскивай выбранное мышью.</p><div id="seSelected">Выбери элемент на сайте</div><label>Размер <input id="seSize" type="range" min="8" max="240" value="30"><output id="seSizeValue">30</output></label><label>По горизонтали (px)<input id="seX" type="number" value="0"></label><label>По вертикали (px)<input id="seY" type="number" value="0"></label><label>Текст<textarea id="seText" rows="2" placeholder="Выбери текст"></textarea></label><button id="seSave" type="button">Опубликовать для всех</button><div id="seStatus">Черновик сохраняется в браузере. Нажмите «Опубликовать для всех», чтобы обновить сайт.</div></div>`;document.body.appendChild(root);if(OZ_MOBILE_PREVIEW)root.style.display='none';
const logoTools=document.createElement('div');logoTools.id='seLogoTools';logoTools.innerHTML='<label style="display:block;margin:12px 0 7px">Логотип сайта</label><input type="file" id="seLogoFile" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="max-width:100%;margin-bottom:8px"><button type="button" id="seLogoRemove">Удалить логотип</button><button type="button" id="seLogoRestore">Вернуть исходный</button><small style="display:block;margin-top:8px">PNG, JPG, WebP или SVG, до 15 МБ. Размер автоматически оптимизируется. Нажмите «Опубликовать для всех», чтобы изменения увидели посетители.</small>';
root.querySelector('#seSave').before(logoTools);
const $=id=>document.getElementById(id),panel=$('sePanel');let open=false,active=null,drag=null,records={},localDraft={},adminKey=null,logoAsset=null;
try{localDraft=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const isAction=e=>!!e?.matches('#ozDottedActions .oz-v13-btn,#ozHelperToggle');
const isLogo=e=>!!e?.closest('#ozFreeLogo,.brand,.brand-symbol,#brandIcon');
const selector=e=>{if(e.id)return '#'+CSS.escape(e.id);const parts=[];const body=e.ownerDocument.body;for(let n=e;n&&n!==body;n=n.parentElement){if(!n.parentElement)break;let part=n.tagName.toLowerCase();if(n.id){parts.unshift('#'+CSS.escape(n.id));break}const siblings=[...n.parentElement.children].filter(x=>x.tagName===n.tagName);part+=':nth-of-type('+(siblings.indexOf(n)+1)+')';parts.unshift(part)}return parts.join(' > ')};
const candidates=e=>{if(!e||root.contains(e))return null;const action=e.closest('#ozDottedActions .oz-v13-btn,#ozHelperToggle');if(action)return action;const logo=e.closest('#ozFreeLogo,.brand');if(logo)return logo;const t=e.closest('h1,h2,h3,h4,h5,h6,p,span,strong,em,a,button,small,label,li,.eyebrow');return t&&!root.contains(t)?t:null};
const setActionSize=(e,n)=>{const px=Math.max(36,Math.min(240,Number(n)||66));e.style.setProperty('width',px+'px','important');e.style.setProperty('height',px+'px','important');e.style.setProperty('--oz-editor-icon-size',Math.round(px*.44)+'px');};
const setPos=(e,x,y)=>{e.dataset.seX=x;e.dataset.seY=y;e.style.setProperty('translate',x+'px '+y+'px','important')};
const save=()=>{if(!active)return;let k=selector(active);records[k]={x:Number(active.dataset.seX||0),y:Number(active.dataset.seY||0),size:isAction(active)?Math.round(active.getBoundingClientRect().width):isLogo(active)?Number(active.style.width.replace('px',''))||active.getBoundingClientRect().width:parseFloat(getComputedStyle(active).fontSize),text:!isLogo(active)&&!active.children.length?active.textContent:null};try{localStorage.setItem(KEY,JSON.stringify(records));$('seStatus').textContent='Черновик сохранён. Нажмите «Опубликовать для всех»'}catch{$('seStatus').textContent='Не удалось сохранить в браузере'}};
const select=e=>{active=e;$('seSelected').textContent=isAction(e)?(e.id==='ozV13Cart'?'Корзина':e.id==='ozHelperToggle'?'Помощник':'Позвонить'):isLogo(e)?'Логотип':(e.textContent||e.tagName).trim().slice(0,60);let size=isAction(e)?e.getBoundingClientRect().width:isLogo(e)?e.getBoundingClientRect().width:parseFloat(getComputedStyle(e).fontSize);$('seSize').value=Math.min(240,Math.max(8,Math.round(size)));$('seSizeValue').textContent=Math.round(size)+' px';$('seX').value=e.dataset.seX||0;$('seY').value=e.dataset.seY||0;$('seText').disabled=isAction(e)||isLogo(e)||e.children.length>0;$('seText').value=$('seText').disabled?'':e.textContent;document.querySelectorAll('.sePicked').forEach(x=>x.classList.remove('sePicked'));e.classList.add('sePicked')};
const applyOne=(key,d)=>{try{let e=document.querySelector(key);if(!e)return;setPos(e,d.x||0,d.y||0);if(d.size){if(isAction(e))setActionSize(e,d.size);else if(isLogo(e))e.style.setProperty('width',d.size+'px','important');else e.style.setProperty('font-size',d.size+'px','important')}if(d.text!==null&&d.text!==undefined&&!e.children.length)e.textContent=d.text}catch{}};
const applyLogo=()=>{window.OZ_PUBLIC_LOGO_OVERRIDE=logoAsset;const e=document.querySelector('#ozFreeLogo'),im=e?.querySelector('img');if(!e||!im)return;
 if(logoAsset==='hidden'){e.style.setProperty('display','none','important');return;}
 e.style.removeProperty('display');
 const src=logoAsset||(fullNurseryLogo||'/ozerskiy-header-logo.png');if(im.getAttribute('src')!==src)im.src=src;
};

const normalizeMobileLogo=(doc)=>{if(doc?.defaultView?.innerWidth>900)return;const logo=doc.querySelector('#ozFreeLogo');const header=doc.querySelector('#ozCombinedHeader .header .header-in');if(!logo||!header)return;if(logo.parentElement!==header)header.appendChild(logo);logo.style.setProperty('position','absolute','important');logo.style.setProperty('top','50%','important');logo.style.setProperty('left','50%','important');logo.style.setProperty('transform','translate(-50%,-50%)','important');logo.style.setProperty('z-index','180','important');logo.style.setProperty('pointer-events','auto','important')};
const mobileCss=(data)=>Object.entries(data||{}).filter(([k,v])=>k.startsWith('mobile::')&&v&&typeof v==='object').map(([k,v])=>{
 const sel=k.slice(8);if(!sel||sel.length>400||/[{}]/.test(sel))return '';
 const target='html body '+sel,css=[],n=Math.max(8,Math.min(240,Number(v.size)||16));
 if(v.size!=null){
   if(v.kind==='box'||v.kind==='image'||/ozFreeLogo|ozV13Cart|ozHelperToggle|oz-v13-btn/i.test(sel)){
     css.push('width:'+n+'px!important','max-width:none!important');
     if(v.kind==='image'||/ozV13Cart|ozHelperToggle|oz-v13-btn/i.test(sel))css.push('height:'+n+'px!important','min-width:0!important','min-height:0!important');
   }else css.push('font-size:'+n+'px!important');
 }
 if(v.width!=null)css.push('width:'+Math.max(20,Math.min(600,Number(v.width)||120))+'px!important');
 if(v.x!=null||v.y!=null)css.push('translate:'+Number(v.x||0)+'px '+Number(v.y||0)+'px!important');
 if(v.hidden)css.push('display:none!important');
 const children=(v.size!=null&&/ozFreeLogo/i.test(sel))?target+' img{width:100%!important;height:auto!important;max-width:none!important}':'';
 return target+'{'+css.join(';')+'}'+children;
}).join('\n');
const applyMobileDirect=(doc,data)=>{
 if(!doc?.body||!doc.defaultView||doc.defaultView.innerWidth>900)return;
 for(const [key,d] of Object.entries(data||{})){
  if(!key.startsWith('mobile::')||!d||typeof d!=='object')continue;
  let el;try{el=doc.querySelector(key.slice(8))}catch{continue}
  if(!el)continue;
  const n=Number(d.size);
  const box=d.kind==='image'||d.kind==='box'||el.matches('img,button,svg')||el.id==='ozFreeLogo';
  if(Number.isFinite(n)&&n>0){
   if(box){
    el.style.setProperty('width',n+'px','important');
    el.style.setProperty('max-width','none','important');
    if(d.kind==='image'||el.matches('button,svg,img'))el.style.setProperty('height',n+'px','important');
    if(el.id==='ozFreeLogo'){
      const img=el.querySelector('img');
      if(img){img.style.setProperty('width','100%','important');img.style.setProperty('height','auto','important')}
    }
   }else el.style.setProperty('font-size',n+'px','important');
  }
  if(d.width!=null)el.style.setProperty('width',Math.max(20,Math.min(600,Number(d.width)))+'px','important');
  if(el.id==='ozFreeLogo'){
   el.style.setProperty('position','absolute','important');
   el.style.setProperty('left','calc(50% + '+Number(d.x||0)+'px)','important');
   el.style.setProperty('top','calc(50% + '+Number(d.y||0)+'px)','important');
   el.style.setProperty('translate','none','important');
  }else if(d.x!=null||d.y!=null)el.style.setProperty('translate',Number(d.x||0)+'px '+Number(d.y||0)+'px','important');
  if(d.hidden===true)el.style.setProperty('display','none','important');
  if(d.text!=null&&!el.children.length&&el.textContent!==String(d.text))el.textContent=String(d.text);
 }
};
const installMobileCss=(doc,data,id='ozPublishedMobileOverrides')=>{
 try{
  let st=doc.getElementById(id);
  if(!st){st=doc.createElement('style');st.id=id;doc.head.appendChild(st)}
  st.textContent='@media(max-width:900px){'+mobileCss(data)+'}';
  normalizeMobileLogo(doc);applyMobileDirect(doc,data);
 }catch(e){console.warn('Mobile overrides:',e)}
};
const applyRecords=()=>{for(const [key,d] of Object.entries(records))if(!key.startsWith('mobile::')){if(innerWidth<=900){if(d.text!=null){const e=document.querySelector(key);if(e&&!e.children.length)e.textContent=d.text}}else applyOne(key,d)}applyLogo();installMobileCss(document,records)};
$('seLogoFile').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)||file.size>15000000){$('seStatus').textContent='Выберите PNG, JPG, WebP или SVG до 15 МБ';ev.target.value='';return;}
 $('seStatus').textContent='Подготавливаю логотип...';
 try{
  const image=await createImageBitmap(file);
  const canvas=document.createElement('canvas');
  let maxSide=1400,quality=.86,encoded='';
  for(let i=0;i<9;i++){
   const ratio=Math.min(1,maxSide/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
   const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
   encoded=canvas.toDataURL('image/webp',quality);
   if(encoded.length<450000)break;
   if(quality>.68)quality-=.09;else maxSide=Math.max(400,Math.round(maxSide*.75));
  }
  image.close();
  if(encoded.length>=450000)throw Error('Не удалось уменьшить изображение для публикации');
  logoAsset=encoded;applyLogo();$('seStatus').textContent='✓ Логотип установлен для предпросмотра. Нажмите «Опубликовать для всех».';
 }catch(err){$('seStatus').textContent='Ошибка загрузки: '+err.message}
});
$('seLogoRemove').onclick=()=>{logoAsset='hidden';applyLogo();$('seStatus').textContent='Логотип скрыт. Для сохранения нажми «Опубликовать для всех».'};
$('seLogoRestore').onclick=()=>{logoAsset=null;applyLogo();$('seStatus').textContent='Исходный логотип восстановлен. Нажми «Опубликовать для всех».'};
(async()=>{try{const res=await fetch('/api/site-settings?fresh='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();const nextLogo=data.logo??null;if(nextLogo&&nextLogo!=='hidden'){const pre=new Image();pre.src=nextLogo;try{if(pre.decode)await pre.decode();else await new Promise((ok,bad)=>{pre.onload=ok;pre.onerror=bad})}catch{}}records=data.records||{};logoAsset=nextLogo;applyRecords();applyLater();try{if(document.fonts?.ready)await document.fonts.ready}catch{}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));$('seStatus').textContent=data.published?'Опубликованная версия загружена с сервера':'Сервер готов. Публичных правок пока нет.';finishLoading()}catch(err){$('seStatus').textContent='Сервер недоступен: '+err.message;applyRecords();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));finishLoading()}})();
for(const [key,d] of Object.entries(records)){if(key.startsWith('mobile::')||innerWidth<=900)continue;try{let e=document.querySelector(key);if(!e)continue;setPos(e,d.x||0,d.y||0);if(d.size){if(isAction(e)){setActionSize(e,d.size)}else if(isLogo(e))e.style.setProperty('width',d.size+'px','important');else e.style.setProperty('font-size',d.size+'px','important')}if(d.text!==null&&d.text!==undefined&&!e.children.length)e.textContent=d.text}catch{}}
let panelPos=null;
const head=panel.querySelector('.seHead');
head.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;const r=panel.getBoundingClientRect();panelPos={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};head.setPointerCapture(e.pointerId);e.preventDefault()});
head.addEventListener('pointermove',e=>{if(!panelPos||panelPos.id!==e.pointerId)return;const x=Math.max(4,Math.min(innerWidth-panel.offsetWidth-4,e.clientX-panelPos.dx));const y=Math.max(4,Math.min(innerHeight-42,e.clientY-panelPos.dy));panel.style.left=x+'px';panel.style.top=y+'px';panel.style.right='auto'});
head.addEventListener('pointerup',()=>panelPos=null);
$('seMin').onclick=()=>{root.classList.toggle('seCollapsed');$('seMin').textContent=root.classList.contains('seCollapsed')?'+':'−'};
const applyLater=()=>{if(innerWidth<=900)return;for(const [key,d] of Object.entries(records)){if(key!=='#ozV13Cart'&&key!=='#ozHelperToggle'&&!key.includes('ozDottedActions'))continue;try{const el=document.querySelector(key);if(!el||!isAction(el)||!d.size)continue;setActionSize(el,d.size);setPos(el,d.x||0,d.y||0)}catch{}}};new MutationObserver(()=>{applyLater();applyMobileDirect(document,records)}).observe(document.body,{childList:true,subtree:true});applyLater();applyMobileDirect(document,records);
$('seLaunch').onclick=()=>{open=true;root.classList.add('seOpen');if(Object.keys(localDraft).length && !Object.keys(records).length){$('seStatus').textContent='Есть старый неопубликованный черновик в этом браузере. Он не заменяет текущую публичную версию.'}};$('seClose').onclick=()=>{open=false;root.classList.remove('seOpen');document.querySelectorAll('.sePicked').forEach(e=>e.classList.remove('sePicked'))};
$('seSize').oninput=e=>{if(!active)return;const n=e.target.value;if(isAction(active)){setActionSize(active,n)}else if(isLogo(active))active.style.setProperty('width',n+'px','important');else active.style.setProperty('font-size',n+'px','important');$('seSizeValue').textContent=n+' px';save()};
for(const axis of ['X','Y'])$('se'+axis).oninput=()=>{if(!active)return;setPos(active,Number($('seX').value)||0,Number($('seY').value)||0);save()};
$('seText').oninput=e=>{if(active&&!e.target.disabled){active.textContent=e.target.value;save()}};
$('seSave').onclick=async()=>{if(active)save();if(!adminKey){adminKey=prompt('Ключ владельца из файла Ozerskiy-editor-admin-key.txt на Рабочем столе Mac:');if(!adminKey)return;}try{$('seStatus').textContent='Публикую для всех посетителей...';let res=await fetch('/api/site-settings',{method:'POST',headers:{'Content-Type':'application/json','x-editor-key':adminKey},body:JSON.stringify({records,logo:logoAsset})});let data=await res.json();if(!res.ok){if(res.status===401)adminKey=null;throw Error(data.error||'Ошибка '+res.status)}$('seStatus').textContent='✓ Опубликовано для всех! Обычный режим и инкогнито увидят правки.';localDraft={};try{localStorage.removeItem(KEY)}catch{}}catch(err){$('seStatus').textContent='Не опубликовано: '+err.message}};
// Capture input before any existing site handlers. Navigation never fires while editing.
for(const type of ['click','auxclick','dblclick','submit'])document.addEventListener(type,e=>{if(OZ_MOBILE_PREVIEW||!open||root.contains(e.target)||document.getElementById('seMobileDrawer')?.contains(e.target))return;e.preventDefault();e.stopImmediatePropagation()},true);
document.addEventListener('pointerdown',e=>{if(OZ_MOBILE_PREVIEW||!open||root.contains(e.target)||document.getElementById('seMobileDrawer')?.contains(e.target)||e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();let target=candidates(e.target);if(!target)return;select(target);drag={id:e.pointerId,e:target,x:e.clientX,y:e.clientY,ox:Number(target.dataset.seX||0),oy:Number(target.dataset.seY||0)}},true);
document.addEventListener('pointermove',e=>{if(!drag||!open||document.getElementById('seMobileDrawer')?.contains(e.target)||e.pointerId!==drag.id)return;e.preventDefault();e.stopImmediatePropagation();const x=Math.round(drag.ox+e.clientX-drag.x),y=Math.round(drag.oy+e.clientY-drag.y);setPos(drag.e,x,y);$('seX').value=x;$('seY').value=y},true);
document.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id){save();drag=null}},true);

(()=> {
 const trigger=document.createElement('button');trigger.id='seMobileMode';trigger.type='button';trigger.textContent='📱 Редактировать мобильную версию';root.querySelector('#seSelected').before(trigger);
 const drawer=document.createElement('div');drawer.id='seMobileDrawer';
 drawer.innerHTML=`<header class="smHead"><strong>📱 Мобильная версия</strong><div><select id="smDevice"><option value="375">375 px</option><option value="390" selected>390 px</option><option value="430">430 px</option><option value="768">768 px</option></select><button id="smClose">Закрыть ✕</button></div></header><div class="smArea"><div class="smPhone"><iframe id="smFrame" title="Редактирование мобильной версии"></iframe></div><section class="smPanel"><h3>Редактор элементов</h3><button id="smPickLogo" type="button">Выбрать логотип шапки</button><p id="smPicked">Нажмите на текст, логотип или кнопку прямо на экране телефона, затем перетаскивайте.</p><label>Размер элемента <input id="smSize" type="range" min="8" max="240" value="30"><output id="smSizeOut">30 px</output></label><label>По горизонтали (px)<input id="smX" type="number" value="0"></label><label>По вертикали (px)<input id="smY" type="number" value="0"></label><label>Текст<textarea id="smText" rows="3" placeholder="Выберите текст"></textarea></label><label><input id="smHidden" type="checkbox"> Скрыть на мобильной</label><button id="smReset">Сбросить элемент</button><button id="smPublish" class="smPrimary">Опубликовать для всех</button><p id="smState">Редактирование мобильной версии не затрагивает компьютерную.</p></section></div>`;
 if(!OZ_MOBILE_PREVIEW)document.body.appendChild(drawer);
 const style=document.createElement('style');style.textContent=`
 #seMobileMode{display:block;width:100%;margin:12px 0;padding:12px;border-radius:12px;border:1px solid #a4cbaa;background:#e4f5e9;color:#184e2e;font-weight:700;cursor:pointer}
 #seMobileDrawer{display:none;position:fixed;inset:8px;z-index:2147483645;border-radius:20px;background:#f4f7f2;box-shadow:0 20px 90px #0007;color:#193928;overflow:auto;font:14px system-ui,sans-serif}
 #seMobileDrawer.smVisible{display:block}
 #seMobileDrawer button,#seMobileDrawer select{border:1px solid #bfd4c4;background:white;color:#245b37;padding:9px 12px;border-radius:9px;cursor:pointer}
 #seMobileDrawer .smHead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid #d3e1d6;flex-wrap:wrap}
 #seMobileDrawer .smHead>div{display:flex;gap:10px}
 #seMobileDrawer .smArea{display:flex;justify-content:center;align-items:flex-start;gap:25px;flex-wrap:wrap;padding:20px}
 #seMobileDrawer .smPhone{width:390px;height:min(730px,calc(100vh - 135px));min-height:340px;border:9px solid #202b23;border-radius:34px;overflow:hidden;background:white;box-shadow:0 15px 35px #0002;box-sizing:content-box;max-width:calc(100% - 20px)}
 #smFrame{width:100%;height:100%;border:0;background:white}
 #seMobileDrawer .smPanel{width:285px;max-width:100%;padding:19px;border:1px solid #d7e5d9;border-radius:16px;background:white;display:flex;flex-direction:column;gap:12px}
 #seMobileDrawer .smPanel h3{margin:0}
 #seMobileDrawer .smPanel p{font-size:12px;color:#587563;line-height:1.5}
 #seMobileDrawer .smPanel label{display:flex;flex-direction:column;gap:6px;font-size:13px}
 #seMobileDrawer .smPanel input:not([type=checkbox]),#seMobileDrawer .smPanel textarea{width:100%;box-sizing:border-box;border:1px solid #cbd9cf;border-radius:8px;padding:8px;font:inherit}
 #seMobileDrawer .smPanel input[type=range]{padding:0}
 #seMobileDrawer .smPanel label:has(input[type=checkbox]){flex-direction:row;align-items:center}
 #seMobileDrawer .smPrimary{background:#246d42!important;color:white!important;font-weight:700}
 #smFrame .smPicked{outline:2px dashed #38a862!important;outline-offset:3px}
 @media(max-width:700px){#seMobileDrawer{inset:2px}#seMobileDrawer .smArea{padding:7px;gap:10px}#seMobileDrawer .smPhone{height:52vh}#seMobileDrawer .smPanel{width:100%}}`;
 document.head.appendChild(style);
 const $m=id=>drawer.querySelector('#'+id),frame=$m('smFrame'),phone=drawer.querySelector('.smPhone');
 let selected=null,element=null,dragging=null,initialized=false;
 const status=t=>$m('smState').textContent=t;
 const record=()=>selected?(records['mobile::'+selected]||{}):{};
 const refresh=()=>{if(frame.contentDocument)installMobileCss(frame.contentDocument,records,'smLiveStyle')};
 const pick=el=>{if(el?.closest?.('#ozFreeLogo'))el=el.closest('#ozFreeLogo');if(element)element.classList.remove('smPicked');element=el;selected=selector(el);element.classList.add('smPicked');const kind=(isLogo(el)||isAction(el)||el.matches('button,img,svg')||el.querySelector('img,svg'))?'image':(el.matches('div,section,nav,header,article')?'box':'text');if(record().kind!==kind)records['mobile::'+selected]={...record(),kind};const d=record(),size=d.size??(isAction(el)||isLogo(el)?el.getBoundingClientRect().width:parseFloat(frame.contentWindow.getComputedStyle(el).fontSize));$m('smPicked').textContent='Выбрано: '+(el.alt||el.textContent||el.tagName).trim().slice(0,65);$m('smSize').value=Math.min(240,Math.max(8,Math.round(size)));$m('smSizeOut').textContent=$m('smSize').value+' px';$m('smX').value=d.x||0;$m('smY').value=d.y||0;$m('smHidden').checked=!!d.hidden;$m('smText').disabled=!!el.children.length||isLogo(el)||isAction(el);$m('smText').value=d.text??(el.textContent||'')};
 const commit=(patch)=>{if(!selected)return;if(!document.querySelector(selected)){status('Этот элемент не найден на основной странице. Выберите другой элемент.');return;}records['mobile::'+selected]={...record(),...patch};refresh();if(element&&patch.size!=null){const n=Number(patch.size);const kind=record().kind;if(kind==='box'||kind==='image'){element.style.setProperty('width',n+'px','important');element.style.setProperty('max-width','none','important');if(kind==='image')element.style.setProperty('height',n+'px','important')}else element.style.setProperty('font-size',n+'px','important')}status('Изменения готовы. Нажмите «Опубликовать для всех».')};
 const down=e=>{if(e.button!==0)return;let el=e.target.closest('#ozFreeLogo')||candidates(e.target)||e.target.closest('img,nav,section');if(!el)return;e.preventDefault();e.stopImmediatePropagation();pick(el);dragging={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:Number(record().x||0),y:Number(record().y||0)};try{el.setPointerCapture(e.pointerId)}catch{}};
 const move=e=>{if(!dragging||e.pointerId!==dragging.id||!element)return;e.preventDefault();const dx=Math.round(e.clientX-dragging.startX),dy=Math.round(e.clientY-dragging.startY);const x=dragging.x+dx,y=dragging.y+dy;if(element.id==='ozFreeLogo'){element.style.setProperty('left','calc(50% + '+x+'px)','important');element.style.setProperty('top','calc(50% + '+y+'px)','important')}else element.style.setProperty('translate',x+'px '+y+'px','important');$m('smX').value=x;$m('smY').value=y};
 const up=e=>{if(!dragging||e.pointerId!==dragging.id)return;dragging=null;commit({x:Number($m('smX').value)||0,y:Number($m('smY').value)||0})};
 const attach=()=>{try{const doc=frame.contentDocument;if(!doc||!doc.body)throw Error('Сайт ещё не загружен');doc.addEventListener('pointerdown',down,true);doc.addEventListener('pointermove',move,true);doc.addEventListener('pointerup',up,true);doc.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},true);refresh();initialized=true;status('Нажмите на элемент и двигайте его прямо в предпросмотре.')}catch(e){status('Ошибка предпросмотра: '+e.message)}};
 const loadPreview=()=>{
  initialized=false;element=null;selected=null;
  status('Загружаю настоящую мобильную версию сайта…');
  frame.removeAttribute('srcdoc');
  frame.setAttribute('sandbox','allow-same-origin allow-scripts');
  const url=new URL(location.href);url.searchParams.set('oz-mobile-preview','1');url.searchParams.set('v',String(Date.now()));
  frame.src=url.href;
 };
 frame.addEventListener('load',attach);
 trigger.onclick=()=>{drawer.classList.add('smVisible');phone.style.width=$m('smDevice').value+'px';loadPreview()};
 $m('smPickLogo').onclick=()=>{const el=frame.contentDocument?.querySelector('#ozFreeLogo');if(el){pick(el);status('Логотип выбран. Меняйте X и Y или перетаскивайте его.')}else status('Логотип шапки не найден')};
 $m('smClose').onclick=()=>{drawer.classList.remove('smVisible');if(element)element.classList.remove('smPicked');element=null;selected=null};
 $m('smDevice').onchange=e=>{phone.style.width=e.target.value+'px';setTimeout(refresh,50)};
 $m('smSize').oninput=e=>{const size=Number(e.target.value);$m('smSizeOut').textContent=size+' px';commit({size})};
 $m('smX').oninput=()=>commit({x:Number($m('smX').value)||0});
 $m('smY').oninput=()=>commit({y:Number($m('smY').value)||0});
 $m('smText').oninput=e=>commit({text:e.target.value});
 $m('smHidden').onchange=e=>commit({hidden:e.target.checked});
 $m('smReset').onclick=()=>{if(!selected)return;delete records['mobile::'+selected];loadPreview();status('Настройки элемента сброшены.')};
 $m('smPublish').onclick=async()=>{status('Публикую изменения…');if(!adminKey){adminKey=prompt('Ключ владельца из файла Ozerskiy-editor-admin-key.txt:');if(!adminKey){status('Для публикации нужен ключ владельца.');return;}}try{const res=await fetch('/api/site-settings',{method:'POST',headers:{'Content-Type':'application/json','x-editor-key':adminKey},body:JSON.stringify({records,logo:logoAsset})});const data=await res.json();if(!res.ok){if(res.status===401)adminKey=null;throw Error(data.error||'HTTP '+res.status)}status('✓ Мобильные изменения опубликованы для всех.');$('seStatus').textContent='✓ Мобильные изменения опубликованы';}catch(err){status('Не удалось сохранить: '+err.message)}};
})();
(()=>{const style=document.createElement('style');style.id='oz-mobile-fix-oct2026';style.textContent="\n/* Mobile responsive layout: the public header is assembled at runtime. */\n@media(max-width:900px){\n html,body{max-width:100%!important;overflow-x:clip!important}\n #ozCombinedHeader{width:100%!important;max-width:100vw!important}\n #ozCombinedHeader .header{margin-bottom:54px!important;overflow:visible!important}\n #ozCombinedHeader .header .header-in{width:100%!important;max-width:100%!important;height:82px!important;min-height:82px!important;padding:0 12px!important;gap:0!important;position:relative!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo{position:absolute!important;left:50%!important;top:50%!important;width:clamp(115px,32vw,150px)!important;max-width:38vw!important;transform:translate(-50%,-50%)!important;translate:none!important;z-index:180!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo img{width:100%!important;height:auto!important;object-fit:contain!important}\n #ozCombinedHeader #mainNav{position:absolute!important;display:flex!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;bottom:auto!important;width:100%!important;height:44px!important;min-height:44px!important;align-items:center!important;justify-content:flex-start!important;gap:22px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:0 18px!important;margin:0!important;background:rgba(255,255,255,.94)!important;border-radius:13px!important;box-shadow:0 5px 12px rgba(24,66,42,.07)!important;pointer-events:auto!important;scrollbar-width:none!important;white-space:nowrap!important}\n #ozCombinedHeader #mainNav::-webkit-scrollbar{display:none}\n #ozCombinedHeader #mainNav>a{position:static!important;display:inline-flex!important;align-items:center!important;transform:none!important;translate:none!important;scale:1!important;left:auto!important;top:auto!important;margin:0!important;padding:8px 0!important;font-size:13px!important;line-height:1.2!important;white-space:nowrap!important;flex:0 0 auto!important}\n #ozCombinedHeader .header .header-in .brand,#ozCombinedHeader .header .header-in .header-actions{display:none!important}\n #ozDottedActions{padding:0 7px!important;pointer-events:none!important}\n #ozDottedActions .oz-v13-wrap{flex:0 0 48px!important}\n #ozDottedActions .oz-v13-btn{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozDottedActions svg{width:22px!important;height:22px!important}\n #ozHelper13{right:66px!important;top:50%!important;transform:translateY(-50%)!important}\n #ozHelperToggle{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozHelper13 .oz-helper-panel{right:-58px!important;max-width:min(350px,calc(100vw - 22px))!important;width:calc(100vw - 22px)!important}\n .hero{padding-top:20px!important}\n .hero h1,.hero .hero-title{font-size:clamp(43px,10vw,68px)!important;line-height:1.07!important;letter-spacing:-.055em!important;max-width:100%!important;overflow-wrap:normal!important}\n .hero p{font-size:clamp(14px,3.65vw,17px)!important;line-height:1.55!important}\n .hero .wrap{width:100%!important;max-width:100%!important;padding-left:18px!important;padding-right:18px!important}\n .hero img{max-width:100%!important;height:auto}\n #seLaunch{right:12px!important;bottom:calc(18px + env(safe-area-inset-bottom))!important;font-size:12px!important;padding:10px 14px!important}\n}\n@media(max-width:480px){\n #ozCombinedHeader .header .header-in #ozFreeLogo{width:135px!important;max-width:35vw!important}\n .hero h1,.hero .hero-title{font-size:clamp(40px,10.2vw,52px)!important}\n .hero .wrap{padding-left:16px!important;padding-right:16px!important}\n}\n";document.head.appendChild(style);applyMobileDirect(document,records);})();
})();
