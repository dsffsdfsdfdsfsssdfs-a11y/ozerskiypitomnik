(()=>{'use strict';
const KEY='oz-editor-custom-logo-preview-v1';
const endpoint='/api/logo-settings';
const defaultState={src:null,x:0,y:0,width:150,mobileWidth:125};
let state={...defaultState},editing=false,origin=null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const css=document.createElement('style');css.textContent=
'#ozFreeLogo.oz-logo-editing{outline:2px dashed #4b996a!important;cursor:grab!important;touch-action:none!important;z-index:1000!important}'+
'#ozLogoResizeHandle{display:none;position:absolute;right:-10px;bottom:-10px;width:22px;height:22px;border:2px solid #fff;border-radius:6px;background:#297549;box-shadow:0 1px 8px #3338;cursor:nwse-resize!important;z-index:1001}'+
'#ozFreeLogo.oz-logo-editing #ozLogoResizeHandle{display:block}'+
'#ozEditorLogoArea{padding:14px;margin:14px 0;border:1px solid #c7ddc6;border-radius:12px;background:#fff}'+
'#ozEditorLogoArea input[type=range]{display:block;width:100%;margin:8px 0}'+
'#ozEditorLogoArea button{margin:7px 5px 5px 0;padding:8px 12px}';
document.head.appendChild(css);
function visual(){
 const el=document.getElementById('ozFreeLogo'),img=el?.querySelector('img');
 if(img&&state.src&&img.src!==state.src)img.src=state.src;
 if(el){
  el.style.setProperty('width',state.width+'px','important');
  el.style.setProperty('max-width','none','important');
  el.style.setProperty('translate',state.x+'px '+state.y+'px','important');
  if(img){img.style.setProperty('width','100%','important');img.style.setProperty('height','auto','important');}
 }
 if(innerWidth<=900){
  let mobile=document.getElementById('ozCustomMobileLogo');
  if(!mobile&&state.src){
    const host=document.querySelector('#ozCombinedHeader .header .header-in');
    if(host){mobile=document.createElement('img');mobile.id='ozCustomMobileLogo';mobile.alt='Логотип питомника';host.appendChild(mobile);}
  }
  if(mobile){
   if(state.src)mobile.src=state.src;
   mobile.style.setProperty('width',state.mobileWidth+'px','important');
   mobile.style.setProperty('height','auto','important');
   mobile.style.setProperty('max-width','none','important');
   mobile.style.setProperty('display','block','important');
   mobile.style.setProperty('visibility','visible','important');
   mobile.style.setProperty('position','absolute','important');
   mobile.style.setProperty('left','50%','important');mobile.style.setProperty('top','50%','important');
   mobile.style.setProperty('transform','translate(-50%,-50%)','important');
   mobile.style.setProperty('translate',state.x+'px '+state.y+'px','important');
  }
 }
}
window.ozApplyLogoLayout=visual;
const status=t=>{const e=document.getElementById('ozEditorLogoStatus');if(e)e.textContent=t;};
function sync(){
 const p=document.getElementById('ozEditorLogoArea');if(!p)return;
 p.querySelector('#ozEditorLogoPreview').src=state.src||'/ozerskiy-header-logo.png';
 p.querySelector('#ozLogoSize').value=state.width;
 p.querySelector('#ozLogoMobileSize').value=state.mobileWidth;
 p.querySelector('#ozLogoSizeValue').textContent=state.width+' px';
 p.querySelector('#ozLogoMobileSizeValue').textContent=state.mobileWidth+' px';
}
function update(){window.OZ_EDITOR_LOGO=state.src;window.OZ_PUBLISHED_LOGO=state;visual();sync();window.OZ_LOGO_SETTINGS_READY=true;document.getElementById('oz-logo-no-flash')?.remove();}
function pointer(e){
 if(!editing||e.button!==0)return;
 const el=document.getElementById('ozFreeLogo'),target=e.target;
 if(!el||!el.contains(target))return;
 e.preventDefault();e.stopPropagation();
 const resize=target.id==='ozLogoResizeHandle',x=e.clientX,y=e.clientY,start={...state};
 el.setPointerCapture(e.pointerId);
 const move=ev=>{
  if(resize)state.width=clamp(Math.round(start.width+ev.clientX-x),45,600);
  else {state.x=clamp(Math.round(start.x+ev.clientX-x),-800,800);state.y=clamp(Math.round(start.y+ev.clientY-y),-800,800);}
  visual();sync();
 };
 const finish=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',finish);status('Изменения готовы. Нажми «Опубликовать», чтобы их увидели все.')};
 el.addEventListener('pointermove',move);el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
}
async function fileToData(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Выбери PNG, JPG или WebP');
 const bmp=await createImageBitmap(file),scale=Math.min(1,850/Math.max(bmp.width,bmp.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bmp.width*scale));canvas.height=Math.max(1,Math.round(bmp.height*scale));
 canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);bmp.close();
 let data=canvas.toDataURL('image/webp',.85);
 if(data.length>1900000)throw Error('Слишком большой файл, выбери изображение меньшего размера');
 return data;
}
function setup(){
 const panel=document.getElementById('oz50EditPanel'),el=document.getElementById('ozFreeLogo');
 if(!panel||!el)return false;
 let area=document.getElementById('ozEditorLogoArea');
 if(!area){
  area=document.createElement('section');area.id='ozEditorLogoArea';
  area.innerHTML='<strong style="display:block;font-size:20px;margin-bottom:8px">Логотип сайта</strong>'+
   '<label>Загрузить логотип (PNG / JPG / WebP)<input id="ozEditorLogoFile" type="file" accept="image/png,image/jpeg,image/webp" style="display:block;width:100%;margin:8px 0"></label>'+
   '<img id="ozEditorLogoPreview" alt="Логотип" style="display:block;width:110px;height:110px;object-fit:contain;margin:8px auto">'+
   '<label>Размер на компьютере: <output id="ozLogoSizeValue"></output><input id="ozLogoSize" type="range" min="45" max="600"></label>'+
   '<label>Размер на телефоне: <output id="ozLogoMobileSizeValue"></output><input id="ozLogoMobileSize" type="range" min="40" max="300"></label>'+
   '<div style="font-size:13px;margin:8px 0">Открой редактор, зажми логотип и перетаскивай. Тяни зелёный квадратик в углу, чтобы изменить размер.</div>'+
   '<button type="button" id="ozLogoPublish">Опубликовать для всех</button><button type="button" id="ozLogoRestore">Вернуть старый логотип</button>'+
   '<p id="ozEditorLogoStatus" style="font-size:12px;margin-top:8px">Изменения появятся у всех только после публикации.</p>';
  panel.insertBefore(area,panel.firstChild.nextSibling);
  area.querySelector('#ozEditorLogoFile').onchange=async e=>{try{const file=e.target.files?.[0];if(!file)return;state.src=await fileToData(file);update();status('Логотип загружен. Расположи его и нажми «Опубликовать».')}catch(err){status(err.message)}};
  area.querySelector('#ozLogoSize').oninput=e=>{state.width=+e.target.value;update()};
  area.querySelector('#ozLogoMobileSize').oninput=e=>{state.mobileWidth=+e.target.value;update()};
  area.querySelector('#ozLogoRestore').onclick=()=>{state.src=null;const img=document.querySelector('#ozFreeLogo img');if(img)img.src='/ozerskiy-header-logo.png';update();status('Нажми «Опубликовать», чтобы вернуть прежний логотип для всех.')};
  area.querySelector('#ozLogoPublish').onclick=async()=>{
   let password=sessionStorage.getItem('ozLogoEditorPass')||'';
   if(!password)password=prompt('Пароль публикации логотипа:')||'';
   if(!password)return;
   const btn=area.querySelector('#ozLogoPublish');btn.disabled=true;status('Публикуем...');
   try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-editor-password':password},body:JSON.stringify(state)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'Ошибка сервера');
    sessionStorage.setItem('ozLogoEditorPass',password);
    status('Опубликовано! Логотип и его расположение видны всем посетителям, в том числе в другом браузере.');
   }catch(err){sessionStorage.removeItem('ozLogoEditorPass');status('Не удалось опубликовать: '+err.message)}
   finally{btn.disabled=false}
  };
 }
 let handle=document.getElementById('ozLogoResizeHandle');
 if(!handle){handle=document.createElement('span');handle.id='ozLogoResizeHandle';el.appendChild(handle);}
 if(!el.dataset.ozLogoDragBound){el.addEventListener('pointerdown',pointer,true);el.dataset.ozLogoDragBound='1';}
 const observe=new MutationObserver(()=>{const on=!panel.hidden;editing=on;el.classList.toggle('oz-logo-editing',on);});
 observe.observe(panel,{attributes:true,attributeFilter:['hidden']});
 editing=!panel.hidden;el.classList.toggle('oz-logo-editing',editing);
 sync();visual();return true;
}
async function load(){
 try{const r=await fetch(endpoint+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('server');const v=await r.json();
 state={...defaultState,...v};
 // Prefer unsaved changes made in the current tab, if any.
 window.OZ_PUBLISHED_LOGO=state;visual();sync();window.OZ_LOGO_SETTINGS_READY=true;document.getElementById('oz-logo-no-flash')?.remove();
 }catch(e){console.warn('Published logo settings unavailable',e);window.OZ_LOGO_SETTINGS_READY=true;document.getElementById('oz-logo-no-flash')?.remove();}
}
const boot=()=>{load();if(setup())return;let i=0;const t=setInterval(()=>{if(setup()||++i>60)clearInterval(t)},400)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();