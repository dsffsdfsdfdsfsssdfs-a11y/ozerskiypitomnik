const {get,put}=require('@vercel/blob');
const {timingSafeEqual}=require('node:crypto');
const FILE='ozerskiy-published-hero-images-v1.json';
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){try{const f=await get(FILE,{access:'private'});return res.status(200).json(f?JSON.parse(await new Response(f.stream).text()):{images:null})}catch(e){console.error(e);return res.status(503).json({error:'Не удалось прочитать фотографии'})}}
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const a=Buffer.from(String(req.headers['x-editor-password']||'')),b=Buffer.from(process.env.OZ_LOGO_EDITOR_PASSWORD||'');
 if(!a.length||a.length!==b.length||!timingSafeEqual(a,b))return res.status(401).json({error:'Неправильный пароль'});
 const images=req.body?.images;
 if(!Array.isArray(images)||images.length>20)return res.status(400).json({error:'Можно сохранить до 20 фотографий'});
 const cleaned=[];
 for(const item of images){
  if(!item||typeof item!=='object'||typeof item.id!=='string'||!/^[\w-]{1,80}$/.test(item.id))return res.status(400).json({error:'Неверный идентификатор фотографии'});
  const src=item.src;
  if(typeof src!=='string'||!(src.startsWith('/hero-decoration-')||/^data:image\/(png|webp|jpeg);base64,[\w+/=]+$/.test(src))||src.length>950000)return res.status(400).json({error:'Изображение слишком большое'});
  const num=(v,min,max,def)=>Number.isFinite(+v)?Math.min(max,Math.max(min,+v)):def;
  cleaned.push({id:item.id,src,x:num(item.x,-60,100,10),y:num(item.y,-60,100,10),w:num(item.w,3,90,20),width:num(item.width,1,5000,1000),height:num(item.height,1,5000,1000)});
 }
 const json=JSON.stringify({images:cleaned});
 if(json.length>3900000)return res.status(413).json({error:'Слишком большой общий размер фотографий'});
 try{await put(FILE,json,{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});return res.status(200).json({ok:true})}
 catch(e){console.error(e);return res.status(503).json({error:'Не удалось опубликовать фотографии'})}
};