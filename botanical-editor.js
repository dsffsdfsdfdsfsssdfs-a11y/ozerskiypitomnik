(()=>{'use strict';
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
setTimeout(finishLoading,4500);
// The original full nursery logo (with the name) is bundled in the page.
// The former pinned file contained only the greenhouse pictogram.
const fullNurseryLogo=window.EMBEDDED_ASSETS?.['logo.webp'];
if(fullNurseryLogo){
 window.OZ_LOGO=fullNurseryLogo;
 const current=document.querySelector('#ozFreeLogo img');
 if(current && !window.OZ_PUBLIC_LOGO_OVERRIDE) current.src=fullNurseryLogo;
}

const root=document.createElement('div');root.id='simpleEdit';root.innerHTML=`<button id="seLaunch" type="button">✎ Редактор</button><div id="sePanel"><div class="seHead"><b>Редактор логотипа и текста</b><span class="seHeadButtons"><button id="seMin" type="button" title="Свернуть">−</button><button id="seClose" type="button" title="Закрыть">×</button></span></div><p>Нажми на надпись или логотип. Перетаскивай выбранное мышью.</p><div id="seSelected">Выбери элемент на сайте</div><label>Размер <input id="seSize" type="range" min="8" max="240" value="30"><output id="seSizeValue">30</output></label><label>По горизонтали (px)<input id="seX" type="number" value="0"></label><label>По вертикали (px)<input id="seY" type="number" value="0"></label><label>Текст<textarea id="seText" rows="2" placeholder="Выбери текст"></textarea></label><button id="seSave" type="button">Опубликовать для всех</button><div id="seStatus">Черновик сохраняется в браузере. Нажмите «Опубликовать для всех», чтобы обновить сайт.</div></div>`;document.body.appendChild(root);
const logoTools=document.createElement('div');logoTools.id='seLogoTools';logoTools.innerHTML='<label style="display:block;margin:12px 0 7px">Логотип сайта</label><input type="file" id="seLogoFile" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="max-width:100%;margin-bottom:8px"><button type="button" id="seLogoRemove">Удалить логотип</button><button type="button" id="seLogoRestore">Вернуть исходный</button><small style="display:block;margin-top:8px">PNG, JPG, WebP или SVG, до 15 МБ. Размер автоматически оптимизируется. Нажмите «Опубликовать для всех», чтобы изменения увидели посетители.</small>';
root.querySelector('#seSave').before(logoTools);
const $=id=>document.getElementById(id),panel=$('sePanel');let open=false,active=null,drag=null,records={},localDraft={},adminKey=null,logoAsset=null;
try{localDraft=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const isAction=e=>!!e?.matches('#ozDottedActions .oz-v13-btn,#ozHelperToggle');
const isLogo=e=>!!e?.closest('#ozFreeLogo,.brand,.brand-symbol,#brandIcon');
const selector=e=>{if(e.id)return '#'+CSS.escape(e.id);const a=[];for(let n=e;n&&n!==document.body;n=n.parentElement){let k=n.tagName.toLowerCase();if(n.id){a.unshift('#'+CSS.escape(n.id));break}let siblings=[...n.parentElement.children].filter(x=>x.tagName===n.tagName);k+=':nth-of-type('+(siblings.indexOf(n)+1)+')';a.unshift(k)}return a.join(' > ')};
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
const applyRecords=()=>{for(const [key,d] of Object.entries(records))applyOne(key,d);applyLogo()};
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
(async()=>{try{const res=await fetch('/api/site-settings?fresh='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();records=data.records||{};logoAsset=data.logo??null;applyRecords();applyLater();$('seStatus').textContent=data.published?'Опубликованная версия загружена с сервера':'Сервер готов. Публичных правок пока нет.'}catch(err){$('seStatus').textContent='Сервер недоступен: '+err.message}finally{finishLoading()}})();
for(const [key,d] of Object.entries(records)){try{let e=document.querySelector(key);if(!e)continue;setPos(e,d.x||0,d.y||0);if(d.size){if(isAction(e)){setActionSize(e,d.size)}else if(isLogo(e))e.style.setProperty('width',d.size+'px','important');else e.style.setProperty('font-size',d.size+'px','important')}if(d.text!==null&&d.text!==undefined&&!e.children.length)e.textContent=d.text}catch{}}
let panelPos=null;
const head=panel.querySelector('.seHead');
head.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;const r=panel.getBoundingClientRect();panelPos={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};head.setPointerCapture(e.pointerId);e.preventDefault()});
head.addEventListener('pointermove',e=>{if(!panelPos||panelPos.id!==e.pointerId)return;const x=Math.max(4,Math.min(innerWidth-panel.offsetWidth-4,e.clientX-panelPos.dx));const y=Math.max(4,Math.min(innerHeight-42,e.clientY-panelPos.dy));panel.style.left=x+'px';panel.style.top=y+'px';panel.style.right='auto'});
head.addEventListener('pointerup',()=>panelPos=null);
$('seMin').onclick=()=>{root.classList.toggle('seCollapsed');$('seMin').textContent=root.classList.contains('seCollapsed')?'+':'−'};
const applyLater=()=>{for(const [key,d] of Object.entries(records)){if(key!=='#ozV13Cart'&&key!=='#ozHelperToggle'&&!key.includes('ozDottedActions'))continue;try{const el=document.querySelector(key);if(!el||!isAction(el)||!d.size)continue;setActionSize(el,d.size);setPos(el,d.x||0,d.y||0)}catch{}}};new MutationObserver(applyLater).observe(document.body,{childList:true,subtree:true});applyLater();
$('seLaunch').onclick=()=>{open=true;root.classList.add('seOpen');if(Object.keys(localDraft).length && !Object.keys(records).length){$('seStatus').textContent='Есть старый неопубликованный черновик в этом браузере. Он не заменяет текущую публичную версию.'}};$('seClose').onclick=()=>{open=false;root.classList.remove('seOpen');document.querySelectorAll('.sePicked').forEach(e=>e.classList.remove('sePicked'))};
$('seSize').oninput=e=>{if(!active)return;const n=e.target.value;if(isAction(active)){setActionSize(active,n)}else if(isLogo(active))active.style.setProperty('width',n+'px','important');else active.style.setProperty('font-size',n+'px','important');$('seSizeValue').textContent=n+' px';save()};
for(const axis of ['X','Y'])$('se'+axis).oninput=()=>{if(!active)return;setPos(active,Number($('seX').value)||0,Number($('seY').value)||0);save()};
$('seText').oninput=e=>{if(active&&!e.target.disabled){active.textContent=e.target.value;save()}};
$('seSave').onclick=async()=>{if(active)save();if(!adminKey){adminKey=prompt('Ключ владельца из файла Ozerskiy-editor-admin-key.txt на Рабочем столе Mac:');if(!adminKey)return;}try{$('seStatus').textContent='Публикую для всех посетителей...';let res=await fetch('/api/site-settings',{method:'POST',headers:{'Content-Type':'application/json','x-editor-key':adminKey},body:JSON.stringify({records,logo:logoAsset})});let data=await res.json();if(!res.ok){if(res.status===401)adminKey=null;throw Error(data.error||'Ошибка '+res.status)}$('seStatus').textContent='✓ Опубликовано для всех! Обычный режим и инкогнито увидят правки.';localDraft={};try{localStorage.removeItem(KEY)}catch{}}catch(err){$('seStatus').textContent='Не опубликовано: '+err.message}};
// Capture input before any existing site handlers. Navigation never fires while editing.
for(const type of ['click','auxclick','dblclick','submit'])document.addEventListener(type,e=>{if(!open||root.contains(e.target))return;e.preventDefault();e.stopImmediatePropagation()},true);
document.addEventListener('pointerdown',e=>{if(!open||root.contains(e.target)||e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();let target=candidates(e.target);if(!target)return;select(target);drag={id:e.pointerId,e:target,x:e.clientX,y:e.clientY,ox:Number(target.dataset.seX||0),oy:Number(target.dataset.seY||0)}},true);
document.addEventListener('pointermove',e=>{if(!drag||!open||e.pointerId!==drag.id)return;e.preventDefault();e.stopImmediatePropagation();const x=Math.round(drag.ox+e.clientX-drag.x),y=Math.round(drag.oy+e.clientY-drag.y);setPos(drag.e,x,y);$('seX').value=x;$('seY').value=y},true);
document.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id){save();drag=null}},true);
(()=>{const style=document.createElement('style');style.id='oz-mobile-fix-oct2026';style.textContent="\n/* Mobile responsive layout: the public header is assembled at runtime. */\n@media(max-width:900px){\n html,body{max-width:100%!important;overflow-x:clip!important}\n #ozCombinedHeader{width:100%!important;max-width:100vw!important}\n #ozCombinedHeader .header{margin-bottom:54px!important;overflow:visible!important}\n #ozCombinedHeader .header .header-in{width:100%!important;max-width:100%!important;height:82px!important;min-height:82px!important;padding:0 12px!important;gap:0!important;position:relative!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo{position:absolute!important;left:50%!important;top:50%!important;width:clamp(115px,32vw,150px)!important;max-width:38vw!important;transform:translate(-50%,-50%)!important;translate:none!important;z-index:180!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo img{width:100%!important;height:auto!important;object-fit:contain!important}\n #ozCombinedHeader #mainNav{position:absolute!important;display:flex!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;bottom:auto!important;width:100%!important;height:44px!important;min-height:44px!important;align-items:center!important;justify-content:flex-start!important;gap:22px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:0 18px!important;margin:0!important;background:rgba(255,255,255,.94)!important;border-radius:13px!important;box-shadow:0 5px 12px rgba(24,66,42,.07)!important;pointer-events:auto!important;scrollbar-width:none!important;white-space:nowrap!important}\n #ozCombinedHeader #mainNav::-webkit-scrollbar{display:none}\n #ozCombinedHeader #mainNav>a{position:static!important;display:inline-flex!important;align-items:center!important;transform:none!important;translate:none!important;scale:1!important;left:auto!important;top:auto!important;margin:0!important;padding:8px 0!important;font-size:13px!important;line-height:1.2!important;white-space:nowrap!important;flex:0 0 auto!important}\n #ozCombinedHeader .header .header-in .brand,#ozCombinedHeader .header .header-in .header-actions{display:none!important}\n #ozDottedActions{padding:0 7px!important;pointer-events:none!important}\n #ozDottedActions .oz-v13-wrap{flex:0 0 48px!important}\n #ozDottedActions .oz-v13-btn{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozDottedActions svg{width:22px!important;height:22px!important}\n #ozHelper13{right:66px!important;top:50%!important;transform:translateY(-50%)!important}\n #ozHelperToggle{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozHelper13 .oz-helper-panel{right:-58px!important;max-width:min(350px,calc(100vw - 22px))!important;width:calc(100vw - 22px)!important}\n .hero{padding-top:20px!important}\n .hero h1,.hero .hero-title{font-size:clamp(43px,10vw,68px)!important;line-height:1.07!important;letter-spacing:-.055em!important;max-width:100%!important;overflow-wrap:normal!important}\n .hero p{font-size:clamp(14px,3.65vw,17px)!important;line-height:1.55!important}\n .hero .wrap{width:100%!important;max-width:100%!important;padding-left:18px!important;padding-right:18px!important}\n .hero img{max-width:100%!important;height:auto}\n #seLaunch{right:12px!important;bottom:calc(18px + env(safe-area-inset-bottom))!important;font-size:12px!important;padding:10px 14px!important}\n}\n@media(max-width:480px){\n #ozCombinedHeader .header .header-in #ozFreeLogo{width:135px!important;max-width:35vw!important}\n .hero h1,.hero .hero-title{font-size:clamp(40px,10.2vw,52px)!important}\n .hero .wrap{padding-left:16px!important;padding-right:16px!important}\n}\n";document.head.appendChild(style);})();
})();
