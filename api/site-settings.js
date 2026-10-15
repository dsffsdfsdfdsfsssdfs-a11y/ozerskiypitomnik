const crypto = require('node:crypto');
const { get, put } = require('@vercel/blob');
const BLOB='ozerskiy-public-editor-settings-v1.json';
function constantTime(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length && crypto.timingSafeEqual(x,y)}
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method==='GET'){
  try {const file=await get(BLOB,{access:'private'});if(!file)return res.status(200).json({records:{},published:false});const records=await new Response(file.stream).text();return res.status(200).send(records)}
  catch(err){console.error('settings read',err);return res.status(503).json({error:'Хранилище временно недоступно'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OZ_EDITOR_ADMIN_KEY||!constantTime(req.headers['x-editor-key'],process.env.OZ_EDITOR_ADMIN_KEY))return res.status(401).json({error:'Неверный ключ редактора'});
 try {
  const body=req.body||{};const input=body.records;
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length>200)return res.status(400).json({error:'Некорректные изменения'});
  const records={};
  for(const [key,value] of Object.entries(input)){
   if(typeof key!=='string'||key.length>350||!value||typeof value!=='object')return res.status(400).json({error:'Некорректное поле'});
   const x=Number(value.x||0),y=Number(value.y||0),size=Number(value.size||0);
   if(![x,y,size].every(n=>Number.isFinite(n)&&Math.abs(n)<5000))return res.status(400).json({error:'Неверный размер или позиция'});
   const t=value.text==null?null:String(value.text);
   if(t!==null&&t.length>2000)return res.status(400).json({error:'Слишком длинный текст'});
   const isMobile=key.startsWith('mobile::');
   if(isMobile){
    const kind=['text','box','image'].includes(value.kind)?value.kind:'text';
    const hidden=value.hidden===true;
    const width=value.width==null?undefined:Number(value.width);
    if(width!==undefined&&(!Number.isFinite(width)||width<0||width>5000))return res.status(400).json({error:'Неверная ширина мобильного элемента'});
    records[key]={x,y,size,text:t,kind,hidden,...(width===undefined?{}:{width})};
   }else records[key]={x,y,size,text:t};
  }
  const mobileLogo=body.mobileLogo??null;
  if(mobileLogo!==null&&(typeof mobileLogo!=='string'||mobileLogo.length>475000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(mobileLogo)))return res.status(400).json({error:'Некорректный мобильный логотип'});
  const logo=body.logo??null;
  if(logo!==null&&logo!=='hidden'&&(typeof logo!=='string'||logo.length>475000||!/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(logo)))return res.status(400).json({error:'Некорректный формат логотипа'});
  const data={records,logo,mobileLogo,published:true,updatedAt:new Date().toISOString()};
  await put(BLOB,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});
  return res.status(200).json({ok:true,updatedAt:data.updatedAt});
 }catch(err){console.error('settings write',err);return res.status(503).json({error:'Не удалось сохранить на сервере'})}
};
