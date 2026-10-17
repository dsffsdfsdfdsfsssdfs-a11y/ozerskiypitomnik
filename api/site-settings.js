const { get } = require('@vercel/blob');
const BLOB='ozerskiy-public-editor-settings-v1.json';
// Read-only public settings endpoint. Legacy editing/publishing has been removed.
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try {
  const file=await get(BLOB,{access:'private'});
  if(!file)return res.status(200).json({records:{},published:false});
  const records=await new Response(file.stream).text();
  return res.status(200).send(records);
 } catch(err) {
  console.error('settings read',err);
  return res.status(503).json({error:'Хранилище временно недоступно'});
 }
};
