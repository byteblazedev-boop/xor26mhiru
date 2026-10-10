(() => {
'use strict';
const events=window.XOR_EVENTS;
const list=document.querySelector('#event-list');
const dialog=document.querySelector('#event-dialog');
let lastTrigger;
function card(e,i){return `<article class="event-card" data-type="${e.type}"><div class="event-symbol" aria-hidden="true">${e.glyph.replaceAll('<','&lt;')}</div><div class="event-name"><small>0${i+1} / ${e.type==='team'?'GROUP EVENT':'INDIVIDUAL EVENT'}</small><h3>${e.name}</h3><p>${e.format} · ${e.team}</p></div><div class="event-desc"><strong>${e.short}</strong>${e.desc}</div><button class="event-open" data-event="${e.id}" aria-label="Read ${e.name} guidelines">View guidelines <span>↗</span></button></article>`;}
list.innerHTML=events.map(card).join('');
function openEvent(id,trigger){const e=events.find(x=>x.id===id);if(!e)return;lastTrigger=trigger;document.querySelector('#dialog-content').innerHTML=`<h2 id="dialog-title">${e.name}</h2><p class="dialog-theme">${e.theme}</p><div class="event-meta"><span>GRADES 6–13</span><span>${e.team.toUpperCase()}</span><span>${e.format.toUpperCase()}</span></div><div class="full-rules">${e.rules}</div>`;dialog.showModal();document.body.style.overflow='hidden';dialog.scrollTop=0;}
document.addEventListener('click',e=>{const b=e.target.closest('[data-event]');if(b)openEvent(b.dataset.event,b);});
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';lastTrigger?.focus();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{const a=b===button;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a));});document.querySelectorAll('.event-card').forEach(c=>{c.hidden=button.dataset.filter!=='all'&&c.dataset.type!==button.dataset.filter;c.style.display=c.hidden?'none':'';});}));
const input=document.querySelector('#search'),results=document.querySelector('#search-results'),status=document.querySelector('#search-status');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function plain(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent;}
const texts=events.map(e=>({...e,text:plain(e.rules)}));
input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();if(q.length<2){results.innerHTML='';status.textContent='Type at least 2 characters to search.';return;}const found=texts.filter(e=>(e.name+' '+e.text).toLowerCase().includes(q));status.textContent=found.length?`${found.length} competition${found.length===1?'':'s'} found.`:'No matching rules. Try a different word or download the full guidelines.';results.innerHTML=found.map(e=>{const n=e.text.toLowerCase().indexOf(q),start=Math.max(0,n-65),s=e.text.slice(start,start+230),p=s.toLowerCase().indexOf(q);let snippet=escape(s);if(p>=0)snippet=escape(s.slice(0,p))+'<mark>'+escape(s.slice(p,p+q.length))+'</mark>'+escape(s.slice(p+q.length));return `<article class="search-result"><h3>${e.name}</h3><p>${start?'…':''}${snippet}…</p><button data-event="${e.id}">Read full guidelines ↗</button></article>`;}).join('');});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!dialog.open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();input.focus();input.scrollIntoView({block:'center'});}});
const canvas=document.querySelector('#core'),ctx=canvas.getContext('2d'),toggle=document.querySelector('#motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,raf=0,phase=0,last=0,w=0,h=0,visible=true;
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function draw(){ctx.clearRect(0,0,w,h);const cx=w*.5,cy=h*.5,r=Math.min(w,h)*.315;
const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.45);glow.addColorStop(0,'#87c34c12');glow.addColorStop(.5,'#92c66008');glow.addColorStop(1,'#14201300');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
ctx.save();ctx.translate(cx,cy);
for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,0,r*(1.35+j*.13),r*(1.35+j*.13),0,0,Math.PI*2);ctx.strokeStyle=j===0?'#bbdf9340':'#bbdf9313';ctx.lineWidth=.6;ctx.setLineDash(j===1?[1,11]:[]);ctx.stroke();}
ctx.setLineDash([]);for(let i=0;i<100;i++){const a=i/100*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*1.5,Math.sin(a)*r*1.5);ctx.lineTo(Math.cos(a)*r*(i%5===0?1.54:1.515),Math.sin(a)*r*(i%5===0?1.54:1.515));ctx.strokeStyle='#d2e7b543';ctx.stroke();}
const rot=phase*.12+.4;
function project(lat,lon){const x=Math.cos(lat)*Math.cos(lon),y=Math.sin(lat),z=Math.cos(lat)*Math.sin(lon);const x1=x*Math.cos(rot)-z*Math.sin(rot),z1=x*Math.sin(rot)+z*Math.cos(rot);const tilt=.36;return {x:(x1*Math.cos(tilt)-y*Math.sin(tilt))*r,y:(x1*Math.sin(tilt)+y*Math.cos(tilt))*r,z:z1};}
for(let lat=-Math.PI/2;lat<=Math.PI/2;lat+=Math.PI/27){ctx.beginPath();for(let k=0;k<=180;k++){const p=project(lat,k/180*Math.PI*2);if(k===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.lineWidth=.55;ctx.strokeStyle='#bedb893d';ctx.stroke();}
for(let lon=0;lon<Math.PI*2;lon+=Math.PI/25){ctx.beginPath();for(let k=0;k<=90;k++){const p=project(-Math.PI/2+k/90*Math.PI,lon);if(k===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.strokeStyle='#bada8e33';ctx.stroke();}
for(let i=0;i<160;i++){const lat=Math.asin(Math.sin(i*129.7)),lon=i*2.39996;const p=project(lat,lon);ctx.beginPath();ctx.arc(p.x,p.y,p.z>0?1.25:.5,0,Math.PI*2);ctx.fillStyle=p.z>0?'#dbfcbba0':'#9bc36f35';ctx.fill();}
ctx.rotate(-.48);ctx.beginPath();ctx.ellipse(0,0,r*1.8,r*.36,0,0,Math.PI*2);ctx.strokeStyle='#d8ebad60';ctx.lineWidth=.75;ctx.stroke();const a=phase*.13;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.8,Math.sin(a)*r*.36,3,0,Math.PI*2);ctx.shadowBlur=18;ctx.shadowColor='#e5ffbd';ctx.fillStyle='#e5ffbd';ctx.fill();ctx.shadowBlur=0;ctx.restore();
for(let i=0;i<35;i++){const x=((Math.sin(i*53.13)*.5+.5)*w),y=((Math.cos(i*17.38)*.5+.5)*h);ctx.fillStyle='#c7dda559';ctx.fillRect(x,y,i%7===0?2:1,1);}
}
function frame(t){raf=0;if(paused||!visible||document.hidden)return;if(last)phase+=Math.min((t-last)/1000,.05);last=t;draw();raf=requestAnimationFrame(frame);}
function sync(){toggle.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';toggle.setAttribute('aria-pressed',String(paused));cancelAnimationFrame(raf);last=0;draw();if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
toggle.addEventListener('click',()=>{paused=!paused;sync();});reduced.addEventListener('change',e=>{paused=e.matches;sync();});document.addEventListener('visibilitychange',sync);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
window.addEventListener('resize',resize);resize();sync();
})();
