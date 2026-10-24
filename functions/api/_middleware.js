// Used only by the independent Cloudflare build. Never trusts ChatGPT identity headers.
const jwksCache=new Map();
function decode64(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
async function isOwner(request,env){
 try{
 const issuer=env.ACCESS_TEAM_DOMAIN?.replace(/\/$/,'');
 if(!issuer||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)||!env.ACCESS_AUD||!env.OWNER_EMAIL)return false;
 const token=request.headers.get('Cf-Access-Jwt-Assertion')||request.headers.get('Cookie')?.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];
 if(!token||token.length>16000)return false;
 const parts=token.split('.');if(parts.length!==3)return false;
 const header=JSON.parse(new TextDecoder().decode(decode64(parts[0]))),payload=JSON.parse(new TextDecoder().decode(decode64(parts[1])));
 const now=Math.floor(Date.now()/1000);
 if(header.alg!=='RS256'||!header.kid||payload.iss!==issuer||!Array.isArray(payload.aud)||!payload.aud.includes(env.ACCESS_AUD)||typeof payload.exp!=='number'||payload.exp<=now||(payload.nbf&&payload.nbf>now)||typeof payload.email!=='string'||payload.email.toLowerCase()!==env.OWNER_EMAIL.toLowerCase())return false;
 let cached=jwksCache.get(issuer);
 if(!cached||cached.expires<Date.now()||!cached.keys.some(k=>k.kid===header.kid)){
 const response=await fetch(issuer+'/cdn-cgi/access/certs');if(!response.ok)return false;
 const data=await response.json();if(!Array.isArray(data.keys))return false;
 cached={keys:data.keys,expires:Date.now()+3600000};jwksCache.set(issuer,cached);
 }
 const jwk=cached.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return false;
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode64(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 }catch{return false;}
}

export async function onRequest(context) {
  const {request, env} = context;
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  if (path === '/api/content' && request.method === 'GET') return context.next();
  if (!(await isOwner(request, env))) return Response.json({error:'Owner sign-in required', authenticated:false, canEdit:false},{status:401,headers:{'Cache-Control':'no-store'}});
  if (!['GET','HEAD'].includes(request.method) && request.headers.get('Origin') !== new URL(request.url).origin) return Response.json({error:'Invalid origin'},{status:403});
  return context.next();
}
