const crypto=require('node:crypto');
const {get,put}=require('@vercel/blob');
const KEY='ozerskiy-helper-avatar-v1.json';
function eq(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 if(req.method==='GET'){
  try{
   const obj=await get(KEY,{access:'private'});
   if(!obj)return res.status(200).json({image:null});
   return res.status(200).send(await new Response(obj.stream).text());
  }catch(e){console.error('avatar read',e);return res.status(503).json({error:'Не удалось загрузить аватарку'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OZ_EDITOR_ADMIN_KEY||!eq(req.headers['x-avatar-key'],process.env.OZ_EDITOR_ADMIN_KEY))return res.status(401).json({error:'Неверный ключ администратора'});
 const image=req.body?.image;
 if(typeof image!=='string'||image.length>350000||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(image))return res.status(400).json({error:'Нужен PNG размером до 250 КБ'});
 try{
  await put(KEY,JSON.stringify({image}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});
  return res.status(200).json({ok:true});
 }catch(e){console.error('avatar write',e);return res.status(503).json({error:'Сохранение не удалось. Проверьте Vercel Blob'})}
};