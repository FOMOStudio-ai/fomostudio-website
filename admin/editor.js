import {validateContent,videoId} from '/content-schema.js';
const $=s=>document.querySelector(s),key='fomo-editor-draft-v1';let state,revision=null,dirty=false,ready=false,canPublish=false;
const names={eyebrow:'Intro label',heroTitle:'Main headline',heroOutline:'Outlined headline','hero-copy':'Introduction','copy-1':'Portfolio heading','section-intro':'Portfolio introduction',disclosure:'Portfolio disclosure','copy-2':'Services heading','services-copy':'Services introduction','copy-11':'Process heading','copy-20':'Contact heading',offer:'Free concept offer'};
function status(message){$('#status').textContent=message}
function changed(){dirty=true;status('Unsaved draft changes. Your live website has not changed.')}
function field(label,value,onChange,type='text') {const wrap=document.createElement('label');wrap.append(document.createTextNode(label));const el=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')el.type=type;el.value=value;el.addEventListener('input',()=>{onChange(el.value);changed()});wrap.append(el);return wrap}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b}
function render(){
 $('#count').textContent=`(${state.projects.length})`;const list=$('#projects');list.replaceChildren();
 state.projects.forEach((p,i)=>{const card=document.createElement('section');card.className='project-editor';const heading=document.createElement('div');heading.className='project-heading';const h=document.createElement('h2');h.textContent=`${i+1}. ${p.title||'New video'}`;heading.append(h);
 const move=delta=>{const other=i+delta;if(other<0||other>=state.projects.length)return;[state.projects[i],state.projects[other]]=[state.projects[other],state.projects[i]];changed();render()};
 const up=button('↑ Move up',()=>move(-1)),down=button('↓ Move down',()=>move(1));up.disabled=i===0;down.disabled=i===state.projects.length-1;heading.append(up,down,button('Remove',()=>{if(confirm('Remove this video from the website draft? The original stays in Bunny.net.')){state.projects.splice(i,1);changed();render()}}));card.append(heading);
 const fields=document.createElement('div');fields.className='fields';fields.append(field('Title',p.title,v=>{p.title=v}),field('Details',p.meta,v=>p.meta=v));const link=field('Bunny share link or video ID',p.id,v=>p.id=v);link.className='video-link';fields.append(link,field('Label',p.label,v=>p.label=v));
 const cat=document.createElement('label');cat.textContent='Category';const select=document.createElement('select');for(const value of ['brand','product','social','story']){const option=document.createElement('option');option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);select.append(option)}select.value=p.category;select.onchange=()=>{p.category=select.value;changed()};cat.append(select);fields.append(cat);
 const ratio=document.createElement('label');ratio.textContent='Video shape';const shape=document.createElement('select');for(const [value,name] of [[1,'Square (1:1)'],[8/7,'Comparison (8:7)'],[16/9,'Landscape (16:9)'],[9/16,'Vertical (9:16)'],[4/5,'Portrait (4:5)']]){const o=document.createElement('option');o.value=value;o.textContent=name;shape.append(o)}if(![...shape.options].some(o=>Number(o.value)===p.ratio)){const o=document.createElement('option');o.value=p.ratio;o.textContent='Custom ratio';shape.append(o)}shape.value=p.ratio;shape.onchange=()=>{p.ratio=Number(shape.value);changed()};ratio.append(shape);fields.append(ratio);
 const wide=document.createElement('label');wide.className='wide-label';const check=document.createElement('input');check.type='checkbox';check.checked=p.wide;check.onchange=()=>{p.wide=check.checked;changed()};wide.append(check,document.createTextNode('Wide feature card'));fields.append(wide);card.append(fields);list.append(card);
 });
 const texts=$('#text-fields');texts.replaceChildren();for(const [k,v] of Object.entries(state.text))texts.append(field(names[k]||v.slice(0,65)||k,v,val=>state.text[k]=val,'textarea'));
 for(const k of ['email','location','siteTitle','description','background']){$('#'+k).value=state[k];$('#'+k).oninput=e=>{state[k]=e.target.value;changed()}}
}
function normalized(){return validateContent({...state,projects:state.projects.map(p=>({...p,id:videoId(p.id)}))})}
function saveDraft(){try{state=normalized();localStorage.setItem(key,JSON.stringify({content:state,revision,savedAt:new Date().toISOString()}));dirty=false;status('Draft saved in this browser. Nothing has been published.');return true}catch(e){status(e.message);return false}}
async function getPublished(){const r=await fetch('/api/content',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'Could not load published content.');return d}
$('#save').onclick=saveDraft;
$('#add').onclick=()=>{if(state.projects.length>=50)return status('You can add up to 50 videos.');state.projects.push({id:'',title:'New video',meta:'Product concept',label:'Independent concept',category:'product',ratio:1,wide:false});changed();render();$('#projects').lastElementChild.scrollIntoView({behavior:'smooth',block:'center'})};
$('#reset').onclick=async()=>{if(!confirm('Replace this draft with the published version? Download a backup first if you want to keep it.'))return;try{const d=await getPublished();state=validateContent(d.content||await (await fetch('/defaults.json')).json());revision=d.revision;localStorage.removeItem(key);dirty=false;render();status('Published version loaded.')}catch(e){status(e.message)}};
$('#publish').onclick=async()=>{if(!canPublish)return;if(!saveDraft())return;if(!confirm('Publish this draft to the live website?'))return;$('#publish').disabled=true;try{const r=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:state,revision})});const d=await r.json();if(!r.ok)throw Error(d.error||'Publish failed');revision=d.revision;localStorage.setItem(key,JSON.stringify({content:state,revision}));dirty=false;status('Published successfully. Allow up to a minute for all visitors to see the update.')}catch(e){status(e.message)}finally{$('#publish').disabled=!canPublish}};
function sendPreview(){if(ready)$('#preview-frame').contentWindow.postMessage({type:'fomo-preview',content:normalized()},location.origin)}
$('#preview').onclick=()=>{try{normalized();$('#preview-dialog').showModal();ready=false;$('#preview-frame').src='/?preview=1'}catch(e){status(e.message)}};
addEventListener('message',e=>{if(e.origin===location.origin&&e.source===$('#preview-frame').contentWindow&&e.data?.type==='fomo-preview-ready'){ready=true;sendPreview()}});
$('#desktop').onclick=()=>$('#preview-frame').style.width='100%';$('#mobile').onclick=()=>$('#preview-frame').style.width='375px';$('#close-preview').onclick=()=>$('#preview-dialog').close();$('#preview-dialog').addEventListener('close',()=>{$('#preview-frame').src='about:blank';ready=false});
$('#export').onclick=()=>{try{const blob=new Blob([JSON.stringify(normalized(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='FOMO-Studio-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){status(e.message)}};
$('#restore').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>150000)throw Error('Backup is too large.');const restored=validateContent(JSON.parse(await f.text()));if(!confirm('Replace this draft with the backup? Nothing will publish yet.'))return;state=restored;render();changed()}catch(e){status(e.message)}finally{e.target.value=''}};
$('#editor').onsubmit=e=>e.preventDefault();addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
async function init(){
 try{
 const defaults=validateContent(await (await fetch('/defaults.json')).json());let published=null,loadError='';
 try{published=await getPublished()}catch(e){loadError=e.message}
 state=published?.content?validateContent(published.content):defaults;revision=published?.revision||null;
 let draft=null;try{const raw=localStorage.getItem(key);if(raw)draft=JSON.parse(raw)}catch{}
 if(draft?.content){try{state=validateContent(draft.content);revision=draft.revision||null}catch{draft=null}}
 render();const auth=await (await fetch('/api/me',{cache:'no-store'})).json();canPublish=auth.canEdit===true&&auth.storageReady===true&&!loadError;$('#publish').disabled=!canPublish;
 $('#signin').hidden=auth.canEdit||!auth.accessConfigured;
 $('#access-note').textContent=canPublish?'Signed in as owner. Publishing is enabled.':auth.canEdit?'Content storage needs to be connected before publishing.':auth.accessConfigured?'Sign in to publish. You can prepare a draft below.':'Owner sign-in needs to be connected in Cloudflare before publishing. You can prepare and preview a draft below.';
 status(loadError|| (draft?'Your saved browser draft has been restored.':'Current website loaded. Ready to edit.'));
 }catch(e){status('Could not initialize the editor: '+e.message)}
}
init();
