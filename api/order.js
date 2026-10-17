const { put } = require('@vercel/blob');
const crypto = require('node:crypto');

module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Метод не поддерживается'});}
  try{
    const raw=JSON.stringify(req.body||{});
    if(raw.length>24000)return res.status(413).json({error:'Слишком большая заявка'});
    const p=req.body||{};
    const name=String(p.name||'').trim(), phone=String(p.phone||'').trim(), email=String(p.email||'').trim();
    const service=String(p.service||''), contact=String(p.contact||'').trim();
    const products=Array.isArray(p.items)?p.items:[];
    if(name.length<2||name.length>100||phone.length<10||phone.length>30||!/^\S+@\S+\.\S+$/.test(email)||!['ВКонтакте','Telegram','MAX'].includes(service)||!contact||contact.length>250||products.length<1||products.length>100)
      return res.status(400).json({error:'Проверьте контактные данные и состав заказа'});
    const cleanItems=products.map(i=>({name:String(i.name||'').slice(0,180),quantity:Math.floor(Number(i.qty)||0),price:String(i.price||'').slice(0,75)}));
    if(cleanItems.some(i=>!i.name||i.quantity<1||i.quantity>10000))return res.status(400).json({error:'Некорректный состав заказа'});
    const id='OZ-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(3).toString('hex').toUpperCase();
    const order={id,createdAt:new Date().toISOString(),status:'new',customer:{name,phone,email,service,contact},items:cleanItems};
    await put('orders/'+id+'.json',JSON.stringify(order),{access:'private',contentType:'application/json',addRandomSuffix:false});
    return res.status(201).json({ok:true,id});
  }catch(err){
    console.error('Order storage failed:',err?.message);
    return res.status(503).json({error:'Не удалось сохранить заявку. Попробуйте позже.'});
  }
};
