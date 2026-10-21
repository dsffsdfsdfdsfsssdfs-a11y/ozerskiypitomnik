const {get,put}=require('@vercel/blob');
const {timingSafeEqual}=require('node:crypto');
const FILE='ozerskiy-header-custom-v1.json';
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  try{const f=await get(FILE,{access:'private'});return res.status(200).json(f?JSON.parse(await new Response(f.stream).text()):{items:{}})}
  catch(e){console.error(e);return res.status(503).json({error:'Не удалось загрузить настройки шапки'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const a=Buffer.from(String(req.headers['x-editor-password']||'')),b=Buffer.from(process.env.OZ_LOGO_EDITOR_PASSWORD||'');
 if(!a.length||a.length!==b.length||!timingSafeEqual(a,b))return res.status(401).json({error:'Неверный пароль'});
 const payload=req.body?.items;
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return res.status(400).json({error:'Неверные настройки'});
 const accepted={};
 const ids=['phone','helper','cart','menu','nav0','nav1','nav2','nav3','nav4','nav5'];
 for(const key of ids){
  const o=payload[key];if(!o||typeof o!=='object')continue;
  const number=(v,def,min,max)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):def;
  accepted[key]={x:number(o.x,0,-500,500),y:number(o.y,0,-200,200),size:number(o.size,key.startsWith('nav')?20:62,12,160)};
 }
 try{await put(FILE,JSON.stringify({items:accepted}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});return res.status(200).json({ok:true,items:accepted})}
 catch(e){console.error(e);return res.status(503).json({error:'Сохранение не удалось'})}
};