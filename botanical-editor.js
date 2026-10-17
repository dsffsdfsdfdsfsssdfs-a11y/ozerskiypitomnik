(()=>{'use strict';

// Distinct warm ivory background for the helper answer panel.
(()=>{
 const style=document.createElement('style');style.id='oz-helper-answer-ivory';
 style.textContent='#ozHelper13 .oz-helper-answer-ivory{background:#f7f1e5!important;background-image:none!important;border-color:#e8dcc4!important;color:#315540!important}';
 document.head.appendChild(style);
 const phrase='Выберите интересующий вопрос';
 const apply=()=>{
  const root=document.getElementById('ozHelper13');if(!root)return false;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node,found=false;
  while((node=walker.nextNode())){
   if(!(node.nodeValue||'').includes(phrase))continue;
   let el=node.parentElement;
   if(!el)continue;
   const start=el;
   while(el.parentElement&&root.contains(el.parentElement)){
    const parent=el.parentElement;
    if(parent.classList.contains('oz-helper-panel')||parent.querySelectorAll('button,[role="button"]').length>0)break;
    if(parent.children.length>3)break;
    el=parent;
   }
   (el===root?start:el).classList.add('oz-helper-answer-ivory');found=true;
  }
  return found;
 };
 const start=()=>{
  apply();
  const root=document.getElementById('ozHelper13');if(!root)return;
  const observer=new MutationObserver(()=>{observer.disconnect();apply();observer.observe(root,{childList:true,subtree:true,characterData:true})});
  observer.observe(root,{childList:true,subtree:true,characterData:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Palette 2 — style the actual FAQ action, including div-based clickable items.
(()=>{
 const style=document.createElement('style');
 style.id='oz-helper-palette-2';
 style.textContent='#ozHelper13 .oz-helper-palette-2{background:#e5efeb!important;background-image:none!important;border-color:#b3cfc3!important}#ozHelper13 .oz-helper-palette-2:hover{background:#dceae4!important;border-color:#93b9a8!important}';
 document.head.appendChild(style);
 const labels=new Set(['Помощь с выбором растений','Как оформить заказ?','Доставка и самовывоз','Связаться с нами']);
 const apply=()=>{
  const root=document.getElementById('ozHelper13');
  if(!root)return false;
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;while((node=walk.nextNode())){
   if(!labels.has((node.nodeValue||'').trim()))continue;
   const parent=node.parentElement;
   if(!parent)continue;
   let target=parent.closest('button,a,[role="button"],[onclick]');
   if(!target||!root.contains(target)){
    target=parent;
    for(let j=0;j<2&&target.parentElement&&root.contains(target.parentElement);j++){
     const p=target.parentElement;
     if(p.children.length>2||p.querySelectorAll('button,a,[role="button"]').length>0)break;
     if(p.classList.contains('oz-helper-panel'))break;
     target=p;
    }
   }
   target.classList.add('oz-helper-palette-2');
  }
  return true;
 };
 const begin=()=>{
  if(!apply()){const ready=new MutationObserver(()=>{if(apply()){ready.disconnect();begin()}});ready.observe(document.documentElement,{subtree:true,childList:true});return}
  const root=document.getElementById('ozHelper13');
  let busy=false;
  const observer=new MutationObserver(()=>{if(busy)return;busy=true;observer.disconnect();apply();observer.observe(root,{subtree:true,childList:true,characterData:true});busy=false});
  observer.observe(root,{subtree:true,childList:true,characterData:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();

// Variant 18: animated green signal bars in the nursery helper status.
(()=>{
 const style=document.createElement('style');
 style.id='oz-helper-status-18-style';
 style.textContent=String.raw`
 #ozHelper13 .oz-status18-row{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:9px!important;vertical-align:middle!important;line-height:1.25!important;white-space:nowrap!important}
 #ozHelper13 .oz-status18-name{display:inline-block!important;line-height:inherit!important;white-space:nowrap!important}
 #ozHelper13 .oz-status18{display:inline-flex;align-items:center;gap:7px;color:#368853;font-size:inherit;font-weight:600;white-space:nowrap;line-height:inherit;transform:none}
 #ozHelper13 .oz-signal18{display:inline-flex;align-items:flex-end;gap:2px;height:14px;width:16px;flex:0 0 16px;transform:none}
 #ozHelper13 .oz-signal18 i{display:block;width:4px;background:#28ba65;border-radius:3px;transform-origin:bottom;animation:oz-signal-wave18 1.3s ease-in-out infinite}
 #ozHelper13 .oz-signal18 i:nth-child(1){height:5px}
 #ozHelper13 .oz-signal18 i:nth-child(2){height:9px;animation-delay:.2s}
 #ozHelper13 .oz-signal18 i:nth-child(3){height:13px;animation-delay:.4s}
 @keyframes oz-signal-wave18{0%,100%{transform:scaleY(.6);opacity:.7}50%{transform:scaleY(1);opacity:1}}
 @media(prefers-reduced-motion:reduce){#ozHelper13 .oz-signal18 i{animation:none}}
 `;
 document.head.appendChild(style);
 const make=()=>{const status=document.createElement('span');status.className='oz-status18';const bars=document.createElement('span');bars.className='oz-signal18';bars.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)bars.appendChild(document.createElement('i'));status.append(bars,document.createTextNode('На связи'));return status};
 const apply=()=>{
  const helper=document.getElementById('ozHelper13');if(!helper)return false;
  if(helper.querySelector('.oz-status18'))return true;
  const walker=document.createTreeWalker(helper,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())){
   const raw=node.nodeValue||'';
   if(!/на связи/i.test(raw)||node.parentElement?.closest('script,style'))continue;
   const m=raw.match(/на связи/i);if(!m)continue;
   const before=raw.slice(0,m.index).replace(/\s*[·•]\s*$/,' ');
   const after=raw.slice(m.index+m[0].length);
   const frag=document.createDocumentFragment();
   if(/Оз[её]рский питомник/i.test(before)){
    const row=document.createElement('span');row.className='oz-status18-row';
    const name=document.createElement('span');name.className='oz-status18-name';name.textContent=before.trim();
    row.append(name,make());frag.appendChild(row);
   }else{if(before)frag.appendChild(document.createTextNode(before));frag.appendChild(make())}
   if(after)frag.appendChild(document.createTextNode(after));
   node.replaceWith(frag);return true;
  }
  return false;
 };
 if(!apply()){
  const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  setTimeout(()=>observer.disconnect(),20000);
 }
})();


// Load the published assistant avatar; site visitors cannot edit it.
(()=>{
 const apply=async()=>{
  try{
   const response=await fetch('/api/helper-avatar',{cache:'no-store'});
   if(!response.ok)return;
   const data=await response.json();
   if(typeof data.image!=='string'||!data.image.startsWith('data:image/png;base64,'))return;
   const img=document.querySelector('#ozHelper13 .oz-h-avatar img');
   if(!img)return;
   img.src=data.image;img.removeAttribute('srcset');
  }catch(err){console.warn('Assistant avatar:',err)}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(apply,0)});
 else apply();
})();


// Align the nursery assistant avatar precisely in its circular 42px holder.
(()=>{
 const style=document.createElement('style');
 style.id='oz-helper-avatar-alignment';
 style.textContent=`
 #ozHelper13 .oz-h-avatar{
 width:42px!important;height:42px!important;min-width:42px!important;flex:0 0 42px!important;
 display:grid!important;place-items:center!important;box-sizing:border-box!important;
 margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;
 background:#8eb582!important;overflow:hidden!important;line-height:0!important;
 }
 #ozHelper13 .oz-h-avatar img{
 position:static!important;display:block!important;box-sizing:border-box!important;
 width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;
 max-width:42px!important;max-height:42px!important;
 padding:0!important;margin:0!important;border:0!important;
 object-fit:contain!important;object-position:center!important;border-radius:50%!important;
 transform:none!important;translate:none!important;scale:1!important;
 }
 `;
 document.head.appendChild(style);
})();


// Favicon is declared in the initial HTML; do not change it after page load.


// Public-only layout and published site settings. Editor and admin UI removed.
const OZ_MOBILE_PREVIEW=false;
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

let records={},logoAsset=null,mobileLogoAsset=null;
const isAction=e=>!!e?.matches('#ozDottedActions .oz-v13-btn,#ozHelperToggle');
const isLogo=e=>!!e?.closest('#ozFreeLogo,.brand,.brand-symbol,#brandIcon');
const setActionSize=(e,n)=>{const px=Math.max(36,Math.min(240,Number(n)||66));e.style.setProperty('width',px+'px','important');e.style.setProperty('height',px+'px','important');e.style.setProperty('--oz-editor-icon-size',Math.round(px*.44)+'px');};
const setPos=(e,x,y)=>{e.dataset.seX=x;e.dataset.seY=y;e.style.setProperty('translate',x+'px '+y+'px','important')};
const applyOne=(key,d)=>{try{let e=document.querySelector(key);if(!e)return;setPos(e,d.x||0,d.y||0);if(d.size){if(isAction(e))setActionSize(e,d.size);else if(isLogo(e))e.style.setProperty('width',d.size+'px','important');else e.style.setProperty('font-size',d.size+'px','important')}if(d.text!==null&&d.text!==undefined&&!e.children.length)e.textContent=d.text}catch{}};
const applyLogo=()=>{window.OZ_PUBLIC_LOGO_OVERRIDE=logoAsset;const e=document.querySelector('#ozFreeLogo'),im=e?.querySelector('img');if(!e||!im)return;
 if(logoAsset==='hidden'){e.style.setProperty('display','none','important');return;}
 e.style.removeProperty('display');
 const src=logoAsset||(fullNurseryLogo||'/ozerskiy-header-logo.png');if(im.getAttribute('src')!==src)im.src=src;
};

const normalizeMobileLogo=()=>{};
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
 /* Coordinates are applied identically via placeMobileElement in preview and public site. */
 if(v.hidden)css.push('display:none!important');
 const children=(v.size!=null&&/ozFreeLogo/i.test(sel))?target+' img{width:100%!important;height:auto!important;max-width:none!important}':'';
 return target+'{'+css.join(';')+'}'+children;
}).join('\n');
const mobileLogoKey='mobile::#ozCustomMobileLogo';
const renderMobileLogo=(doc)=>{
 if(OZ_MOBILE_PREVIEW)return;
 if(!doc?.body||doc.defaultView?.innerWidth>900)return;
 let el=doc.getElementById('ozCustomMobileLogo');
 if(!mobileLogoAsset){el?.remove();return}
 const host=doc.querySelector('#ozCombinedHeader .header .header-in')||doc.body;
 if(!el){el=doc.createElement('img');el.id='ozCustomMobileLogo';el.alt='Логотип питомника';el.draggable=false;host.appendChild(el)}
 if(el.getAttribute('src')!==mobileLogoAsset)el.src=mobileLogoAsset;
 const d=records[mobileLogoKey]||{},size=Math.max(40,Math.min(240,Number(d.size)||140));
 el.style.cssText='position:absolute!important;left:50%!important;top:50%!important;z-index:999!important;display:block!important;pointer-events:auto!important;touch-action:none!important;cursor:grab!important;height:auto!important;max-width:none!important;object-fit:contain!important;';
 el.style.setProperty('width',size+'px','important');
 el.style.setProperty('transform','translate(-50%,-50%)','important');
 el.style.setProperty('translate',Number(d.x||0)+'px '+Number(d.y||0)+'px','important');
};
const placeMobileElement=(el,x,y)=>{
 if(!el)return;
 x=Number(x)||0;y=Number(y)||0;
 if(el.id==='ozCustomMobileLogo'){
  el.style.setProperty('translate',x+'px '+y+'px','important');return;
 }
 if(!el.hasAttribute('data-oz-mobile-base-transform')){
  const baseline=el.ownerDocument.defaultView.getComputedStyle(el).transform;
  el.setAttribute('data-oz-mobile-base-transform',baseline==='none'?'':baseline);
 }
 const base=el.getAttribute('data-oz-mobile-base-transform')||'';
 el.style.setProperty('translate','none','important');
 el.style.setProperty('transform',(base?base+' ':'')+'translate3d('+x+'px,'+y+'px,0px)','important');
};
const applyMobileDirect=(doc,data)=>{
 if(!doc?.body||!doc.defaultView||doc.defaultView.innerWidth>900)return;
 const mobileLogo=doc.querySelector('#ozFreeLogo');if(mobileLogo)mobileLogo.style.setProperty('display','none','important');renderMobileLogo(doc);
 for(const [key,d] of Object.entries(data||{})){
  if(!key.startsWith('mobile::')||!d||typeof d!=='object'||key.includes('ozFreeLogo')||key===mobileLogoKey)continue;
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
  if(d.x!=null||d.y!=null)placeMobileElement(el,d.x,d.y);
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
// Read published layout and logos; there are no editor controls on the public site.
(async()=>{
 try {
  const res=await fetch('/api/site-settings?fresh='+Date.now(),{cache:'no-store'});
  if(!res.ok)throw Error('HTTP '+res.status);
  const data=await res.json();
  records=data.records||{};
  logoAsset=data.logo??null;
  mobileLogoAsset=data.mobileLogo||null;
  applyRecords();
  try{if(document.fonts?.ready)await document.fonts.ready}catch{}
 } catch(err) {
  console.warn('Published settings unavailable:',err);
  applyRecords();
 } finally {
  requestAnimationFrame(()=>requestAnimationFrame(finishLoading));
 }
})();

(()=>{const style=document.createElement('style');style.id='oz-mobile-fix-oct2026';style.textContent="\n/* Mobile responsive layout: the public header is assembled at runtime. */\n@media(max-width:900px){\n html,body{max-width:100%!important;overflow-x:clip!important}\n #ozCombinedHeader{width:100%!important;max-width:100vw!important}\n #ozCombinedHeader .header{margin-bottom:54px!important;overflow:visible!important}\n #ozCombinedHeader .header .header-in{width:100%!important;max-width:100%!important;height:82px!important;min-height:82px!important;padding:0 12px!important;gap:0!important;position:relative!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo{position:absolute!important;left:50%!important;top:50%!important;width:clamp(115px,32vw,150px)!important;max-width:38vw!important;transform:translate(-50%,-50%)!important;translate:none!important;z-index:180!important}\n #ozCombinedHeader .header .header-in #ozFreeLogo img{width:100%!important;height:auto!important;object-fit:contain!important}\n #ozCombinedHeader #mainNav{position:absolute!important;display:flex!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;bottom:auto!important;width:100%!important;height:44px!important;min-height:44px!important;align-items:center!important;justify-content:flex-start!important;gap:22px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:0 18px!important;margin:0!important;background:rgba(255,255,255,.94)!important;border-radius:13px!important;box-shadow:0 5px 12px rgba(24,66,42,.07)!important;pointer-events:auto!important;scrollbar-width:none!important;white-space:nowrap!important}\n #ozCombinedHeader #mainNav::-webkit-scrollbar{display:none}\n #ozCombinedHeader #mainNav>a{position:static!important;display:inline-flex!important;align-items:center!important;transform:none!important;translate:none!important;scale:1!important;left:auto!important;top:auto!important;margin:0!important;padding:8px 0!important;font-size:13px!important;line-height:1.2!important;white-space:nowrap!important;flex:0 0 auto!important}\n #ozCombinedHeader .header .header-in .brand,#ozCombinedHeader .header .header-in .header-actions{display:none!important}\n #ozDottedActions{padding:0 7px!important;pointer-events:none!important}\n #ozDottedActions .oz-v13-wrap{flex:0 0 48px!important}\n #ozDottedActions .oz-v13-btn{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozDottedActions svg{width:22px!important;height:22px!important}\n #ozHelper13{right:66px!important;top:50%!important;transform:translateY(-50%)!important}\n #ozHelperToggle{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}\n #ozHelper13 .oz-helper-panel{right:-58px!important;max-width:min(350px,calc(100vw - 22px))!important;width:calc(100vw - 22px)!important}\n .hero{padding-top:20px!important}\n .hero h1,.hero .hero-title{font-size:clamp(43px,10vw,68px)!important;line-height:1.07!important;letter-spacing:-.055em!important;max-width:100%!important;overflow-wrap:normal!important}\n .hero p{font-size:clamp(14px,3.65vw,17px)!important;line-height:1.55!important}\n .hero .wrap{width:100%!important;max-width:100%!important;padding-left:18px!important;padding-right:18px!important}\n .hero img{max-width:100%!important;height:auto}\n #seLaunch{right:12px!important;bottom:calc(18px + env(safe-area-inset-bottom))!important;font-size:12px!important;padding:10px 14px!important}\n}\n@media(max-width:480px){\n #ozCombinedHeader .header .header-in #ozFreeLogo{width:135px!important;max-width:35vw!important}\n .hero h1,.hero .hero-title{font-size:clamp(40px,10.2vw,52px)!important}\n .hero .wrap{padding-left:16px!important;padding-right:16px!important}\n}\n";style.textContent+='\n@media(max-width:900px){#ozFreeLogo,#ozCombinedHeader #ozFreeLogo,#ozCombinedHeader .header .header-in #ozFreeLogo{display:none!important;visibility:hidden!important}}';document.head.appendChild(style);applyMobileDirect(document,records);})();
})();