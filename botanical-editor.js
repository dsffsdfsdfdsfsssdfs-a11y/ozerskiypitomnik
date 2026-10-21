(()=>{'use strict';


// Header and page use the same visibility lifecycle (oz-public-ready).
// No separate header-ready delay.
// Load logo editor and published settings without exposing publication to visitors.
(()=>{const script=document.createElement('script');script.src='/oz-logo-editor.js';script.defer=true;document.head.appendChild(script)})();

// Editable header icons and navigation — desktop editor.
(()=>{const js=document.createElement('script');js.src='/oz-header-layout-editor.js';js.defer=true;document.head.appendChild(js)})();

// Current compact header, replacing outdated header layout.
(()=>{
 const style=document.createElement('style');style.id='oz-current-compact-header';
 style.textContent=`
 @media(min-width:901px){
  html body #ozCombinedHeader .header{overflow:visible!important;position:relative!important;border-radius:42px!important}
  html body #ozCombinedHeader .header .header-in{
   height:84px!important;min-height:84px!important;
   border-radius:42px!important;background:#fff!important;box-sizing:border-box!important;
   position:relative!important;overflow:visible!important;
   padding-top:0!important;padding-bottom:0!important;
  }
  html body #ozCombinedHeader .header .header-in::before,
  html body #ozCombinedHeader .header .header-in::after{content:none!important;display:none!important}
  html body #ozCombinedHeader #ozFreeLogo{
   position:absolute!important;top:50%!important;left:50%!important;
   transform:translate(-50%,-50%)!important;border-radius:50%!important;
   background:#fff!important;padding:5px!important;box-sizing:content-box!important;
   z-index:190!important;overflow:visible!important;
  }
  html body #ozCombinedHeader #ozFreeLogo img{width:100%!important;height:auto!important;display:block!important;object-fit:contain!important}
  html body #ozCombinedHeader #mainNav a{font-size:clamp(19px,1.35vw,23px)!important;line-height:1.2!important}
  html body #ozDottedActions .oz-v13-wrap{flex-basis:62px!important}
  html body #ozDottedActions .oz-v13-btn,
  html body #ozHelperToggle,
  html body #ozV13Cart{width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important}
  html body #ozDottedActions svg,html body #ozHelperToggle svg{width:27px!important;height:27px!important}
 }
 #ozV13Cart .oz-new-count-badge,#ozV13Cart .oz-old-number-hidden{display:none!important}
 `;
 document.head.appendChild(style);
})();

// Movable and resizable personal images on the first-screen hero.
(()=>{
 const KEY='ozHeroPersonalImagesV1';
 const DB='ozHeroPersonalImageFilesV1';
 const publishedImages=[{"id":"p1792355844173-an8mt","x":5.579814698961048,"y":10.548821115130105,"w":20,"src":"/hero-decoration-left.png","width":1122,"height":1402},{"id":"p1792355910350-3spmh","x":73.37831793891058,"y":12.179096334305369,"w":17.778150770399307,"src":"/hero-decoration-right.png","width":1122,"height":1402}];
 let data=publishedImages.map(x=>({...x}));try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(saved)&&saved.length){data=publishedImages.map(x=>({...x,...(saved.find(y=>y.id===x.id)||{})}));for(const x of saved)if(!data.some(y=>y.id===x.id))data.push(x)}}catch(e){}
 const css=document.createElement('style');css.id='oz-hero-image-editor-css';
 css.textContent='#ozHeroImageUpload{display:block!important;margin:8px 0!important;width:100%!important;font:15px Neucha,cursive!important}#ozHeroImageList{display:flex;flex-direction:column;gap:8px;margin:10px 0}#ozHeroImageList button{margin:0 4px 0 0!important}#ozHomeLayout50 .ozhero-user-photo{position:absolute!important;z-index:3!important;touch-action:none!important;box-sizing:border-box!important;user-select:none!important;cursor:grab!important}#ozHomeLayout50 .ozhero-user-photo img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}#ozHomeLayout50.oz50-editing .ozhero-user-photo{outline:1px dashed #e8ffd1!important;cursor:move!important}#ozHomeLayout50 .ozhero-photo-handle{display:none;position:absolute;right:-9px;bottom:-9px;width:19px;height:19px;border-radius:5px;background:#f0ffdf;border:2px solid #235b3c;cursor:nwse-resize!important;z-index:3}#ozHomeLayout50.oz50-editing .ozhero-photo-handle{display:block}#ozHeroImageList .oz-photo-line{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:15px}';
 document.head.appendChild(css);
 let db;
 const openDB=()=>new Promise((resolve,reject)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>q.result.createObjectStore('photos',{keyPath:'id'});q.onsuccess=()=>{db=q.result;resolve(db)};q.onerror=()=>reject(q.error)});
 const store=record=>new Promise((resolve,reject)=>{const q=db.transaction('photos','readwrite').objectStore('photos').put(record);q.onsuccess=resolve;q.onerror=()=>reject(q.error)});
 const load=id=>new Promise((resolve,reject)=>{const q=db.transaction('photos','readonly').objectStore('photos').get(id);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
 const remove=id=>new Promise((resolve,reject)=>{const q=db.transaction('photos','readwrite').objectStore('photos').delete(id);q.onsuccess=resolve;q.onerror=()=>reject(q.error)});
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}};
 const publishPhotos=async()=>{
  let password=sessionStorage.getItem('ozLogoEditorPass')||'';
  if(!password)password=prompt('Пароль публикации фотографий:')||'';
  if(!password)return false;
  const images=[];
  for(const photo of data){
   let src=photo.src;
   if(!src){
    const record=await load(photo.id);
    if(!record?.file)throw Error('Не найден файл фотографии '+photo.id);
    const bitmap=await createImageBitmap(record.file);
    const scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    src=canvas.toDataURL('image/webp',.73);
   }
   images.push({...photo,src});
  }
  const response=await fetch('/api/hero-images',{method:'POST',headers:{'Content-Type':'application/json','x-editor-password':password},body:JSON.stringify({images})});
  const result=await response.json();
  if(!response.ok){sessionStorage.removeItem('ozLogoEditorPass');throw Error(result.error||'Не удалось сохранить фотографии')}
  sessionStorage.setItem('ozLogoEditorPass',password);return true;
 };
 window.ozPublishHeroPhotos=publishPhotos;
 const init=async()=>{
  const hero=document.getElementById('ozHomeLayout50'),panel=document.getElementById('oz50EditPanel');if(!hero||!panel||document.getElementById('ozHeroImageUpload'))return;
  try{await openDB()}catch(e){return}
  const area=document.createElement('div');area.innerHTML='<h3 style="font:22px Neucha,cursive;margin:15px 0 6px">Фотографии на главной</h3><div style="font-size:13px;margin-bottom:6px">Выбирай фото, затем в редакторе перетаскивай его и тяни за нижний угол для изменения размера.</div><input id="ozHeroImageUpload" type="file" accept="image/*" multiple><div id="ozHeroImageList"></div>';
  panel.insertBefore(area,panel.querySelector('[data-reset]'));
  const photoPublish=document.createElement('button');photoPublish.type='button';photoPublish.textContent='Опубликовать фотографии для всех';
  photoPublish.onclick=async()=>{photoPublish.disabled=true;photoPublish.textContent='Публикуем фотографии...';try{await publishPhotos();photoPublish.textContent='Фотографии опубликованы!'}catch(e){alert(e.message);photoPublish.textContent='Ошибка. Попробовать ещё'}finally{photoPublish.disabled=false}};
  area.appendChild(photoPublish);
  const fileInput=area.querySelector('input'),list=area.querySelector('#ozHeroImageList');
  const redrawList=()=>{list.replaceChildren();data.forEach((entry,i)=>{const line=document.createElement('div');line.className='oz-photo-line';const text=document.createElement('span');text.textContent='Фото '+(i+1);const btn=document.createElement('button');btn.textContent='Удалить';btn.type='button';btn.onclick=async()=>{document.getElementById('ozhero-photo-'+entry.id)?.remove();data=data.filter(t=>t.id!==entry.id);persist();if(!entry.src)await remove(entry.id);redrawList()};line.append(text,btn);list.appendChild(line)})};
  const draw=async entry=>{
   const record=entry.src?{width:entry.width,height:entry.height}:await load(entry.id);if(!record)return;
   let node=document.getElementById('ozhero-photo-'+entry.id);
   if(node)return;
   node=document.createElement('div');node.className='ozhero-user-photo';node.id='ozhero-photo-'+entry.id;node.innerHTML='<img alt="Добавленное фото"><span class="ozhero-photo-handle"></span>';
   if(entry.src){node.querySelector('img').src=entry.src}else{const url=URL.createObjectURL(record.file);node.querySelector('img').src=url;node.querySelector('img').onload=()=>URL.revokeObjectURL(url)}
   hero.appendChild(node);
   const apply=()=>{node.style.setProperty('left',entry.x+'%','important');node.style.setProperty('top',entry.y+'%','important');node.style.setProperty('width',entry.w+'%','important');node.style.setProperty('height','auto','important');node.style.setProperty('aspect-ratio',String(record.width)+'/'+String(record.height),'important')};
   apply();
   node.addEventListener('pointerdown',e=>{
    if(!hero.classList.contains('oz50-editing')||e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    const rect=hero.getBoundingClientRect(),x=e.clientX,y=e.clientY,ox=entry.x,oy=entry.y,ow=entry.w;
    const sizing=e.target.classList.contains('ozhero-photo-handle');
    node.setPointerCapture(e.pointerId);
    const move=ev=>{if(sizing)entry.w=Math.max(4,Math.min(90,ow+(ev.clientX-x)/rect.width*100));else{entry.x=Math.max(-40,Math.min(100,ox+(ev.clientX-x)/rect.width*100));entry.y=Math.max(-40,Math.min(100,oy+(ev.clientY-y)/rect.height*100))}apply()};
    const end=()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);persist()};
    node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);
   });
  };
  try{
   const response=await fetch('/api/hero-images?fresh='+Date.now(),{cache:'no-store'});
   if(response.ok){const remote=await response.json();if(Array.isArray(remote.images))data=remote.images}
  }catch(e){console.warn('Published photos unavailable',e)}
  for(const entry of data)draw(entry).catch(()=>{});
  redrawList();
  fileInput.addEventListener('change',async()=>{
   for(const file of [...fileInput.files]){
    if(!file.type.startsWith('image/')||file.size>10*1024*1024)continue;
    const id='p'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
    const bm=await createImageBitmap(file);const width=bm.width,height=bm.height;bm.close();
    const entry={id,x:12+data.length*5,y:27+data.length*5,w:20,width,height};
    await store({id,file,width,height});data.push(entry);persist();await draw(entry);
   }
   fileInput.value='';redrawList();
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();setTimeout(init,700)},{once:true});else{init();setTimeout(init,700)}
})();


// Homepage editor v2: inline font sizing and free drag for all hero items.
(()=>{
 const KEY='ozHero50ControlsV2';
 const defaults={"title":70,"subtitle":115,"eyebrow":110,"buttons":95,"primaryWidth":50,"primaryHeight":50,"secondaryWidth":110,"secondaryHeight":125,"showPrimary":true,"showSecondary":false,"titleText":"Питомник, в который хочется вернуться.","subtitleText":"Здесь начинается ваш сад — место, где каждое растение становится частью чего-то прекрасного.","eyebrowText":"КРАСОТА КАЖДОГО СЕЗОНА","primaryText":"В наличии","secondaryText":"О питомнике","eyebrowX":-25,"eyebrowY":-1,"titleX":-4,"titleY":-4,"subtitleX":-5,"subtitleY":0,"primaryX":-8,"primaryY":-2};
 let state={...defaults};try{state={...state,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
 if(state.subtitleText==="Создавайте цветущие уголки и зелёные пространства в своём ритме.")state.subtitleText=defaults.subtitleText;
 const css=document.createElement('style');css.id='oz50-edit-v2-css';
 css.textContent='#oz50EditToggle{position:fixed;bottom:22px;left:22px;z-index:2147483600;padding:12px 17px;border-radius:30px;border:1px solid #79b38b;background:#ebf7e6;color:#17412e;font:18px Neucha,cursive;cursor:pointer;box-shadow:0 5px 20px #0003}#oz50EditPanel{position:fixed;left:22px;bottom:78px;z-index:2147483600;box-sizing:border-box;width:min(355px,calc(100vw - 44px));max-height:68vh;overflow:auto;border-radius:16px;background:#fafff8;padding:18px;color:#153e2a;box-shadow:0 10px 40px #0005;font:17px Neucha,cursive}#oz50EditPanel label{display:flex;align-items:center;justify-content:space-between;margin:10px 0;gap:10px}#oz50EditPanel input[type=range]{width:135px;accent-color:#276842}#oz50EditPanel button{border:0;border-radius:9px;background:#24583b;color:white;padding:8px 13px;font:16px Neucha,cursive;cursor:pointer;margin:4px}#ozHomeLayout50.oz50-editing [data-oz50-drag]{cursor:move!important;touch-action:none!important;user-select:none!important;outline:1px dashed #f2ffca88;outline-offset:5px}';
 document.head.appendChild(css);
 let hero,panel,btn;
 const items=()=>({title:hero?.querySelector('h1'),subtitle:hero?.querySelector('.oz50-summary'),eyebrow:hero?.querySelector('.oz50-eyebrow'),primary:hero?.querySelector('.oz50-primary'),secondary:hero?.querySelector('.oz50-secondary')});
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
 const publish=async()=>{
  let pass=sessionStorage.getItem('ozLogoEditorPass')||'';
  if(!pass)pass=prompt('Пароль для публикации изменений на сайте:')||'';
  if(!pass)return false;
  const btn=panel?.querySelector('[data-save]'),old=btn?.textContent;
  if(btn){btn.disabled=true;btn.textContent='Публикуем...'}
  try{
   const res=await fetch('/api/home-editor',{method:'POST',headers:{'Content-Type':'application/json','x-editor-password':pass},body:JSON.stringify({home:state})});
   const data=await res.json();if(!res.ok)throw Error(data.error||'Ошибка публикации');
   sessionStorage.setItem('ozLogoEditorPass',pass);
   if(btn)btn.textContent='Опубликовано!';
   return true;
  }catch(e){sessionStorage.removeItem('ozLogoEditorPass');alert('Не удалось опубликовать: '+e.message);return false}
  finally{if(btn){btn.disabled=false;setTimeout(()=>{btn.textContent=old},1500)}}
 };
 const apply=()=>{
  if(!hero)return;
  const el=items();
  for(const key of ['title','subtitle','eyebrow','primary','secondary'])if(el[key])el[key].textContent=state[key+'Text']??defaults[key+'Text'];
  const bases={title:'clamp(55px,8vw,132px)',subtitle:'clamp(20px,1.8vw,29px)',eyebrow:'clamp(16px,1.4vw,22px)',primary:'21px',secondary:'21px'};
  for(const key of Object.keys(bases)){
   const n=el[key];if(!n)continue;
   const pct=key==='primary'||key==='secondary'?state.buttons:state[key];
   // Set style property on the actual element, overriding the earlier !important rule.
   n.style.setProperty('font-size','calc('+bases[key]+' * '+(Number(pct)||100)/100+')','important');
   n.style.setProperty('transform','translate('+(state[key+'X']||0)+'px,'+(state[key+'Y']||0)+'px)','important');
  }
  for(const key of ['primary','secondary'])if(el[key]){const n=el[key];n.style.setProperty('padding-left','calc(29px * '+(Number(state[key+'Width'])||100)/100+')','important');n.style.setProperty('padding-right','calc(29px * '+(Number(state[key+'Width'])||100)/100+')','important');n.style.setProperty('min-height','calc(54px * '+(Number(state[key+'Height'])||100)/100+')','important');n.style.setProperty('padding-top','calc(14px * '+(Number(state[key+'Height'])||100)/100+')','important');n.style.setProperty('padding-bottom','calc(14px * '+(Number(state[key+'Height'])||100)/100+')','important')}
  if(el.primary)el.primary.style.setProperty('display',state.showPrimary?'inline-flex':'none','important');
  if(el.secondary)el.secondary.style.setProperty('display',state.showSecondary?'inline-flex':'none','important');
 };
 const init=()=>{
  hero=document.getElementById('ozHomeLayout50');if(!hero)return;
  apply();if(document.getElementById('oz50EditToggle'))return;
  btn=document.createElement('button');btn.id='oz50EditToggle';btn.textContent='✎ Редактор главной';
  panel=document.createElement('div');panel.id='oz50EditPanel';panel.hidden=true;
  panel.innerHTML='<strong style="font-size:22px">Настройка первого экрана</strong><p style="font-size:14px">Открой редактор и зажимай мышью любой текст или кнопку, чтобы переместить.</p>'+[['title','Заголовок'],['subtitle','Описание'],['eyebrow','Верхняя надпись'],['buttons','Текст кнопок']].map(([key,t])=>'<label>'+t+'<input data-size="'+key+'" type="range" min="45" max="180" step="5"><output data-out="'+key+'"></output></label>').join('')+'<div style="margin-top:14px;font-weight:bold">Изменить надписи</div>'+[['title','Большой заголовок'],['subtitle','Описание'],['eyebrow','Верхняя надпись'],['primary','Первая кнопка'],['secondary','Вторая кнопка']].map(([key,name])=>'<label class="oz50TextLabel">'+name+(key==='title'||key==='subtitle'?'<textarea data-text="'+key+'"></textarea>':'<input data-text="'+key+'" type="text">')+'</label>').join('')+'<div style="margin-top:14px;font-weight:bold">Размер самих кнопок</div>'+[['primaryWidth','Первая — ширина'],['primaryHeight','Первая — высота'],['secondaryWidth','Вторая — ширина'],['secondaryHeight','Вторая — высота']].map(([key,name])=>'<label>'+name+'<input data-size="'+key+'" type="range" min="50" max="220" step="5"><output data-out="'+key+'"></output></label>').join('')+'<label>Показать ассортимент <input type="checkbox" data-check="showPrimary"></label><label>Показать «О питомнике» <input type="checkbox" data-check="showSecondary"></label><button data-reset>Сбросить</button><button data-save>Сохранить и закрыть</button>';
  document.body.append(btn,panel);
  const es=items();Object.entries(es).forEach(([key,n])=>{
   if(!n)return;n.dataset.oz50Drag=key;
   n.addEventListener('click',e=>{if(!panel.hidden){e.preventDefault();e.stopPropagation()}},true);
   n.addEventListener('pointerdown',e=>{
    if(panel.hidden||e.button!==0)return;
    e.preventDefault();e.stopPropagation();const k=key,sx=e.clientX,sy=e.clientY,ox=state[k+'X']||0,oy=state[k+'Y']||0;
    n.setPointerCapture(e.pointerId);
    const move=ev=>{state[k+'X']=Math.round(ox+ev.clientX-sx);state[k+'Y']=Math.round(oy+ev.clientY-sy);apply()};
    const end=()=>{n.removeEventListener('pointermove',move);n.removeEventListener('pointerup',end);n.removeEventListener('pointercancel',end);save()};
    n.addEventListener('pointermove',move);n.addEventListener('pointerup',end);n.addEventListener('pointercancel',end);
   });
  });
  const sync=()=>{
   panel.querySelectorAll('[data-size]').forEach(input=>{input.value=state[input.dataset.size];panel.querySelector('[data-out="'+input.dataset.size+'"]').textContent=input.value+'%'});
   panel.querySelectorAll('[data-check]').forEach(input=>input.checked=!!state[input.dataset.check]);
   panel.querySelectorAll('[data-text]').forEach(input=>{if(document.activeElement!==input)input.value=state[input.dataset.text+'Text']??defaults[input.dataset.text+'Text']});
  };
  const toggle=on=>{panel.hidden=!on;hero.classList.toggle('oz50-editing',on);btn.textContent=on?'✕ Закрыть редактор':'✎ Редактор главной'};
  btn.onclick=()=>{toggle(panel.hidden);sync()};
  panel.oninput=e=>{const t=e.target;if(t.dataset.size)state[t.dataset.size]=Number(t.value);if(t.dataset.check)state[t.dataset.check]=t.checked;if(t.dataset.text)state[t.dataset.text+'Text']=t.value;apply();sync();save()};
  panel.querySelector('[data-reset]').onclick=()=>{state={...defaults};apply();sync();save()};
  panel.querySelector('[data-save]').onclick=async()=>{save();if(await publish()){try{if(window.ozPublishHeroPhotos)await window.ozPublishHeroPhotos();toggle(false)}catch(e){alert('Тексты опубликованы, но фотографии нет: '+e.message)}}};
  sync();
  fetch('/api/home-editor?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
   if(data?.home){state={...defaults,...data.home};apply();sync()}
  }).catch(e=>console.warn('Homepage settings unavailable',e));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();setTimeout(init,500)},{once:true});else{init();setTimeout(init,500)}
})();

// Full-screen homepage concept 50: cinematic centered typography with nursery photograph.
(()=>{
 const css=document.createElement('style');css.id='oz-home-layout50-css';
 css.textContent=[
  'html body #ozHomeLayout50{display:flex!important;position:relative!important;margin-top:-100px!important;isolation:isolate!important;align-items:center!important;justify-content:center!important;min-height:calc(100svh - 55px)!important;width:100%!important;padding:170px 7vw 85px!important;box-sizing:border-box!important;overflow:hidden!important;background:#153e30 url("/hero-seedlings-22.jpg") center center/cover no-repeat!important;color:#fff!important;text-align:center!important}',
  'html body #ozHomeLayout50::before{content:""!important;display:block!important;position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(0,27,20,.77),rgba(23,70,49,.34)),linear-gradient(0deg,rgba(13,41,33,.66),transparent 50%)!important;z-index:0!important;pointer-events:none!important}',
  'html body #ozHomeLayout50 .oz50-content{position:relative!important;z-index:1!important;width:min(1100px,100%)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important}',
  'html body #ozHomeLayout50 .oz50-eyebrow{color:#f2f9ee!important;font:400 clamp(16px,1.4vw,22px)/1.25 "Neucha",cursive!important;letter-spacing:.19em!important;text-transform:uppercase!important;margin:0 0 22px!important}',
  'html body #ozHomeLayout50 h1{font:400 clamp(55px,8vw,132px)/.91 "Neucha",cursive!important;letter-spacing:-.025em!important;color:#fff!important;margin:0 0 26px!important;text-wrap:balance!important;max-width:1100px!important}',
  'html body #ozHomeLayout50 .oz50-summary{font:400 clamp(20px,1.8vw,29px)/1.3 "Neucha",cursive!important;letter-spacing:.02em!important;color:#f0f6ef!important;max-width:660px!important;margin:0 auto 32px!important}',
  'html body #ozHomeLayout50 .oz50-actions{display:flex!important;justify-content:center!important;flex-wrap:wrap!important;gap:13px!important}',
  'html body #ozHomeLayout50 .oz50-actions a{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:54px!important;padding:14px 29px!important;border-radius:100px!important;font:400 21px/1.2 "Neucha",cursive!important;letter-spacing:.025em!important;text-decoration:none!important}',
  'html body #ozHomeLayout50 .oz50-primary{background:#e1f1d7!important;color:#143929!important;border:1px solid #e1f1d7!important}',
  'html body #ozHomeLayout50 .oz50-secondary{background:transparent!important;color:#fff!important;border:1px solid rgba(255,255,255,.66)!important}',
  'html body #ozHomeLayout50 .oz50-bottom{position:absolute!important;bottom:24px!important;right:5vw!important;z-index:1!important;color:rgba(255,255,255,.78)!important;font:400 14px "Neucha",cursive!important;letter-spacing:.12em!important}',
  'html body #ozCombinedHeader,html body header,html body .header{position:relative;z-index:5}',
  'html body .hero:not(#ozHomeLayout50){min-height:0!important;padding-top:0!important;padding-bottom:0!important;margin-top:0!important;margin-bottom:0!important}',
  '@media(max-width:760px){html body #ozHomeLayout50{min-height:calc(100svh - 65px)!important;margin-top:-85px!important;padding:140px 7% 70px!important}html body #ozHomeLayout50 h1{font-size:clamp(48px,12vw,82px)!important}html body #ozHomeLayout50 .oz50-summary{font-size:20px!important}html body #ozHomeLayout50 .oz50-bottom{display:none!important}}'
 ].join('\n');
 document.head.appendChild(css);
 const mount=()=>{
  if(document.getElementById('ozHomeLayout50'))return;
  const hero=document.querySelector('.hero,.home-hero,.hero-section,#home');
  if(!hero)return;
  const section=document.createElement('section');section.id='ozHomeLayout50';
  section.innerHTML='<div class="oz50-content"><div class="oz50-eyebrow">КРАСОТА КАЖДОГО СЕЗОНА</div><h1>Питомник, в который хочется вернуться.</h1><p class="oz50-summary">Здесь начинается ваш сад — место, где каждое растение становится частью чего-то прекрасного.</p><div class="oz50-actions"><a class="oz50-primary" href="#catalog">Открыть ассортимент</a><a class="oz50-secondary" href="#about">О питомнике</a></div></div>';
  hero.insertAdjacentElement('afterend',section);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.addEventListener('load',mount,{once:true});setTimeout(mount,900);
})();


// Definitive four-item top strip: locate visible original text and anchor a replacement.
(()=>{
 const names=['Озерск · Челябинская область','Выращено с заботой о вашем саде','Питомник Елены Ершовой','Товары для сада · Посадочный материал'];
 const css=document.createElement('style');css.id='oz-four-strip-v3-css';
 css.textContent='#oz-four-strip-v3{position:absolute!important;display:grid!important;grid-template-columns:1.1fr 1.5fr 1.1fr 1.55fr!important;align-items:center!important;column-gap:20px!important;box-sizing:border-box!important;padding:0 clamp(18px,2.8vw,56px)!important;z-index:2147483000!important;pointer-events:none!important;color:#e4f0e5!important;font-family:"Neucha",cursive!important;font-size:clamp(12px,1vw,18px)!important;line-height:1.15!important;letter-spacing:.06em!important}#oz-four-strip-v3>span{font-family:"Neucha",cursive!important;letter-spacing:.06em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important}#oz-four-strip-v3>span:nth-child(2),#oz-four-strip-v3>span:nth-child(3){text-align:center!important}#oz-four-strip-v3>span:last-child{text-align:right!important}@media(max-width:1100px){#oz-four-strip-v3{gap:8px!important;font-size:11px!important}#oz-four-strip-v3>span{white-space:normal!important}}';
 document.head.appendChild(css);
 let strip=null;
 const findText=(query)=>{
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n;
  while((n=walker.nextNode())){
   if(!n.nodeValue||!n.nodeValue.includes(query))continue;
   const el=n.parentElement;if(!el||el.closest('script,style,#oz-four-strip-v3'))continue;
   const rect=el.getBoundingClientRect();
   if(rect.width>0&&rect.height>0)return el;
  }
  return null;
 };
 const render=()=>{
  const left=findText('Челябинская область'),right=findText('Растения для сада и дома');
  const anchor=left||right;
  if(!anchor)return;
  let bar=anchor;
  for(let k=0;k<8&&bar.parentElement;k++){
   const rr=bar.getBoundingClientRect();
   if(rr.width>=window.innerWidth*.70&&rr.height>=24&&rr.height<=95)break;
   bar=bar.parentElement;
  }
  // Put the captions inside the existing bar so sticky scrolling carries them along.
  if(!strip){
   strip=document.createElement('div');strip.id='oz-four-strip-v3';
   names.forEach(name=>{const x=document.createElement('span');x.textContent=name;strip.appendChild(x)});
  }
  if(strip.parentElement!==bar)bar.appendChild(strip);
  if(getComputedStyle(bar).position==='static')bar.style.setProperty('position','relative','important');
  strip.style.setProperty('inset','0','important');
  strip.style.setProperty('width','100%','important');
  strip.style.setProperty('height','100%','important');
  if(left)left.style.setProperty('visibility','hidden','important');
  if(right)right.style.setProperty('visibility','hidden','important');
 };
 const init=()=>{
  render();setTimeout(render,250);setTimeout(render,900);setTimeout(render,2500);
  window.addEventListener('resize',render,{passive:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

// Airier tracking for the two nursery location/tagline labels only.
(()=>{
 const phrases=['Озерск · Челябинская область','Растения для сада и дома'];
 const apply=()=>{
  const nodes=document.querySelectorAll('p,span,div,small,strong,a,h1,h2,h3,h4');
  for(const el of nodes){
   if(el.children.length>0)continue;
   const value=(el.textContent||'').replace(/\s+/g,' ').trim();
   if(!phrases.includes(value))continue;
   el.style.setProperty('letter-spacing','.095em','important');
   el.style.setProperty('word-spacing','.16em','important');
   el.style.setProperty('line-height','1.5','important');
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
 let pending=false;
 const observer=new MutationObserver(()=>{
  if(pending)return;
  pending=true;requestAnimationFrame(()=>{pending=false;apply()});
 });
 const begin=()=>observer.observe(document.body,{subtree:true,childList:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();


// Plain white homepage background, without changing navigation or other sections.
(()=>{
 const st=document.createElement('style');st.id='oz-home-white-background';
 st.textContent=[
 'html body .hero,html body .home-hero,html body .hero-section,html body #home{background:#fff!important;background-color:#fff!important;background-image:none!important}',
 'html body .hero::before,html body .hero::after,html body #home::before,html body #home::after{display:none!important;content:none!important}',
 'html body #ozHero22Continuous{display:none!important}'
 ].join('\n');
 document.head.appendChild(st);
})();


// Improve readability: modest tracking across all visible website text.
(()=>{
 const style=document.createElement('style');
 style.id='oz-site-wide-letter-spacing';
 style.textContent=[
 'html body,html body *:not(svg):not(svg *):not([class*="icon"]):not(i){letter-spacing:.035em!important}',
 'html body h1,html body h2,html body h3,html body h4{letter-spacing:.025em!important}',
 'html body :is(button,input,textarea,select){letter-spacing:.025em!important}',
 'html body #ozCombinedHeader a,html body #mainNav a{letter-spacing:.055em!important}',
 'html body #ozHelper13,html body #ozHelper13 *:not(svg):not(svg *){letter-spacing:.015em!important}',
 'html body #ozHelper13 .oz-vk-title{letter-spacing:.025em!important}'
 ].join('\n');
 document.head.appendChild(style);
})();


// Keep navigation, remove the entire original home hero (including old collage).
(()=>{
 const st=document.createElement('style');
 st.id='oz-empty-home-hero';
 st.textContent=[
  'html body .hero,html body .home-hero,html body .hero-section,html body #home{background:none!important;background-image:none!important;box-shadow:none!important;filter:none!important;animation:none!important;transition:none!important;min-height:0!important}',
  'html body .hero::before,html body .hero::after,html body #home::before,html body #home::after{content:none!important;display:none!important}',
  'html body .hero > :not(#ozCombinedHeader):not(.header),html body .home-hero > :not(#ozCombinedHeader):not(.header),html body #home > :not(#ozCombinedHeader):not(.header){display:none!important}',
  'html body #ozHero22Continuous,html body #ozHeroText45{display:none!important}'
 ].join('\n');
 document.head.appendChild(st);
 const clean=()=>{
  document.getElementById('ozHero22Continuous')?.remove();
  document.getElementById('ozHeroText45')?.remove();
  for(const h of document.querySelectorAll('h1,h2')){
   if(!/Ваш сад|Ваше место силы/i.test(h.textContent||''))continue;
   let p=h;
   for(let i=0;i<9&&p?.parentElement;i++){
    if(p.matches('section,.hero,.home-hero,.hero-section,#home,[class*="hero"]'))break;
    p=p.parentElement;
   }
   if(p&&!p.contains(document.getElementById('ozCombinedHeader'))){p.style.setProperty('display','none','important');}
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
 window.addEventListener('load',clean,{once:true});
 setTimeout(clean,450);
 setTimeout(clean,1400);
})();

// Restore the helper's original UI typography while keeping Neucha on social-service tiles.
(()=>{
 const st=document.createElement('style');
 st.id='oz-helper-original-type';
 st.textContent=[
  'html body #ozHelper13,html body #ozHelper13 *:not(svg):not(svg *){font-family:Arial,Helvetica,sans-serif!important}',
  'html body #ozHelper13 a[href*="vk.com"],html body #ozHelper13 a[href*="vk.com"] *:not(svg):not(svg *),html body #ozHelper13 a[href*="t.me"],html body #ozHelper13 a[href*="t.me"] *:not(svg):not(svg *),html body #ozHelper13 .oz-max-tile,html body #ozHelper13 .oz-max-tile *:not(svg):not(svg *){font-family:"Neucha",cursive!important}',
  'html body #ozHelper13 a[href*="vk.com"],html body #ozHelper13 a[href*="vk.com"] *:not(svg):not(svg *){font-family:"Neucha",cursive!important;font-size:15px!important;line-height:1.2!important}',
 ].join('\n');
 document.head.appendChild(st);
})();



// Apply VK typography to the actual helper social card, including non-link titles.
(()=>{
 const st=document.createElement('style');st.id='oz-helper-vk-title-font';
 st.textContent='#ozHelper13 .oz-vk-tile,#ozHelper13 .oz-vk-tile *:not(svg):not(svg *){font-family:"Neucha",cursive!important}#ozHelper13 .oz-vk-tile .oz-vk-title{font-family:"Neucha",cursive!important;font-size:21px!important;font-weight:400!important;line-height:1.12!important;letter-spacing:0!important}';
 document.head.appendChild(st);
 const apply=()=>{
  const root=document.getElementById('ozHelper13');if(!root)return;
  const nodes=[...root.querySelectorAll('a,button,div,span')];
  const title=nodes.find(el=>el.children.length===0&&el.textContent.trim()==='ВКонтакте');
  if(!title)return;
  title.classList.add('oz-vk-title');
  const card=title.closest('a,button,[class*="social"],[class*="tile"]');
  if(card)card.classList.add('oz-vk-tile');
  title.style.setProperty('font-family','"Neucha",cursive','important');
  title.style.setProperty('font-size','21px','important');
  title.style.setProperty('font-weight','400','important');
  title.style.setProperty('letter-spacing','0','important');
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
 const watcher=new MutationObserver(apply);watcher.observe(document.documentElement,{childList:true,subtree:true});
})();

// Site-wide Neucha typography (including dynamically added content).
(()=>{
 const font=document.createElement('link');
 font.rel='stylesheet';
 font.href='https://fonts.googleapis.com/css2?family=Neucha&display=swap';
 document.head.appendChild(font);
 const st=document.createElement('style');
 st.id='oz-global-neucha';
 st.textContent='html body,html body *:not(svg):not(svg *){font-family:"Neucha",cursive!important}html body input,html body textarea,html body select,html body button{font-family:"Neucha",cursive!important}';
 document.head.appendChild(st);
})();



// Make the five main header menu labels more legible.
(()=>{
 const st=document.createElement('style');st.id='oz-header-links-larger';
 st.textContent='html body #ozCombinedHeader a[href*="#catalog"],html body #ozCombinedHeader a[href*="#about"],html body #ozCombinedHeader a[href*="#gallery"],html body #ozCombinedHeader a[href*="#video"],html body #ozCombinedHeader a[href*="#contacts"],html body #mainNav a[href*="#catalog"],html body #mainNav a[href*="#about"],html body #mainNav a[href*="#gallery"],html body #mainNav a[href*="#video"],html body #mainNav a[href*="#contacts"]{font-family:"Neucha",cursive!important;font-size:19px!important;letter-spacing:.055em!important;font-stretch:expanded!important;line-height:1.2!important;white-space:nowrap!important}';
 document.head.appendChild(st);
})();

// Increase readability of Neucha outside the main hero copy and helper dialogue.
(()=>{
 const st=document.createElement('style');st.id='oz-neucha-readable';
 st.textContent=[
  '#ozCombinedHeader #mainNav a,#ozCombinedHeader .header a,#mainNav a{font-size:17px!important}',
  'body :is(#catalog,#catalogue,.catalog,.products,.product-grid,.catalog-grid,footer,.footer) :is(p,li,span,a,label,small,button){font-size:max(16px,1em)!important;line-height:1.45!important}',
  'body :is(#catalog,#catalogue,.catalog,.products,.product-grid,.catalog-grid) :is(h2,h3,h4){font-size:clamp(23px,2.15vw,32px)!important;line-height:1.18!important}',
  'body :is(#ozNewCartDialog,#ozCheckoutForm,.oz-checkout-modal) :is(p,li,span,a,label,small,button,input,textarea,select){font-size:17px!important;line-height:1.35!important}',
  'body :is(button,.btn,[role="button"]):not(#ozHeroText45 *):not(#ozHelper13 *){font-size:max(16px,1em)!important}',
  '#ozHeroText45 .oz45-kicker,#ozHeroText45 h1,#ozHeroText45 p,#ozHeroText45 a{font-size:revert-layer}',
  '@media(max-width:760px){#ozCombinedHeader #mainNav a,#mainNav a{font-size:16px!important}}'
 ].join('\n');document.head.appendChild(st);
})();













// Independent central cart v2. Does not reuse, move, or modify the old drawer.
(()=>{
 // Cart is deliberately kept in memory only: fresh visit starts empty.
 const key='oz-new-cart-v2';
 let items=[];
 try{localStorage.removeItem(key)}catch{}
 const save=()=>{};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const style=document.createElement('style');style.id='oz-new-cart-css';
 style.textContent=[
 '#ozNewCartOverlay{position:fixed;inset:0;background:#0a21188c;backdrop-filter:blur(3px);z-index:2147483644;display:none;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}',
 '#ozNewCartOverlay.open{display:flex}',
 '#ozV13Cart{position:relative!important}#ozV13Cart .oz-new-count-badge{position:absolute!important;top:-4px!important;right:-5px!important;min-width:18px!important;height:18px!important;padding:0 4px!important;box-sizing:border-box!important;border-radius:20px!important;background:#1d513b!important;color:white!important;font-size:11px!important;line-height:18px!important;text-align:center!important;z-index:50!important;pointer-events:none!important}#ozV13Cart .oz-old-number-hidden{display:none!important}',
 '#ozNewCartDialog{background:#fff;width:min(490px,100%);height:min(620px,calc(100dvh - 24px));max-height:calc(100dvh - 24px);border-radius:20px;box-shadow:0 25px 100px #051a1370;overflow:hidden;display:flex;flex-direction:column;font:inherit;color:#244233}',
 '#ozNewCartHead{background:#173e30;color:#fff;padding:19px 22px;display:flex;align-items:center;justify-content:space-between;flex:none}',
 '#ozNewCartHead strong{font-size:19px}',
 '#ozNewCartClose{background:#f0f5ee;border:0;border-radius:50%;width:36px;height:36px;color:#1a4e35;font-size:23px;cursor:pointer;display:grid;place-items:center}',
 '#ozNewCartItems{overflow-y:auto;min-height:0;flex:1;padding:15px 20px}',
 '.oz-new-line{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #e1eae2;align-items:center}',
 '.oz-new-line img{width:75px;height:75px;object-fit:cover;border-radius:12px;background:#edf2eb;flex:none}',
 '.oz-new-info{flex:1;min-width:0}.oz-new-info strong{display:block;color:#1e4232;font-size:14px;line-height:1.35}.oz-new-info small{color:#658174;font-size:12px}',
 '.oz-new-actions{display:flex;gap:7px;align-items:center;margin-top:9px}.oz-new-actions button{min-width:27px;height:27px;border:0;background:#e8f1e8;border-radius:8px;color:#244b35;cursor:pointer}.oz-new-actions .oz-remove{margin-left:auto;background:transparent;color:#7b8a7e;font-size:16px}',
 '#ozNewCartFoot{flex:none;padding:15px 20px;background:#f4f8f2;border-top:1px solid #e0e9df}',
 '#ozNewCartFoot p{font-size:11px;line-height:1.4;color:#728777;margin:0 0 10px}',
 '#ozNewCartOrder{display:block;border:0;background:#194a37;color:white;border-radius:11px;padding:12px 17px;margin:0 auto;font:inherit;font-weight:700;cursor:pointer;max-width:210px}',
 '#ozNewCartOrder:disabled{opacity:.5;cursor:not-allowed}',
 '#ozNewCartFoot .oz-cart-footer-actions{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap}',
 '#ozNewCartClear{border:1px solid #c8d6c9;background:#fff;color:#526b58;border-radius:11px;padding:11px 13px;font:inherit;font-size:13px;cursor:pointer}',
 '#ozNewCartClear:hover{background:#f1f5ef}#ozNewCartClear:disabled{opacity:.45;cursor:not-allowed}',
 '#ozNewCartEmpty{text-align:center;padding:48px 12px 28px;color:#688073;font-size:14px}',
 '#ozNewCartCatalog{display:block;background:#e3efe3;color:#1b5038;border:1px solid #a8c6ab;border-radius:10px;margin:15px auto 0;padding:11px 16px;font:inherit;font-weight:700;cursor:pointer}',
 'body.oz-new-cart-active [class*="cart-drawer" i],body.oz-new-cart-active [id*="cart-drawer" i]{display:none!important}'
 ].join('\n');document.head.appendChild(style);
 const overlay=document.createElement('div');overlay.id='ozNewCartOverlay';
 overlay.innerHTML='<section id="ozNewCartDialog" role="dialog" aria-modal="true" aria-label="Ваша корзина"><header id="ozNewCartHead"><strong>Ваша корзина <span id="ozNewCartCount"></span></strong><button id="ozNewCartClose" aria-label="Закрыть">×</button></header><div id="ozNewCartItems"></div><footer id="ozNewCartFoot"><p>Добавленные товары не резервируются автоматически. Отправьте заявку питомнику для уточнения наличия и стоимости.</p><div class="oz-cart-footer-actions"><button id="ozNewCartClear" type="button">Очистить корзину</button><button id="ozNewCartOrder">Оформить заказ</button></div></footer></section>';
 const mount=()=>{if(!overlay.isConnected)document.body.append(overlay)};
 let previousFocus=null;
 const updateCount=()=>{
  const n=items.reduce((sum,x)=>sum+x.qty,0);
  const count=overlay.querySelector('#ozNewCartCount');if(count)count.textContent='('+n+')';
  const trigger=document.getElementById('ozV13Cart');if(!trigger)return;
  // Keep the header cart icon badge-free. Quantity remains visible in the cart dialog.
  trigger.querySelectorAll('.oz-new-count-badge').forEach(badge=>badge.remove());
  [...trigger.querySelectorAll('span,b,strong')].forEach(el=>{
   if(el===badge||el.closest('.oz-new-count-badge'))return;
   if(el.children.length===0&&/^\d+$/.test(el.textContent.trim()))el.classList.add('oz-old-number-hidden');
  });
 };
 const render=()=>{
  const list=overlay.querySelector('#ozNewCartItems');
  list.innerHTML=items.length?items.map((x,i)=>'<div class="oz-new-line">'+(x.img?'<img src="'+esc(x.img)+'" alt="'+esc(x.name)+'">':'')+'<div class="oz-new-info"><strong>'+esc(x.name)+'</strong><small>'+(x.price?'Цена: '+esc(x.price):'Цена уточняется')+'</small><div class="oz-new-actions"><button data-cart-i="'+i+'" data-action="minus" aria-label="Уменьшить количество">−</button><b>'+x.qty+'</b><button data-cart-i="'+i+'" data-action="plus" aria-label="Увеличить количество">+</button><button class="oz-remove" data-cart-i="'+i+'" data-action="remove" aria-label="Удалить товар">×</button></div></div></div>').join(''):'<div id="ozNewCartEmpty">Корзина пока пуста. Выберите растения в каталоге.<button type="button" id="ozNewCartCatalog">Перейти в каталог</button></div>';
  overlay.querySelector('#ozNewCartOrder').disabled=!items.length;overlay.querySelector('#ozNewCartClear').disabled=!items.length;updateCount();save();
 };
 const toastStyle=document.createElement('style');toastStyle.id='oz-order-toast-style';
 toastStyle.textContent='#ozOrderToast{position:fixed;left:50%;bottom:35px;transform:translate(-50%,18px);max-width:min(480px,calc(100vw - 24px));width:max-content;z-index:2147483647;display:flex;align-items:center;gap:16px;padding:20px 24px;border-radius:18px;background:#e8ece9;color:#334b40;border:1px solid #cbd4ce;box-shadow:0 12px 34px #14291d22;font-size:18px;line-height:1.42;opacity:0;pointer-events:none;transition:opacity .35s ease,transform .35s ease}#ozOrderToast.oz-toast-show{opacity:1;transform:translate(-50%,0)}#ozOrderToast svg{width:38px;height:38px;flex:none;stroke:#4d8064;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}@media(prefers-reduced-motion:reduce){#ozOrderToast{transition:none}}';
 document.head.appendChild(toastStyle);
 let toastTimeout;
 const showThanks=()=>{
  let toast=document.getElementById('ozOrderToast');
  if(!toast){toast=document.createElement('div');toast.id='ozOrderToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16 9"></path></svg><span><strong>Спасибо за заказ!</strong><br>Специалист свяжется с вами после обработки заявки.</span>';document.body.appendChild(toast)}
  clearTimeout(toastTimeout);toast.classList.remove('oz-toast-show');
  requestAnimationFrame(()=>requestAnimationFrame(()=>toast.classList.add('oz-toast-show')));
  toastTimeout=setTimeout(()=>toast.classList.remove('oz-toast-show'),4400);
 };
 const open=()=>{mount();previousFocus=document.activeElement;render();overlay.classList.add('open');document.body.classList.add('oz-new-cart-active');overlay.querySelector('#ozNewCartClose').focus()};
 const close=()=>{const f=overlay.querySelector('#ozCheckoutStep');if(f)f.hidden=true;overlay.querySelector('#ozNewCartDialog')?.classList.remove('oz-checkout-mode');overlay.classList.remove('open');document.body.classList.remove('oz-new-cart-active');if(previousFocus?.focus)previousFocus.focus()};
 const findProduct=(button)=>{
  let el=button;
  for(let i=0;i<12&&el&&el!==document.body;i++,el=el.parentElement){
   if(el.closest('#ozNewCartOverlay'))return null;
   const img=el.querySelector('img');
   if(!img)continue;
   const r=el.getBoundingClientRect();
   if(r.width<150||r.width>650||r.height<170||r.height>1100)continue;
   const ownText=(el.innerText||'').trim();
   if(!/цена по запросу|₽|саженц|гортенз|яблон|груш|растени|хвойн|плодов|декоратив/i.test(ownText))continue;
   const title=el.querySelector('h2,h3,h4,[class*="product-name"],[class*="product-title"],[class*="plant-name"]');
   if(title&&title.textContent.trim().length>2)return el;
   const fragments=ownText.split('\n').map(x=>x.trim()).filter(x=>x.length>2&&x.length<100);
   if(fragments.length>=2)return el;
  }
  return null;
 };
 const getTitle=(card)=>{
  const heading=card.querySelector('h2,h3,h4,[class*="product-name"],[class*="product-title"],[class*="plant-name"]');
  if(heading?.textContent.trim())return heading.textContent.trim();
  const lines=(card.innerText||'').split('\n').map(x=>x.trim()).filter(Boolean);
  return lines.find(x=>x.length>=4&&x.length<95&&!/^(популярное|плодовые|декоративные|рассада|цветы|цена по запросу|в корзину|добавить)$/i.test(x))||'';
 };
 const addFromCard=(button,delta=1)=>{
  const card=findProduct(button);if(!card)return false;
  const name=getTitle(card);if(!name||name.length>130)return false;
  const img=card.querySelector('img')?.currentSrc||card.querySelector('img')?.src||'';
  const price=(card.querySelector('[class*="price"]')?.textContent||'').trim().slice(0,60);
  const id=card.getAttribute('data-product-id')||card.getAttribute('data-id')||name;
  const item=items.find(x=>x.id===id);
  if(item){item.qty+=delta;if(!item.img&&img)item.img=img}
  else if(delta>0)items.push({id,name,img,price,qty:delta});
  items=items.filter(x=>x.qty>0);render();return true;
 };
 overlay.querySelector('#ozNewCartClear').addEventListener('click',()=>{
  if(!items.length)return;
  if(!window.confirm('Удалить все товары из корзины?'))return;
  items=[];render();
 });
 overlay.addEventListener('click',e=>{
  if(e.target===overlay||e.target.closest('#ozNewCartClose')){close();return}
  if(e.target.closest('#ozNewCartCatalog')){close();const link=[...document.querySelectorAll('a[href]')].find(a=>/каталог/i.test(a.textContent||'')&&!(a.closest('#ozNewCartOverlay')));const section=document.querySelector('#catalog,#catalogue,[id*="catalog" i]');if(section)section.scrollIntoView({behavior:'smooth',block:'start'});else if(link)link.click();else location.hash='catalog';return}
  const b=e.target.closest('[data-action]');if(!b)return;
  const i=Number(b.dataset.cartI);if(!items[i])return;
  if(b.dataset.action==='plus')items[i].qty++;
  else if(b.dataset.action==='minus')items[i].qty--;
  else items[i].qty=0;
  items=items.filter(x=>x.qty>0);render();
 });

 // Second checkout step. The order is not submitted until the visitor explicitly sends it.
 const form=document.createElement('section');form.id='ozCheckoutStep';form.hidden=true;
 form.innerHTML='<div class="oz-checkout-top"><button type="button" id="ozCheckoutBack">← Назад к корзине</button><h2>Оформление заказа</h2><p>Проверьте контактные данные — специалист свяжется с вами для уточнения заказа.</p></div><form id="ozCheckoutForm"><label>Ваше имя <input name="customerName" autocomplete="name" maxlength="100" placeholder="Как к вам обращаться" required></label><label>Номер телефона <input name="customerPhone" type="tel" autocomplete="tel" placeholder="+7 999 123-45-67" minlength="10" maxlength="30" required></label><label>Электронная почта <input name="customerEmail" type="email" autocomplete="email" placeholder="example@mail.ru" required></label><fieldset><legend>Куда удобнее написать? Выберите один вариант</legend><div class="oz-contact-choices"><label><input type="radio" name="contactService" value="ВКонтакте" required> ВКонтакте</label><label><input type="radio" name="contactService" value="Telegram"> Telegram</label><label><input type="radio" name="contactService" value="MAX"> MAX</label></div><input id="ozContactValue" name="contactValue" placeholder="Сначала выберите способ связи" maxlength="250" required disabled></fieldset><p class="oz-contact-warning">Пожалуйста, указывайте только достоверную и актуальную информацию. Иначе специалист по работе с клиентами не сможет связаться с вами по поводу выбранного заказа.</p><label class="oz-checkout-agree"><input name="dataConsent" type="checkbox" required> Согласен(на) на использование указанных контактных данных для связи по моему заказу.</label><button type="submit" class="oz-checkout-submit">Подготовить заявку</button><div id="ozCheckoutResult" aria-live="polite"></div></form>';
 overlay.querySelector('#ozNewCartDialog').appendChild(form);
 const formStyle=document.createElement('style');formStyle.id='oz-checkout-form-css';
 formStyle.textContent=[
 '#ozNewCartDialog.oz-checkout-mode>#ozNewCartItems,#ozNewCartDialog.oz-checkout-mode>#ozNewCartFoot{display:none!important}',
 '#ozNewCartDialog.oz-checkout-mode #ozNewCartHead{display:none!important}',
 '#ozCheckoutStep[hidden]{display:none!important}#ozCheckoutStep{display:flex;flex-direction:column;min-height:0;overflow-y:auto;flex:1;background:#fff}',
 '#ozCheckoutStep .oz-checkout-top{padding:20px 22px 8px;background:#173e30;color:white}',
 '#ozCheckoutStep .oz-checkout-top button{border:0;background:transparent;color:#d7eddd;font:inherit;cursor:pointer;padding:0;margin-bottom:10px;font-size:12px}',
 '#ozCheckoutStep h2{font-size:20px;margin:0 0 7px;color:white}',
 '#ozCheckoutStep .oz-checkout-top p{font-size:12px;line-height:1.45;margin:0 0 10px;color:#d4e7d8}',
 '#ozCheckoutForm{display:flex;flex-direction:column;gap:12px;padding:17px 22px 24px}',
 '#ozCheckoutForm>label:not(.oz-checkout-agree){display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:650;color:#234b37}',
 '#ozCheckoutForm input:not([type="radio"]):not([type="checkbox"]){box-sizing:border-box;width:100%;border:1px solid #bbd0bf;border-radius:10px;padding:11px 12px;font:inherit;font-size:14px;background:white;color:#183a2a}',
 '#ozCheckoutForm input:focus{outline:2px solid #91bba0;outline-offset:1px}',
 '#ozCheckoutForm fieldset{border:1px solid #d2e1d3;border-radius:11px;padding:10px 12px 12px;min-width:0}',
 '#ozCheckoutForm legend{font-size:12px;font-weight:700;color:#31523f;padding:0 5px}',
 '#ozCheckoutForm .oz-contact-choices{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;font-size:12px}',
 '#ozCheckoutForm .oz-contact-choices label{display:flex;align-items:center;gap:4px;cursor:pointer}',
 '#ozCheckoutForm .oz-contact-warning{background:#eff5e9;border-radius:10px;padding:12px;font-size:12px;line-height:1.55;color:#3c6048;margin:0}',
 '#ozCheckoutForm .oz-checkout-agree{display:flex;gap:8px;align-items:flex-start;font-size:11px;line-height:1.45;color:#587260}',
 '#ozCheckoutForm .oz-checkout-submit{background:#194a37;border:0;color:white;border-radius:11px;padding:12px;font:inherit;font-weight:700;cursor:pointer}',
 '#ozCheckoutResult{font-size:12px;line-height:1.5;color:#234b37;white-space:pre-wrap}',
 '#ozCheckoutResult a{display:inline-block;margin-top:8px;color:#165e3d;font-weight:700}'
 ].join('\n');document.head.appendChild(formStyle);
 const dialog=overlay.querySelector('#ozNewCartDialog');
 const showCheckout=()=>{
  if(!items.length)return;
  form.hidden=false;dialog.classList.add('oz-checkout-mode');
  const result=form.querySelector('#ozCheckoutResult');result.textContent='';const send=form.querySelector('.oz-checkout-submit');send.disabled=false;send.textContent='Отправить заявку';
  form.querySelector('[name="customerName"]').focus();
 };
 const hideCheckout=()=>{form.hidden=true;dialog.classList.remove('oz-checkout-mode')};
 overlay.querySelector('#ozNewCartOrder').addEventListener('click',showCheckout);
 form.querySelector('#ozCheckoutBack').addEventListener('click',hideCheckout);
 form.querySelectorAll('input[name="contactService"]').forEach(radio=>radio.addEventListener('change',()=>{
  const choice=form.querySelector('input[name="contactService"]:checked')?.value;
  const field=form.querySelector('#ozContactValue');
  field.disabled=!choice;field.value='';
  field.placeholder=choice==='ВКонтакте'?'Ссылка на страницу VK (vk.com/...)':choice==='Telegram'?'Ваш @username в Telegram':choice==='MAX'?'Ссылка или ID вашего профиля MAX':'Выберите способ связи';
 }));
 form.querySelector('#ozContactValue').addEventListener('input',e=>e.target.setCustomValidity(''));
 form.querySelector('.oz-checkout-submit').textContent='Отправить заявку';
 form.querySelector('#ozCheckoutForm').addEventListener('submit',async event=>{
  event.preventDefault();
  if(!items.length)return;
  const data=new FormData(event.currentTarget);
  const service=String(data.get('contactService')||'');
  const contact=String(data.get('contactValue')||'').trim();
  const field=form.querySelector('#ozContactValue');
  field.setCustomValidity('');
  if(service==='ВКонтакте'&&!/^(https?:\/\/)?(m\.)?(vk\.com|vk\.ru)\/[a-zA-Z0-9_.-]+\/?$/i.test(contact)){
   field.setCustomValidity('Укажите ссылку на страницу VK');field.reportValidity();return;
  }
  if(service==='Telegram'&&!/^@?[a-zA-Z0-9_]{5,32}$/.test(contact)){
   field.setCustomValidity('Укажите Telegram @username');field.reportValidity();return;
  }
  const result=form.querySelector('#ozCheckoutResult');
  const button=form.querySelector('.oz-checkout-submit');
  button.disabled=true;button.textContent='Отправляем…';result.textContent='';
  try{
   const response=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    name:String(data.get('customerName')||'').trim(),
    phone:String(data.get('customerPhone')||'').trim(),
    email:String(data.get('customerEmail')||'').trim(),
    service,contact,
    items:items.map(x=>({name:x.name,qty:x.qty,price:x.price||''}))
   })});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok||!payload.ok)throw Error(payload.error||'Не удалось отправить заявку');
   result.textContent='';
   items=[];render();
   form.querySelectorAll('input').forEach(el=>{if(el.type==='checkbox'||el.type==='radio')el.checked=false;else el.value=''});
   field.disabled=true;field.placeholder='Сначала выберите способ связи';
   button.disabled=false;button.textContent='Отправить заявку';
   close();showThanks();
  }catch(error){
   result.textContent=(error?.message||'Ошибка отправки')+'. Проверьте соединение и повторите попытку.';
   button.disabled=false;button.textContent='Отправить заявку';
  }
 });

 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open')){e.stopPropagation();close()}},true);
 document.addEventListener('click',e=>{
  // Intercept the basket itself, including clicks on its SVG and nested elements.
  if(e.target.closest('#ozV13Cart')){
   e.preventDefault();e.stopImmediatePropagation();open();return;
  }
  if(e.target.closest('#ozNewCartOverlay'))return;
  const b=e.target.closest('button,a,[role="button"],input[type="button"]');if(!b)return;
  const name=(b.textContent||'').trim().toLowerCase();
  const aria=(b.getAttribute('aria-label')||'').toLowerCase();
  const card=findProduct(b);
  const plus=/^[+＋]$/.test(name)||/в корзину|добавить в корзину/.test(name)||(/добав|увелич/.test(aria)&&!!card);
  const minus=/^[−–-]$/.test(name)&&!!card;
  if(card&&(plus||minus)){
   // Capture phase: stop the old cart's click handler before it opens the side drawer.
   e.preventDefault();e.stopImmediatePropagation();
   addFromCard(b,minus?-1:1);
   return;
  }
  const info=[b.id,b.className,b.getAttribute('aria-label'),b.getAttribute('title'),b.textContent].join(' ').toLowerCase();
  if(b.id==='ozV13Cart'||(/корзин|cart|basket/.test(info)&&b.getBoundingClientRect().width<110&&!card)){
   e.preventDefault();e.stopImmediatePropagation();open();return;
  }

 },true);
 // Legacy cart badges are not synchronized. Cart contents are held in memory only.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();render()},{once:true});else{mount();render()}
})();

// Keep the nursery's visible brand spelling consistent: "Озерский" (without ё).
(()=>{
 const correct=s=>s.replace(/Озёрск/g,'Озерск').replace(/озёрск/g,'озерск');
 const fix=()=>{
  if(document.title)document.title=correct(document.title);
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest('script,style,textarea,[contenteditable="true"]'))continue;
   if(node.nodeValue.includes('зёрск'))node.nodeValue=correct(node.nodeValue);
  }
 };
 const start=()=>{
  fix();let pending=false;
  const ob=new MutationObserver(()=>{
   if(pending)return;pending=true;
   requestAnimationFrame(()=>{pending=false;ob.disconnect();fix();ob.observe(document.body,{childList:true,subtree:true,characterData:true})});
  });
  ob.observe(document.body,{childList:true,subtree:true,characterData:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Gentle two-note sound when the visitor opens the nursery helper.
(()=>{
 let ctx=null;
 const chime=()=>{
  try{
   const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
   if(!AudioContextCtor)return;
   if(!ctx)ctx=new AudioContextCtor();
   if(ctx.state==='suspended')ctx.resume();
   const now=ctx.currentTime;
   [[660,0,.12],[880,.095,.16]].forEach(([freq,delay,duration])=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(freq,now+delay);
    gain.gain.setValueAtTime(.0001,now+delay);
    gain.gain.exponentialRampToValueAtTime(.035,now+delay+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start(now+delay);osc.stop(now+delay+duration+.01);
   });
  }catch(e){}
 };
 document.addEventListener('click',event=>{
  const toggle=event.target.closest('#ozHelperToggle');
  if(!toggle)return;
  const root=document.getElementById('ozHelper13');
  const panel=root&&root.querySelector('.oz-helper-panel');
  if(panel&&getComputedStyle(panel).display!=='none'&&getComputedStyle(panel).visibility!=='hidden'&&panel.getBoundingClientRect().width>0){
   return; // already open; this click closes it
  }
  chime();
 },true);
})();


// Replace the old Telegram mention only in the 'Contact us' quick answer.
(()=>{
 const replacement='Свяжитесь с нами через ВКонтакте или MAX — поможем с выбором растений, заказом и доставкой.';
 let active=false,internal=false;
 const apply=()=>{
  if(!active||internal)return;
  const root=document.getElementById('ozHelper13');if(!root)return;
  const reply=root.querySelector('.oz-h-reply,#ozHelperReply');if(!reply)return;
  if(reply.textContent.trim()!==replacement){internal=true;reply.textContent=replacement;internal=false}
 };
 document.addEventListener('click',e=>{
  const root=document.getElementById('ozHelper13');if(!root||!root.contains(e.target))return;
  const target=e.target.closest('button,[role="button"],a,[onclick]')||e.target;
  const name=(target.textContent||'').trim();
  if(name==='Связаться с нами'){active=true;setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,250)}
  else if(['Помощь с выбором растений','Как оформить заказ?','Доставка и самовывоз'].includes(name))active=false;
 },true);
 const start=()=>{const root=document.getElementById('ozHelper13');if(!root)return;const ob=new MutationObserver(()=>{if(active&&!internal)apply()});ob.observe(root,{childList:true,subtree:true,characterData:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// MAX contact tile: reuse the existing Telegram tile layout and official MAX image.
// No MAX account URL is configured yet; this tile is informational until provided.
(function(){
 const css=document.createElement('style');css.id='oz-max-social-tile';
 css.textContent='#ozHelper13 .oz-max-tile{background:#e9e2ff!important;color:#30205e!important;border-color:#a995e3!important;cursor:default!important}#ozHelper13 .oz-max-tile img{display:block!important;width:30px!important;height:30px!important;object-fit:contain!important;border-radius:9px!important;flex-shrink:0!important}#ozHelper13 .oz-max-tile .oz-max-title{font-size:inherit!important;font-weight:700!important;color:#30205e!important}';
 document.head.appendChild(css);
 function install(){
  const root=document.getElementById('ozHelper13');if(!root||root.querySelector('.oz-max-tile'))return;
  const anchors=Array.from(root.querySelectorAll('a[href]'));
  const tg=anchors.find(a=>/t\.me|telegram|телеграм/i.test((a.getAttribute('href')||'')+' '+(a.textContent||'')+' '+(a.getAttribute('aria-label')||'')));
  if(!tg)return;
  let card=tg;
  for(let i=0;i<3&&card.parentElement&&card.parentElement!==root;i++){
   const p=card.parentElement;
   if(p.children.length>1||p.matches('.oz-helper-panel'))break;
   card=p;
  }
  const tile=card.cloneNode(true);
  tile.classList.add('oz-max-tile');tile.removeAttribute('href');tile.removeAttribute('target');
  tile.setAttribute('aria-label','MAX — ссылка на менеджера пока не указана');tile.setAttribute('title','MAX: ссылка на менеджера пока не указана');
  tile.querySelectorAll('a').forEach(a=>{a.removeAttribute('href');a.removeAttribute('target');a.style.pointerEvents='none'});
  tile.querySelectorAll('svg,img').forEach(el=>el.remove());
  const image=document.createElement('img');image.src='https://max.ru/s/img/big-logo.png';image.alt='MAX';image.loading='lazy';
  const label=document.createElement('span');label.className='oz-max-title';label.textContent='MAX';
  tile.textContent='';tile.append(image,label);
  card.insertAdjacentElement('afterend',tile);
 }
 function start(){install();const ob=new MutationObserver(()=>{if(!document.querySelector('#ozHelper13 .oz-max-tile'))install()});ob.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Customized delivery and pickup answer for the existing four-button helper.
(()=>{
 const reply='Доставка курьером, а также через СДЭК, Boxberry и Почту России. Возможна бесплатная доставка при соблюдении условий заказа. Также доступен самовывоз. Напишите нам во ВКонтакте или MAX — уточним стоимость, сроки и условия доставки и самовывоза.';
 let active=false,updating=false;
 const update=()=>{
  if(!active||updating)return;
  const root=document.getElementById('ozHelper13');if(!root)return;
  const bubble=root.querySelector('.oz-h-reply,#ozHelperReply');
  if(!bubble)return;
  if(bubble.textContent.trim()!==reply){
   updating=true;bubble.textContent=reply;updating=false;
  }
 };
 document.addEventListener('click',e=>{
  const root=document.getElementById('ozHelper13');
  if(!root||!root.contains(e.target))return;
  const button=e.target.closest('button,[role="button"],a,[onclick]')||e.target;
  const label=(button.textContent||'').trim();
  if(label==='Доставка и самовывоз'){
    active=true;setTimeout(update,0);setTimeout(update,80);setTimeout(update,250);
  }else if(['Помощь с выбором растений','Как оформить заказ?','Связаться с нами'].includes(label)){active=false}
 },true);
 const start=()=>{
  const root=document.getElementById('ozHelper13');
  if(!root)return;
  const observer=new MutationObserver(()=>{if(active&&!updating)update()});
  observer.observe(root,{childList:true,subtree:true,characterData:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Answer bubble: direct selector, independent of the text it contains.
(()=>{
 const el=document.createElement('style');
 el.id='oz-helper-answer-sand';
 el.textContent=`
 #ozHelper13 .oz-h-reply,
 #ozHelper13 #ozHelperReply,
 #ozHelper13 .oz-h-reply.oz-answer-cream-final {
  background:#e6edcf!important;
  background-color:#e6edcf!important;
  background-image:none!important;
  border-color:#b9ca9c!important;
  color:#365343!important;
 }
 `;
 document.head.appendChild(el);
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
// Never restore the outdated embedded logo while published settings load.
const fullNurseryLogo=null;
const logoWaitingStyle=document.createElement('style');
logoWaitingStyle.id='oz-logo-no-flash';
logoWaitingStyle.textContent='#ozFreeLogo{visibility:hidden!important}';
document.head.appendChild(logoWaitingStyle);
if(window.OZ_LOGO_SETTINGS_READY)logoWaitingStyle.remove();

let records={},logoAsset=null,mobileLogoAsset=null;
const isAction=e=>!!e?.matches('#ozDottedActions .oz-v13-btn,#ozHelperToggle');
const isLogo=e=>!!e?.closest('#ozFreeLogo,.brand,.brand-symbol,#brandIcon');
const setActionSize=(e,n)=>{const px=Math.max(36,Math.min(240,Number(n)||66));e.style.setProperty('width',px+'px','important');e.style.setProperty('height',px+'px','important');e.style.setProperty('--oz-editor-icon-size',Math.round(px*.44)+'px');};
const setPos=(e,x,y)=>{e.dataset.seX=x;e.dataset.seY=y;e.style.setProperty('translate',x+'px '+y+'px','important')};
const applyOne=(key,d)=>{try{let e=document.querySelector(key);if(!e)return;setPos(e,d.x||0,d.y||0);if(d.size){if(isAction(e))setActionSize(e,d.size);else if(isLogo(e))e.style.setProperty('width',d.size+'px','important');else e.style.setProperty('font-size',d.size+'px','important')}if(d.text!==null&&d.text!==undefined&&!e.children.length)e.textContent=d.text}catch{}};
const applyLogo=()=>{window.OZ_PUBLIC_LOGO_OVERRIDE=logoAsset;const e=document.querySelector('#ozFreeLogo'),im=e?.querySelector('img');if(!e||!im)return;
 if(logoAsset==='hidden'){e.style.setProperty('display','none','important');return;}
 e.style.removeProperty('display');
 const src=window.OZ_EDITOR_LOGO||window.OZ_PUBLISHED_LOGO?.src||logoAsset;
 if(src&&im.getAttribute('src')!==src)im.src=src;
 // Preserve the image until the independently published logo is loaded.
 window.ozApplyLogoLayout?.();
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
  mobileLogoAsset=window.OZ_EDITOR_LOGO||data.mobileLogo||null;
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