const {get,put}=require('@vercel/blob');
const {timingSafeEqual}=require('node:crypto');
const FILE='ozerskiy-home-editor-v1.json';
const validPassword=req=>{const a=Buffer.from(String(req.headers['x-editor-password']||''));const b=Buffer.from(process.env.OZ_LOGO_EDITOR_PASSWORD||'');return a.length>0&&a.length===b.length&&timingSafeEqual(a,b)};
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  try{const f=await get(FILE,{access:'private'});return res.status(200).json(f?JSON.parse(await new Response(f.stream).text()):{home:null})}
  catch(e){console.error(e);return res.status(503).json({error:'Не удалось загрузить настройки'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!validPassword(req))return res.status(401).json({error:'Неверный пароль'});
 const obj=req.body?.home;
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return res.status(400).json({error:'Некорректные настройки'});
 const safe={};
 const keys=['title','subtitle','eyebrow','buttons','primaryWidth','primaryHeight','secondaryWidth','secondaryHeight','eyebrowX','eyebrowY','titleX','titleY','subtitleX','subtitleY','primaryX','primaryY','secondaryX','secondaryY'];
 for(const key of keys)if(obj[key]!=null){const n=Number(obj[key]);if(Number.isFinite(n))safe[key]=Math.max(-1000,Math.min(1000,n))}
 for(const key of ['showPrimary','showSecondary'])if(typeof obj[key]==='boolean')safe[key]=obj[key];
 for(const key of ['titleText','subtitleText','eyebrowText','primaryText','secondaryText'])if(typeof obj[key]==='string')safe[key]=obj[key].slice(0,2000);
 try{await put(FILE,JSON.stringify({home:safe}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});return res.status(200).json({ok:true})}
 catch(e){console.error(e);return res.status(503).json({error:'Не удалось опубликовать настройки'})}
};