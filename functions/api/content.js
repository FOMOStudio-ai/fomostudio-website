import {validateContent} from '../../content-schema.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 if(request.method==='GET'){
  if(!env.FOMO_STORE)return reply({content:null,revision:null});
  try{const raw=await env.FOMO_STORE.get('site_content');if(!raw)return reply({content:null,revision:null});const stored=JSON.parse(raw);
   if(stored.content?.version===1)return reply({content:validateContent(stored.content),revision:stored.revision});
   // Never silently overwrite a legacy record whose schema needs migration.
   return reply({error:'Existing saved content needs migration before publishing.'},409);
  }catch{return reply({error:'Saved content could not be loaded.'},503)}
 }
 if(request.method!=='PUT')return reply({error:'Method not allowed'},405);
 if(!env.FOMO_STORE)return reply({error:'Content storage is not connected yet. Your draft is still available in this browser.'},503);
 try{
  if(Number(request.headers.get('Content-Length'))>150000)return reply({error:'Content is too large'},413);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>150000)return reply({error:'Content is too large'},413);
  const payload=JSON.parse(raw),content=validateContent(payload.content);
  const previous=await env.FOMO_STORE.get('site_content');const record=previous?JSON.parse(previous):null;
  if(record&&record.content?.version!==1)return reply({error:'Existing saved content needs migration before publishing.'},409);
  if((record?.revision||null)!==(payload.revision||null))return reply({error:'A newer version was published. Reload before publishing; your local draft is preserved.'},409);
  const revision=crypto.randomUUID();await env.FOMO_STORE.put('site_content',JSON.stringify({content,revision}));return reply({success:true,revision});
 }catch(e){return reply({error:e instanceof SyntaxError?'Invalid content':e.message||'Could not publish.'},400)}
}
