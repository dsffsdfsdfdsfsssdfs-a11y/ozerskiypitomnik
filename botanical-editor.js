(()=>{'use strict';


// Independent central cart v2. Does not reuse, move, or modify the old drawer.
(()=>{
 const key='oz-new-cart-v2';
 let items=[];try{const old=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(old))items=old.filter(x=>x&&x.name&&Number(x.qty)>0)}catch{}

 // The new cart is authoritative; stale old-cart items must not be imported.
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(items))}catch{}};
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
 '#ozNewCartEmpty{text-align:center;padding:48px 12px 28px;color:#688073;font-size:14px}',
 '#ozNewCartCatalog{display:block;background:#e3efe3;color:#1b5038;border:1px solid #a8c6ab;border-radius:10px;margin:15px auto 0;padding:11px 16px;font:inherit;font-weight:700;cursor:pointer}',
 'body.oz-new-cart-active [class*="cart-drawer" i],body.oz-new-cart-active [id*="cart-drawer" i]{display:none!important}'
 ].join('\n');document.head.appendChild(style);
 const overlay=document.createElement('div');overlay.id='ozNewCartOverlay';
 overlay.innerHTML='<section id="ozNewCartDialog" role="dialog" aria-modal="true" aria-label="Ваша корзина"><header id="ozNewCartHead"><strong>Ваша корзина <span id="ozNewCartCount"></span></strong><button id="ozNewCartClose" aria-label="Закрыть">×</button></header><div id="ozNewCartItems"></div><footer id="ozNewCartFoot"><p>Добавленные товары не резервируются автоматически. Отправьте заявку питомнику для уточнения наличия и стоимости.</p><button id="ozNewCartOrder">Оформить заказ</button></footer></section>';
 const mount=()=>{if(!overlay.isConnected)document.body.append(overlay)};
 let previousFocus=null;
 const updateCount=()=>{
  const n=items.reduce((sum,x)=>sum+x.qty,0);
  const count=overlay.querySelector('#ozNewCartCount');if(count)count.textContent='('+n+')';
  const trigger=document.getElementById('ozV13Cart');if(!trigger)return;
  let badge=trigger.querySelector('.oz-new-count-badge');
  if(!badge){badge=document.createElement('span');badge.className='oz-new-count-badge';trigger.appendChild(badge)}
  badge.textContent=String(n);badge.style.display=n?'block':'none';
  [...trigger.querySelectorAll('span,b,strong')].forEach(el=>{
   if(el===badge||el.closest('.oz-new-count-badge'))return;
   if(el.children.length===0&&/^\\d+$/.test(el.textContent.trim()))el.classList.add('oz-old-number-hidden');
  });
 };
 const render=()=>{
  const list=overlay.querySelector('#ozNewCartItems');
  list.innerHTML=items.length?items.map((x,i)=>'<div class="oz-new-line">'+(x.img?'<img src="'+esc(x.img)+'" alt="'+esc(x.name)+'">':'')+'<div class="oz-new-info"><strong>'+esc(x.name)+'</strong><small>'+(x.price?'Цена: '+esc(x.price):'Цена уточняется')+'</small><div class="oz-new-actions"><button data-cart-i="'+i+'" data-action="minus" aria-label="Уменьшить количество">−</button><b>'+x.qty+'</b><button data-cart-i="'+i+'" data-action="plus" aria-label="Увеличить количество">+</button><button class="oz-remove" data-cart-i="'+i+'" data-action="remove" aria-label="Удалить товар">×</button></div></div></div>').join(''):'<div id="ozNewCartEmpty">Корзина пока пуста. Выберите растения в каталоге.<button type="button" id="ozNewCartCatalog">Перейти в каталог</button></div>';
  overlay.querySelector('#ozNewCartOrder').disabled=!items.length;updateCount();save();
 };
 const open=()=>{mount();previousFocus=document.activeElement;render();overlay.classList.add('open');document.body.classList.add('oz-new-cart-active');overlay.querySelector('#ozNewCartClose').focus()};
 const close=()=>{overlay.classList.remove('open');document.body.classList.remove('oz-new-cart-active');if(previousFocus?.focus)previousFocus.focus()};
 const findProduct=(button)=>{
  let el=button;
  for(let i=0;i<9&&el&&el!==document.body;i++,el=el.parentElement){
   if(el.closest('#ozNewCartOverlay'))return null;
   const image=el.querySelector('img');
   const title=el.querySelector('h2,h3,h4,[class*="product-name"],[class*="product-title"],[class*="plant-name"]');
   if(!image||!title)continue;
   const name=(title.textContent||'').trim();
   if(name.length<3||name.length>130||el.querySelectorAll('h2,h3,h4').length>4)continue;
   const rect=el.getBoundingClientRect();
   if(rect.width>750||rect.height>950)continue;
   return el;
  }
  return null;
 };
 const addFromCard=(button,delta=1)=>{
  const card=findProduct(button);if(!card)return false;
  const title=card.querySelector('h2,h3,h4,[class*="product-name"],[class*="product-title"],[class*="plant-name"]');
  const name=(title?.textContent||'').trim();if(!name)return false;
  const img=card.querySelector('img')?.currentSrc||card.querySelector('img')?.src||'';
  const price=(card.querySelector('[class*="price"]')?.textContent||'').trim().slice(0,60);
  const id=card.getAttribute('data-product-id')||card.getAttribute('data-id')||name;
  const item=items.find(x=>x.id===id);
  if(item){item.qty+=delta;if(!item.img&&img)item.img=img}
  else if(delta>0)items.push({id,name,img,price,qty:delta});
  items=items.filter(x=>x.qty>0);render();return true;
 };
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
 overlay.querySelector('#ozNewCartOrder').addEventListener('click',()=>{
  if(!items.length)return;
  const lines=items.map(x=>x.name+' — '+x.qty+' шт.'+(x.price?' ('+x.price+')':'')).join('\n');
  const message='Здравствуйте! Хочу оформить заказ в Озерском питомнике:\n'+lines+'\nПодскажите наличие, стоимость и условия доставки.';
  navigator.clipboard?.writeText(message).catch(()=>{});
  const contact=[...document.querySelectorAll('a[href]')].find(a=>/vk\.com/.test(a.href)&&!a.closest('#ozNewCartOverlay'));
  if(contact)window.open(contact.href,'_blank','noopener');
  else alert('Заявка подготовлена. Скопируйте список товаров и свяжитесь с питомником:\n\n'+message);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open')){e.stopPropagation();close()}},true);
 document.addEventListener('click',e=>{
  if(e.target.closest('#ozNewCartOverlay'))return;
  const b=e.target.closest('button,a,[role="button"]');if(!b)return;
  const info=[b.id,b.className,b.getAttribute('aria-label'),b.getAttribute('title'),b.textContent].join(' ').toLowerCase();
  if(b.id==='ozV13Cart'||(/корзин|cart|basket/.test(info)&&b.getBoundingClientRect().width<110&&!b.closest('.product-card,.catalog-card'))){
   e.preventDefault();e.stopImmediatePropagation();open();return;
  }
  const txt=(b.textContent||'').trim().toLowerCase();
  const aria=(b.getAttribute('aria-label')||'').toLowerCase();
  const card=findProduct(b);
  if(card){
   if(/в корзину|добавить в корзину|купить/.test(txt)){addFromCard(b,1);return}
   const isPlus=/^[+＋]$/.test(txt)||/увелич|добавить/i.test(aria)||b.matches('[data-action="plus"],[data-qty="plus"],[class*="qty-plus"],[class*="quantity-plus"]');
   const isMinus=/^[−–-]$/.test(txt)||/уменьш/i.test(aria)||b.matches('[data-action="minus"],[class*="qty-minus"],[class*="quantity-minus"]');
   if(isPlus){addFromCard(b,1);return}
   if(isMinus){addFromCard(b,-1);return}
  }
 },true);
 const syncBadge=()=>{const t=document.getElementById('ozV13Cart');if(t&&(!t.querySelector('.oz-new-count-badge')||[...t.querySelectorAll('span,b,strong')].some(e=>e.classList.contains('oz-old-number-hidden')===false&&e.classList.contains('oz-new-count-badge')===false&&/^\\d+$/.test(e.textContent.trim())&&e.children.length===0)))updateCount()};
 setInterval(syncBadge,1200);
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