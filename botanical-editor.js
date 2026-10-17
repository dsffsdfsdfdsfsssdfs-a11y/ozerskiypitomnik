(()=>{'use strict';

// Compact chat layout: keep composer visible, scroll only the answer history.
(function(){
const style=document.createElement('style');style.id='oz-compact-chat-fixed';
style.textContent=String.raw`
#ozHelper13 .oz-helper-panel{height:min(422px,calc(100dvh - 32px))!important;max-height:min(422px,calc(100dvh - 32px))!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important}
#ozHelper13 .oz-layout-chat-stage{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
#ozHelper13 .oz-layout-chat-feed{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overscroll-behavior:contain!important;scrollbar-width:thin!important}
#ozHelper13 .oz-q-box{order:99!important;flex:0 0 auto!important;margin:0!important;padding:9px!important;border-radius:0 0 14px 14px!important;border-left:0!important;border-right:0!important;border-bottom:0!important;box-shadow:0 -3px 12px #153d2220!important;background:#f1f5e9!important}
#ozHelper13 .oz-q-box .oz-q-label{display:none!important}
#ozHelper13 .oz-q-box .oz-q-row{display:flex!important;align-items:center!important}
#ozHelper13 .oz-q-box .oz-q-log{display:none!important}
#ozHelper13 .oz-layout-chat-feed .oz-q-log{display:flex!important;max-height:none!important;overflow:visible!important;margin:6px 0!important;gap:6px!important}
#ozHelper13 .oz-layout30-contacts{flex:0 0 auto!important;margin:4px auto 7px!important;gap:12px!important}
#ozHelper13 .oz-layout30-brand{width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;flex-basis:36px!important}
#ozHelper13 .oz-layout30-brand svg{width:20px!important;height:20px!important}
#ozHelper13 .oz-q-input{height:38px!important}
`;
document.head.appendChild(style);
function layout(){
const root=document.getElementById('ozHelper13');if(!root)return;
const panel=root.querySelector('.oz-helper-panel'),composer=root.querySelector('.oz-q-box');
if(!panel||!composer)return;
let stage=panel.querySelector('.oz-layout-chat-stage');
if(!stage){
 stage=document.createElement('div');stage.className='oz-layout-chat-stage';
 const feed=document.createElement('div');feed.className='oz-layout-chat-feed';
 const children=[...panel.children].filter(el=>el!==composer);
 children.forEach(el=>feed.appendChild(el));
 stage.appendChild(feed);panel.insertBefore(stage,composer);
}
const feed=stage.querySelector('.oz-layout-chat-feed'),log=composer.querySelector('.oz-q-log');
if(log&&log.parentElement!==feed)feed.appendChild(log);
if(composer.parentElement!==panel)panel.appendChild(composer);
}
function start(){layout();let busy=false;const ob=new MutationObserver(()=>{if(busy)return;busy=true;ob.disconnect();layout();ob.observe(document.body,{subtree:true,childList:true});busy=false});ob.observe(document.body,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Layout #30: compact assistant with circular VK/TG and curved reply button.
(function(){
const style=document.createElement('style');style.id='oz-layout-30-style';
style.textContent=String.raw`
#ozHelper13 .oz-helper-panel{width:322px!important;max-width:calc(100vw - 20px)!important;box-sizing:border-box!important;max-height:min(422px,calc(100dvh - 40px))!important;overflow-y:auto!important}
#ozHelper13 .oz-q-box{margin:8px 0 0!important;padding:8px!important;border-radius:12px!important;background:#f1f5e9!important}
#ozHelper13 .oz-q-label{font-size:11px!important;margin-bottom:5px!important}
#ozHelper13 .oz-q-row{align-items:center!important}
#ozHelper13 .oz-q-input{min-height:36px!important;padding:7px 10px!important}
#ozHelper13 .oz-q-button{height:36px!important;width:36px!important;min-width:36px!important;padding:7px!important;display:grid!important;place-items:center!important;border-radius:50%!important}
#ozHelper13 .oz-q-button svg{width:20px!important;height:20px!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#ozHelper13 .oz-q-log{max-height:126px!important;overflow-y:auto!important;margin-top:6px!important}
#ozHelper13 .oz-layout30-contacts{display:flex!important;gap:12px!important;justify-content:center!important;align-items:center!important;margin:9px auto 2px!important}
#ozHelper13 .oz-layout30-brand{display:grid!important;place-items:center!important;flex:0 0 42px!important;width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;max-width:42px!important;max-height:42px!important;aspect-ratio:1/1!important;border-radius:50%!important;overflow:hidden!important;box-shadow:0 2px 6px #193a2222!important}
#ozHelper13 .oz-layout30-brand.vk{background:#0077ff!important}
#ozHelper13 .oz-layout30-brand.tg{background:#28a8e9!important}
#ozHelper13 .oz-layout30-brand svg{display:block!important;width:23px!important;height:23px!important;flex:none!important;fill:#fff!important}
#ozHelper13 .oz-layout30-hidden{display:none!important}
`;
document.head.appendChild(style);
const vk='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.8 17.5h-1.3c-4.2 0-6.6-2.9-7.6-8.6-.1-.5.1-.8.6-.8h2.1c.4 0 .6.2.7.6.8 2.4 1.6 3.9 2.4 4.1.3.1.4-.1.4-.6V9.4c-.1-.7-.4-.9-.7-1-.2 0-.2-.2 0-.4.3-.3.8-.4 1.5-.4h1.7c.5 0 .7.3.7.9v3.8c0 .4.2.5.4.4.8-.4 1.6-1.9 2.2-4.1.1-.3.4-.5.8-.5h2.1c.6 0 .7.3.5.8-.5 1.7-2.1 3.8-2.1 3.8-.2.3-.2.5 0 .8.2.2 1 .9 1.5 1.5.6.7 1.1 1.3 1.2 1.8.1.5-.2.7-.7.7h-2.3c-.4 0-.6-.2-.9-.6-.5-.7-1-1.4-1.5-1.5-.3 0-.4.2-.4.5v1c0 .4-.2.6-.6.6z"/></svg>';
const tg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.8 4.2 18.5 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.2L18.2 6c.4-.4-.1-.6-.6-.3L5.9 13.1.9 11.5c-1.1-.4-1.1-1.1.2-1.6L20.4 2.5c.9-.3 1.7.2 1.4 1.7z"/></svg>';
const reply='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h9a7 7 0 0 1 7 7"/></svg>';
function install(){
const root=document.getElementById('ozHelper13');if(!root)return;
const box=root.querySelector('.oz-q-box');const panel=root.querySelector('.oz-helper-panel');if(!box||!panel)return;
const send=box.querySelector('.oz-q-button');if(send&&!send.dataset.layout30){send.innerHTML=reply;send.dataset.layout30='yes';send.title='Отправить вопрос'}
if(panel.querySelector('.oz-layout30-contacts'))return;
const links=[...root.querySelectorAll('a[href]')].filter(a=>!a.closest('.oz-q-box'));
const find=(kind)=>links.find(a=>{const s=((a.textContent||'')+' '+a.getAttribute('href')+' '+(a.getAttribute('aria-label')||'')+' '+(a.className||'')).toLowerCase();return kind==='vk'?/vk.com|вконтакте|oz.*vk/.test(s):/t.me|telegram|телеграм/.test(s)});
const contacts=document.createElement('div');contacts.className='oz-layout30-contacts';
let count=0;
for(const [name,source,svg] of [['vk',find('vk'),vk],['tg',find('tg'),tg]]){
 if(!source)continue;
 const a=document.createElement('a');a.className='oz-layout30-brand '+name;a.href=source.href;a.target=source.target||'_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',name==='vk'?'ВКонтакте':'Telegram');a.innerHTML=svg;contacts.appendChild(a);count++;
}
if(count){box.parentNode.insertBefore(contacts,box);links.forEach(a=>{if(a===find('vk')||a===find('tg')){let p=a;while(p.parentElement&&p.parentElement!==panel&&p.parentElement.children.length===1&&!p.parentElement.classList.contains('oz-helper-panel'))p=p.parentElement;p.classList.add('oz-layout30-hidden')}})}
}
function start(){install();let busy=false;const ob=new MutationObserver(()=>{if(busy)return;busy=true;ob.disconnect();install();ob.observe(document.body,{childList:true,subtree:true});busy=false});ob.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();


// Searchable FAQ input, tolerant of word forms and typos.
(function(){
var topics=[
['заказ оформить покупка корзина заявка заказать приобрести купить оформить','Для заказа выберите растения в каталоге, добавьте их в корзину и отправьте заявку.','каталог'],
['доставка привезти отправка перевозка транспорт курьер','Условия доставки, сроки и стоимость уточните у питомника для вашего адреса.','контакты'],
['самовывоз забрать приехать получить самостоятельно','Возможность самовывоза и время получения согласуйте с питомником.','контакты'],
['адрес находитесь добраться проехать местонахождение карта координаты','Адрес питомника и способы связи указаны в разделе «Контакты».','контакты'],
['телефон позвонить связаться написать вконтакте телеграм почта контакты','Все актуальные способы связи с питомником указаны в разделе «Контакты».','контакты'],
['график часы режим работы открыты выходной работаете','Актуальные часы работы и удобное время посещения уточните через контакты питомника.','контакты'],
['цена стоимость прайс прайслист сколько стоит рублей скидка','Стоимость зависит от сорта и размера растения. Актуальные цены смотрите в каталоге или уточняйте у питомника.','каталог'],
['наличие осталось есть доступно остаток доступность','Наличие растений меняется. Актуальный остаток конкретного сорта уточните у питомника.','каталог'],
['каталог ассортимент растения сорта виды выбор продукция','Посмотреть растения и доступные категории можно в каталоге сайта.','каталог'],
['гортензия гортензии метельчатая древовидная','Гортензии можно поискать в каталоге. Наличие конкретных сортов уточните перед заказом.','каталог'],
['хвойные хвойники туя ель сосна можжевельник пихта','Хвойные растения представлены среди направлений питомника. Выбирайте в каталоге и уточняйте сорта.','каталог'],
['плодовые яблоня груша вишня слива ягоды смородина малина жимолость','Плодовые и ягодные культуры ищите в каталоге питомника.','каталог'],
['декоративные кустарники деревья барбарис спирея сирень цветы','Декоративные растения можно посмотреть в каталоге питомника.','каталог'],
['рассада саженцы саженец посадочный материал','Рассаду и саженцы выбирайте в каталоге; актуальное наличие уточняйте.','каталог'],
['выбрать подбор посоветуйте рекомендация подойдет сад участок','Напишите, для какого участка нужны растения и какие условия на нём. Для выбора конкретного сорта можно связаться с питомником.','контакты'],
['уход полив поливать сажать посадка удобрение обрезка зимовка','Уход зависит от вида и сорта растения. За рекомендациями по конкретному саженцу обратитесь к специалистам питомника.','контакты'],
['оптом оптовый крупная партия сотрудничество закупка','Условия оптовых заказов и сотрудничества уточняйте напрямую у питомника.','контакты'],
['оплата оплатить наличные карта перевод предоплата счет','Способы оплаты и порядок расчётов уточните при оформлении заказа.','контакты'],
['фото фотография изображение картинки галерея','Фотографии растений и питомника можно посмотреть в галерее.','галерея'],
['видео ролик съемка посмотреть видеозапись','Посмотрите видеоматериалы в разделе «Видео».','видео'],
['история питомнике хозяйство теплицы выращивание производство','Подробнее о питомнике можно узнать в разделе «О питомнике».','о питомнике'],
['возврат гарантия обмен брак повреждение претензия качество','С вопросами качества, обмена и возврата обратитесь напрямую в питомник, указав подробности заказа.','контакты']
];
function clean(s){return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function rootWord(s){return clean(s).replace(/(иями|ениями|аться|овать|остями|ого|ему|ыми|ские|ская|ский|ение|ость|ами|ями|ать|ить|ала|или|ете|ной|ные|ных|ый|ий|ой|ая|ую|ые|их|ов|ев|ам|ям|ах|ях|ом|ем|ие|ия|иям|ей|а|я|ы|и|е|у|ю|о|ь)$/,'')}
function distance(a,b){if(Math.abs(a.length-b.length)>2)return 9;var old=Array.from({length:b.length+1},(_,i)=>i);for(var i=1;i<=a.length;i++){var next=[i];for(var j=1;j<=b.length;j++)next[j]=Math.min(old[j]+1,next[j-1]+1,old[j-1]+(a[i-1]===b[j-1]?0:1));old=next}return old[b.length]}
var ignored=new Set('пожалуйста подскажите скажите расскажите я мне вы вам что как какие какая какой где есть можно нужно узнать хочу это ли по у на для про а и или вопрос'.split(' '));
function terms(s){return clean(s).split(' ').filter(w=>w.length>2&&!ignored.has(w)).map(rootWord)}
var entries=topics.map(t=>({terms:terms(t[0]),answer:t[1],section:t[2]}));
function matches(a,b){return a===b||(a.length>=4&&b.length>=4&&(a.startsWith(b)||b.startsWith(a)))||(a.length>=5&&b.length>=5&&distance(a,b)<=Math.min(2,Math.floor(Math.min(a.length,b.length)/4)))}
function answer(question){var words=terms(question),best=null,high=0;entries.forEach(t=>{var score=0;words.forEach(w=>{if(t.terms.some(k=>matches(w,k)))score++});if(score>high){high=score;best=t}});return best}
var css=document.createElement('style');css.id='oz-question-field-styles';
css.textContent='#ozHelper13 .oz-q-box{box-sizing:border-box;margin:12px 0 0;padding:11px;border:1px solid #c8d6b6;border-radius:14px;background:#f1f5e9}#ozHelper13 .oz-q-label{font-size:12px;font-weight:700;color:#385b46;margin-bottom:8px}#ozHelper13 .oz-q-row{display:flex;gap:7px}#ozHelper13 .oz-q-input{box-sizing:border-box;min-width:0;flex:1;width:100%;border:1px solid #b7ceb9;border-radius:10px;background:white;color:#23422c;padding:10px;font:inherit;font-size:13px;outline:none}#ozHelper13 .oz-q-input:focus{border-color:#5d8e67}#ozHelper13 .oz-q-button{border:0;border-radius:10px;background:#356d4f;color:white;padding:0 13px;cursor:pointer}#ozHelper13 .oz-q-log{display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;margin-top:8px}#ozHelper13 .oz-q-message{font-size:12.5px;line-height:1.5;padding:10px;border-radius:11px;overflow-wrap:anywhere;white-space:pre-wrap}#ozHelper13 .oz-q-human{align-self:flex-end;background:#d8e8d8;color:#264832}#ozHelper13 .oz-q-answer{background:#e6edcf;color:#284636;border:1px solid #b9ca9c}#ozHelper13 .oz-q-answer a{color:#206042;text-decoration:underline}';
document.head.appendChild(css);
function sectionLink(label){var links=Array.from(document.querySelectorAll('a[href]'));return links.find(a=>!a.closest('#ozHelper13')&&(clean(a.textContent).includes(clean(label))||clean(a.getAttribute('href')).includes(clean(label).replace(/ /g,'')))&&a.href.indexOf(location.origin)===0)}
function install(){
 var helper=document.getElementById('ozHelper13');if(!helper)return;
 var panel=helper.querySelector('.oz-helper-panel');if(!panel||panel.querySelector('.oz-q-box'))return;
 var box=document.createElement('div');box.className='oz-q-box';
 var label=document.createElement('div');label.className='oz-q-label';label.textContent='Или задайте свой вопрос';
 var row=document.createElement('div');row.className='oz-q-row';
 var input=document.createElement('input');input.className='oz-q-input';input.type='text';input.maxLength=500;input.placeholder='Например: есть гортензии?';input.setAttribute('aria-label','Вопрос питомнику');
 var send=document.createElement('button');send.type='button';send.className='oz-q-button';send.textContent='➜';send.setAttribute('aria-label','Отправить вопрос');
 var log=document.createElement('div');log.className='oz-q-log';log.setAttribute('aria-live','polite');
 function bubble(message,human,link){var div=document.createElement('div');div.className='oz-q-message '+(human?'oz-q-human':'oz-q-answer');div.textContent=message;if(link){var url=sectionLink(link);if(url){var a=document.createElement('a');a.href=url.href;a.textContent='Перейти в раздел «'+link+'» ↗';div.append(document.createTextNode('\n'),a)}}log.appendChild(div);log.scrollTop=log.scrollHeight}
 function submit(){var q=input.value.trim();if(!q)return;bubble(q,true);input.value='';var result=answer(q);if(result)bubble(result.answer,false,result.section);else bubble('Я не нашёл точный ответ на этот вопрос. Можно посмотреть каталог или уточнить информацию у сотрудников питомника.',false,'контакты')}
 send.addEventListener('click',submit);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit()}});
 row.append(input,send);box.append(label,row,log);panel.appendChild(box);
}
function start(){install();var observer=new MutationObserver(()=>{install()});observer.observe(document.body||document.documentElement,{childList:true,subtree:true});setInterval(install,1200)}
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