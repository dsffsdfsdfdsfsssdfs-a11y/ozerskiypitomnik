const {put,get}=require('@vercel/blob');
const {timingSafeEqual}=require('node:crypto');
const FILE='ozerskiy-logo-settings-v1.json';
const fallback={src:null,x:0,y:0,width:150,mobileWidth:125};
function authorized(req){
 const actual=String(req.headers['x-editor-password']||'');
 const expected=process.env.OZ_LOGO_EDITOR_PASSWORD||'';
 if(!actual||!expected)return false;
 const a=Buffer.from(actual),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b);
}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 if(req.method==='GET'){
  try{
   const f=await get(FILE,{access:'private'});
   if(!f)return res.status(200).json(fallback);
   const value=JSON.parse(await new Response(f.stream).text());
   return res.status(200).json(value);
  }catch(err){console.error('logo get',err);return res.status(503).json({error:'Не удалось загрузить опубликованный логотип'});}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!authorized(req))return res.status(401).json({error:'Неправильный пароль редактора'});
 try{
  const v=req.body||{},src=v.src;
  if(src!==null&&(typeof src!=='string'||!/^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(src)||src.length>1900000))return res.status(400).json({error:'Изображение должно быть PNG/JPG/WebP до 1.4 МБ'});
  const clamp=(n,a,b,d)=>Number.isFinite(Number(n))?Math.max(a,Math.min(b,Number(n))):d;
  const saved={src,x:clamp(v.x,-800,800,0),y:clamp(v.y,-800,800,0),width:clamp(v.width,45,600,150),mobileWidth:clamp(v.mobileWidth,40,300,125)};
  await put(FILE,JSON.stringify(saved),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});
  return res.status(200).json({ok:true});
 }catch(err){console.error('logo save',err);return res.status(503).json({error:'Публикация не удалась — проверь подключение Vercel Blob'});}
};