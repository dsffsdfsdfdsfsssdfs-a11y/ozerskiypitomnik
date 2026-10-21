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
 const nav=[...document.querySelectorAll('#ozCombinedHeader #mainNav a')].filter(e=>e.offsetParent!==null).slice(0,6);
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
  if(!el.dataset.ozHeadMove){
   el.dataset.ozHeadMove='1';
   el.addEventListener('pointerdown',e=>{
    if(!active||e.button!==0)return;
    e.preventDefault();e.stopPropagation();
    const start={...(items[id]||{x:0,y:0,size:defs[id]})},x=e.clientX,y=e.clientY;
    el.setPointerCapture(e.pointerId);
    const move=v=>{items[id]={...start,x:Math.max(-500,Math.min(500,start.x+Math.round(v.clientX-x))),y:Math.max(-200,Math.min(200,start.y+Math.round(v.clientY-y)))};apply()};
    const finish=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',finish)};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
   },true);
  }
 }
}
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
  panel.querySelector('#ozHeaderPublish').onclick=async()=>{
   const pass=sessionStorage.getItem('ozLogoEditorPass')||prompt('Пароль публикации:');if(!pass)return;
   try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-editor-password':pass},body:JSON.stringify({items})});const result=await r.json();if(!r.ok)throw Error(result.error||'Ошибка');
   sessionStorage.setItem('ozLogoEditorPass',pass);status('Настройки опубликованы для всех браузеров')}
   catch(e){status('Ошибка публикации: '+e.message)}
  };
 }
 const obs=new MutationObserver(()=>{active=!main.hidden;apply()});obs.observe(main,{attributes:true,attributeFilter:['hidden']});active=!main.hidden;apply();
 return true;
}
const init=async()=>{
 try{const r=await fetch(endpoint+'?t='+Date.now(),{cache:'no-store'});if(r.ok){const data=await r.json();items=data.items||{}}}catch(e){console.warn(e)}
 apply();window.OZ_APPLY_HEADER_LAYOUT=apply;window.OZ_HEADER_SETTINGS_READY=true;window.dispatchEvent(new Event('oz-header-settings-ready'));let tries=0;const timer=setInterval(()=>{apply();if(setup()||++tries>35)clearInterval(timer)},400);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();