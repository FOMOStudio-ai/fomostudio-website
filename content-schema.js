export function validateContent(input) {
 const fail=message=>{throw Error(message)};
 const str=(v,max,name)=>{if(typeof v!=='string'||v.length>max)fail('Invalid '+name);return v.trim()};
 if(!input||input.version!==1||!Array.isArray(input.projects)||input.projects.length>50)fail('Choose up to 50 videos.');
 const text={};if(!input.text||typeof input.text!=='object'||Array.isArray(input.text)||Object.keys(input.text).length>100)fail('Invalid page text');
 for(const [key,value] of Object.entries(input.text)){if(!/^[a-zA-Z0-9-]{1,60}$/.test(key))fail('Invalid text field');text[key]=str(value,5000,'page text')}
 const email=str(input.email,254,'email');if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))fail('Enter a valid contact email.');
 const background=str(input.background,7,'background');if(!/^#[0-9a-f]{6}$/i.test(background))fail('Choose a valid background color.');
 const seen=new Set();const projects=input.projects.map(p=>{
 const id=str(p.id,36,'video ID');if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id)||seen.has(id))fail('Each video needs a unique Bunny video ID.');seen.add(id);
 if(!['brand','product','social','story'].includes(p.category))fail('Choose a valid category.');
 if(typeof p.ratio!=='number'||!Number.isFinite(p.ratio)||p.ratio<0.2||p.ratio>5)fail('Choose a valid video aspect ratio.');
 const title=str(p.title,160,'video title');if(!title)fail('Every video needs a title.');
 return {id,title,meta:str(p.meta,200,'details'),label:str(p.label,80,'label'),category:p.category,ratio:p.ratio,wide:p.wide===true};
 });
 return {version:1,text,email,background,projects,siteTitle:str(input.siteTitle,160,'site title'),description:str(input.description,500,'description'),location:str(input.location,200,'location')};
}
export function videoId(value){
 value=value.trim();if(/^[a-f0-9-]{36}$/i.test(value))return value;
 try{const u=new URL(value);if(!['player.mediadelivery.net','iframe.mediadelivery.net'].includes(u.hostname))throw Error();const m=u.pathname.match(/^\/(?:play|embed)\/787458\/([a-f0-9-]{36})\/?$/i);if(m)return m[1]}catch{}
 throw Error('Paste a Bunny share link from your FOMO library, or its video ID.');
}
