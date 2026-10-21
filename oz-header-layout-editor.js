(()=>{'use strict';
const endpoint='/api/header-layout';
const defs={phone:62,helper:62,cart:62,menu:62,nav0:21,nav1:21,nav2:21,nav3:21,nav4:21,nav5:21};
let items={},active=false,targets={};
const css=document.createElement('style');css.id='oz-header-layout-editor-css';
css.textContent=`
@media(min-width:901px){
 #ozCombinedHeader .header .header-in{height:84px!important;min-height:84px!important;border-radius:42px!important;box-sizing:border-box!important;clip-path:none!important;mask:none!important;overflow:visible!important}
 #ozCombinedHeader .header{border-radius:42px!important;overflow:visible!important}
 #ozCombinedHeader .header .header-in::before,#ozCombinedHeader .header .header-in::after{border-radius:inherit!important}
}
.oz-header-draggable{touch-action:none!important;user-select:none!important}
.oz-header-draggable.oz-edit-active{outline:2px dashed #70aa85!important;outline-offset:3px!important;cursor:move!important}
#ozHeaderEditorPanel{border:1px solid #c9e0cd;border-radius:12px;padding:12px;margin:12px 0;background:#fff}
#ozHeaderEditorPanel label{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:8px 0}
#ozHeaderEditorPanel input[type=range]{width:125px}
#ozHeaderEditorPanel button{margin:5px!important}
`;
document.head.appendChild(css);
const map=()=>{
 const nav=[...document.querySelectorAll('#mainNav a')].slice(0,6);
 return {phone:document.querySelector('#ozCombinedHeader .header a[href^="tel:"]')||document.querySelector('#ozDottedActions [href^="tel:"]'),helper:document.getElementById('ozHelperToggle'),cart:document.getElementById('ozV13Cart'),menu:document.querySelector('#ozDottedActions .oz-v13-btn')||document.querySelector('#ozDottedActions button'),...Object.fromEntries(nav.map((e,i)=>['nav'+i,e]))};
};
function apply(){
 targets=map();
 for(const [id,el] of Object.entries(targets)){
  if(!el)continue;
  const o=items[id]||{x:0,y:0,size:defs[id]};
  el.style.setProperty('translate',o.x+'px '+o.y+'px','important');
  if(id.startsWith('nav')){
   el.style.setProperty('font-size',o.size+'px','important');
   el.querySelectorAll('span').forEach(t=>t.style.setProperty('font-size',o.size+'px','important'));
  }else{
   el.style.setProperty('width',o.size+'px','important');
   el.style.setProperty('height',o.size+'px','important');
   el.style.setProperty('min-width',o.size+'px','important');
   el.style.setProperty('min-height',o.size+'px','important');
  }
  el.classList.add('oz-header-draggable');el.classList.toggle('oz-edit-active',active);

 }
}

// Overlay handles for ALL navigation links during editing. They sit above page overlays.
const handles=new Map();
let dragged=null;
function syncHandles(){
 const panel=document.getElementById('oz50EditPanel');
 const editing=!!(panel&&!panel.hidden&&panel.getClientRects().length);
 const links=[...document.querySelectorAll('#mainNav a')].slice(0,6);
 for(let i=0;i<6;i++){
  let handle=handles.get(i);
  if(!handle){
   handle=document.createElement('div');
   handle.className='ozNavDragHandle';
   Object.assign(handle.style,{position:'fixed',zIndex:'2147483640',display:'none',touchAction:'none',cursor:'grab',background:'transparent',boxSizing:'border-box'});
   document.body.appendChild(handle);
   handles.set(i,handle);
   handle.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const link=[...document.querySelectorAll('#mainNav a')][i];if(!link)return;
    e.preventDefault();e.stopImmediatePropagation();
    const id='nav'+i,old=items[id]||{};
    const start={x:Number(old.x)||0,y:Number(old.y)||0,size:Number(old.size)||defs[id]};
    const sx=e.clientX,sy=e.clientY;
    dragged=i;
    handle.setPointerCapture(e.pointerId);
    const move=v=>{
     v.preventDefault();
     items[id]={...start,x:Math.max(-500,Math.min(500,start.x+Math.round(v.clientX-sx))),y:Math.max(-200,Math.min(200,start.y+Math.round(v.clientY-sy)))};
     link.style.setProperty('translate',items[id].x+'px '+items[id].y+'px','important');
     const box=link.getBoundingClientRect();
     handle.style.left=box.left+'px';handle.style.top=box.top+'px';
    };
    const done=()=>{
     handle.removeEventListener('pointermove',move);
     handle.removeEventListener('pointerup',done);
     handle.removeEventListener('pointercancel',done);
     dragged=null;apply();syncHandles();
    };
    handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',done);
    handle.addEventListener('pointercancel',done);
   });
  }
  const link=links[i];
  if(!editing||!link||!link.getClientRects().length){if(dragged!==i)handle.style.display='none';continue}
  if(dragged===i)continue;
  const box=link.getBoundingClientRect();
  Object.assign(handle.style,{display:'block',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});
 }
}
setInterval(syncHandles,180);
function setup(){
 const main=document.getElementById('oz50EditPanel');if(!main)return false;
 let panel=document.getElementById('ozHeaderEditorPanel');
 if(!panel){
  panel=document.createElement('div');panel.id='ozHeaderEditorPanel';
  panel.innerHTML='<strong style="font-size:20px">Элементы шапки</strong><p style="font-size:13px">Открой редактор, зажми и перемещай элементы шапки. Размер регулируется ниже.</p><div id="ozHeaderSliders"></div><button type="button" id="ozHeaderPublish">Опубликовать шапку для всех</button><button type="button" id="ozHeaderReset">Сбросить расположение</button><p id="ozHeaderStatus" style="font-size:12px"></p>';
  main.appendChild(panel);
  const labels={phone:'Звонок',helper:'Помощник',cart:'Корзина',menu:'Меню',nav0:'Надпись 1',nav1:'Надпись 2',nav2:'Надпись 3',nav3:'Надпись 4',nav4:'Контакты',nav5:'Отзывы'};
  const sliders=panel.querySelector('#ozHeaderSliders');
  for(const [id,label] of Object.entries(labels)){
   const row=document.createElement('label');row.textContent=label+' ';
   const range=document.createElement('input');range.type='range';range.min=id.startsWith('nav')?'12':'36';range.max=id.startsWith('nav')?'45':'120';range.value=items[id]?.size||defs[id];
   const output=document.createElement('output');output.textContent=range.value+'px';
   range.oninput=()=>{items[id]={...(items[id]||{x:0,y:0}),size:+range.value};output.textContent=range.value+'px';apply()};
   row.append(range,output);sliders.appendChild(row);
  }
  const status=t=>panel.querySelector('#ozHeaderStatus').textContent=t;
  panel.querySelector('#ozHeaderReset').onclick=()=>{items={};apply();for(const input of sliders.querySelectorAll('input'))input.value=defs[Object.keys(labels)[[...sliders.querySelectorAll('input')].indexOf(input)]];status('Расположение сброшено локально. Нажми публикацию.')};
  const publishHeader=async()=>{
   const button=panel.querySelector('#ozHeaderPublish');
   const snapshot={};
   for(const [key,value] of Object.entries(items)){
    if(!value)continue;
    snapshot[key]={x:Number(value.x)||0,y:Number(value.y)||0,size:Number(value.size)||defs[key]};
   }
   let pass=sessionStorage.getItem('ozLogoEditorPass')||'';
   if(!pass)pass=prompt('Пароль для публикации настроек шапки:')||'';
   if(!pass){status('Публикация отменена: не указан пароль');return}
   button.disabled=true;status('Сохраняю настройки на сервере…');
   try{
    let response=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-editor-password':pass},body:JSON.stringify({items:snapshot})});
    if(response.status===401){
     sessionStorage.removeItem('ozLogoEditorPass');
     pass=prompt('Сервер отклонил пароль. Введи пароль редактора заново:')||'';
     if(!pass)throw Error('Сервер отклонил пароль');
     response=await fetch(endpoint,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','x-editor-password':pass},body:JSON.stringify({items:snapshot})});
    }
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.ok)throw Error(result.error||'HTTP '+response.status);
    const accepted=result.items||{};
    for(const [key,value] of Object.entries(snapshot)){
     const saved=accepted[key];
     if(!saved||saved.x!==value.x||saved.y!==value.y||saved.size!==value.size)
      throw Error('Сервер не подтвердил '+key);
    }
    sessionStorage.setItem('ozLogoEditorPass',pass);
    status('✓ Сохранено на сервере. Обнови страницу, чтобы проверить.');
   }catch(error){status('❌ НЕ СОХРАНЕНО: '+error.message);alert('Не удалось опубликовать шапку: '+error.message)}
   finally{button.disabled=false}
  };
  panel.querySelector('#ozHeaderPublish').onclick=publishHeader;
  const mainSave=main.querySelector('[data-save]');
  if(mainSave&&!mainSave.dataset.ozHeaderSaveAttached){
   mainSave.dataset.ozHeaderSaveAttached='1';
   mainSave.addEventListener('click',()=>{if(Object.keys(items).some(k=>k.startsWith('nav')))publishHeader()},true);
  }
 }
 const obs=new MutationObserver(()=>{active=main.getClientRects().length>0;apply()});obs.observe(main,{attributes:true,attributeFilter:['hidden']});active=!main.hidden;apply();
 return true;
}
const init=async()=>{
 try{const r=await fetch(endpoint+'?t='+Date.now(),{cache:'no-store'});if(r.ok){const data=await r.json();items=data.items||{}}}catch(e){console.warn(e)}
 apply();window.OZ_APPLY_HEADER_LAYOUT=apply;window.OZ_HEADER_SETTINGS_READY=true;window.dispatchEvent(new Event('oz-header-settings-ready'));let tries=0;const timer=setInterval(()=>{apply();if(setup()||++tries>35)clearInterval(timer)},400);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();