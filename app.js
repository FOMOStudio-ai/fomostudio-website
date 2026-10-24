import {validateContent} from './content-schema.js';
let active='all';
function filter(){document.querySelectorAll('#project-grid .project').forEach(p=>p.hidden=active!=='all'&&p.dataset.category!==active)}
document.querySelectorAll('[data-filter]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.filter===active));button.onclick=()=>{active=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});filter()}});
document.querySelectorAll('.project iframe').forEach(f=>f.title=f.closest('.project').querySelector('h3').textContent);
function render(raw){
 const d=validateContent(raw);document.title=d.siteTitle;document.querySelector('meta[name=description]').content=d.description;
 document.querySelectorAll('[data-text]').forEach(e=>{if(Object.hasOwn(d.text,e.dataset.text))e.textContent=d.text[e.dataset.text]});
 document.querySelectorAll('.contact-link,#contact-address').forEach(e=>e.href='mailto:'+d.email);document.querySelector('#contact-address').textContent=d.email;document.querySelector('#location').textContent=d.location;
 const grid=document.querySelector('#project-grid');grid.replaceChildren();
 for(const p of d.projects){
 const card=document.createElement('article');card.className='project'+(p.wide?' wide':'');card.dataset.category=p.category;
 const label=document.createElement('div');label.className='spec';label.textContent=p.label;
 const stage=document.createElement('div');stage.className='video-stage';stage.style.background=d.background;stage.style.setProperty('--frame-width',(p.ratio*100)+'cqh');stage.style.setProperty('--frame-height',(100/p.ratio)+'cqw');
 const frame=document.createElement('iframe');frame.src=`https://player.mediadelivery.net/embed/787458/${p.id}?autoplay=false`;frame.title=p.title;frame.loading='lazy';frame.style.cssText='border:0;position:absolute';frame.allow='autoplay;encrypted-media;picture-in-picture;fullscreen';frame.allowFullscreen=true;stage.append(frame);
 const info=document.createElement('div');info.className='project-info';const inner=document.createElement('div');const title=document.createElement('h3');title.textContent=p.title;const meta=document.createElement('div');meta.className='meta';meta.textContent=p.meta;inner.append(title,meta);info.append(inner);card.append(label,stage,info);grid.append(card);
 }filter();
}
if(window.parent!==window&&new URLSearchParams(location.search).has('preview')){
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='fomo-preview')return;try{render(e.data.content)}catch{}});
 parent.postMessage({type:'fomo-preview-ready'},location.origin);
}else{
 fetch('/api/content',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{if(d.content)render(d.content)}).catch(()=>{/* Keep the complete static portfolio available if storage is unavailable. */});
}
