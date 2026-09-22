const PRODUCTS={
 cleanser:{name:'CeraVe Foaming Facial Cleanser',img:'https://africa.cerave.com/en/-/media/Project/Loreal/BrandSites/CeraVe/Master/US/Product/cleansers/Gallery/Foaming-Cleanser-Front-420X420-v1.png'},
 vitc:{name:'Garnier Vitamin C Brightening Serum',img:'https://static.chemistwarehouse.com.au/ams/media/pi/154887/ADD3_800.jpg'},
 niacinamide:{name:'The Ordinary Niacinamide 10% + Zinc 1%',img:'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png?sh=800&sm=fit&sw=800'},
 azelaic:{name:'The Ordinary Azelaic Acid Suspension 10%',img:'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dw711cec9a/Images/products/The%20Ordinary/rdn-azelaic-acid-suspension-10pct-30ml.png?sh=800&sm=fit&sw=800'},
 moisturizer:{name:'CeraVe Daily Moisturizing Lotion',img:'https://africa.cerave.com/en/-/media/Project/Loreal/BrandSites/CeraVe/Master/US/Product/Moisturizers/Gallery/Daily_Moisturizing_Lotion_12oz_FRONT_010_v3_CLNT.png'},
 spf:{name:'La Roche-Posay Anthelios UVMune 400 SPF50+',img:'https://africa.laroche-posay.com/-/media/project/loreal/brand-sites/lrp/emea/za/products/anthelios/uvmune-fluid-non-perfumed/lrpproductpagesunantheliosuvmune400fluidspspf503337875797597frontpng.png?sc_lang=en-za'}
};
const AZELAIC_DAYS=[3,6,10,13,17,20,24,27,30],STORAGE_KEY='skinRoutineState',PHOTO_DB='skinRoutinePhotosV4',PHOTO_STORE='photos',PHOTO_DAYS=[1,10,20,30];
const iso=()=>new Date().toISOString().slice(0,10),dObj=s=>new Date(s+'T00:00:00');
function def(){return{startDate:iso(),completed:{},theme:'light',photoDays:{}}}
function migrate(c){const out={};for(const[k,a0]of Object.entries(c||{})){const day=k.replace(/^day-/,'');const a=Array.isArray(a0)?a0:[],n=new Set();for(const id of a){const map={cleanser:'morning-cleanser',moisturizer:'morning-moisturizer',vitc:'morning-vitc',spf:'morning-spf',niacinamide:'night-niacinamide',azelaic:'night-azelaic'};n.add(map[id]||id)}out['day-'+day]=[...n]}return out}
function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(!s)return def();return{...def(),...s,completed:migrate(s.completed),photoDays:s.photoDays||{}}}catch(e){return def()}}
let state=load(),currentTab='today',previewDay=null,deferredInstall=null,photoTarget=null,timer=null,touchX=0;
const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}};
const currentDay=()=>Math.max(1,Math.min(30,Math.floor((dObj(iso())-dObj(state.startDate))/86400000)+1));
const az=d=>AZELAIC_DAYS.includes(d);
const routine=d=>({morning:[['morning-cleanser','cleanser','Gentle cleanse'],['morning-vitc','vitc','Brightening serum'],['morning-moisturizer','moisturizer','Barrier moisture'],['morning-spf','spf','Sun protection']],night:[['night-cleanser','cleanser','Gentle cleanse'],[az(d)?'night-azelaic':'night-niacinamide',az(d)?'azelaic':'niacinamide',az(d)?'Selected night':'Normal night'],['night-moisturizer','moisturizer','Barrier moisture']]});
const doneSet=d=>new Set(state.completed['day-'+d]||[]);
function toggle(day,id){const s=doneSet(day);s.has(id)?s.delete(id):s.add(id);state.completed['day-'+day]=[...s];save();render('today')}
const all=d=>[...routine(d).morning,...routine(d).night],pct=d=>Math.round(doneSet(d).size/all(d).length*100),completedDays=()=>Array.from({length:30},(_,i)=>pct(i+1)===100).filter(Boolean).length;
function streak(){let n=0;for(let d=Math.min(30,currentDay());d>=1&&pct(d)===100;d--)n++;return n}
function planDate(d){const x=dObj(state.startDate);x.setDate(x.getDate()+d-1);return x.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}
function task(d,id,key,sub){const yes=doneSet(d).has(id),p=PRODUCTS[key];return `<div class="task ${yes?'done':''}" data-day="${d}" data-id="${id}"><button type="button" class="tick" data-action="toggle" data-day="${d}" data-id="${id}" aria-label="Mark ${p.name} done">${yes?'✓':''}</button><span class="task-img" data-product-key="${key}" role="button" tabindex="0" aria-label="View ${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer"></span><span class="task-copy"><b class="product-name">${p.name}</b><small>${sub}</small></span></div>`}
function today(){const d=previewDay||currentDay(),r=routine(d),p=pct(d);return `<div class="home" id="home"><header class="home-head"><div class="day-ring ${p===100?'complete':''}" style="--day-fill:${p}%" aria-label="Day ${d} of 30, ${p}% complete"><span class="day-wave"></span><div class="day-ring-text"><strong>${d}</strong><small>/30</small><em>${p}%</em></div></div><div class="home-date"><div class="home-date-label">Date</div><strong>${planDate(d)}</strong></div></header><section class="routine-stack"><div class="routine-card"><div class="routine-head"><span class="routine-icon">☀️</span><div><b>Morning</b></div></div><div class="task-grid">${r.morning.map(x=>task(d,...x)).join('')}</div></div><div class="routine-card"><div class="routine-head"><span class="routine-icon">🌙</span><div><b>Night</b></div></div><div class="task-grid night-grid">${r.night.map(x=>task(d,...x)).join('')}</div></div></section></div>`}
function days(){const cd=currentDay();return `<div class="tab"><header><div><div class="eyebrow">YOUR PLAN</div><h2>30 Days</h2><p>Tap a day to preview.</p></div><span class="chip">${completedDays()}/30</span></header><div class="days-grid">${Array.from({length:30},(_,i)=>{const n=i+1,p=pct(n),photoDue=[1,10,20,30].includes(n)&&!state.photoDays[n];return `<button type="button" class="day-card ${p===100?'done':''} ${n===cd?'today':''}" data-fill="${p}" data-action="preview" data-preview="${n}"><span class="day-fill"></span><strong>${n}</strong><small>${p}%</small>${photoDue?'<i class="photo-dot" aria-label="Progress photo due"></i>':''}</button>`}).join('')}</div><div class="tab-note">Progress photo reminders: Day 1 · 10 · 20 · 30.</div></div>`}
function photoCard(d){const saved=!!state.photoDays[d];return `<div class="photo-card"><button type="button" class="photo-box ${saved?'has-photo':''}" data-action="photo-view" data-photo-view="${d}" aria-label="${saved?'View':'Add'} Day ${d} progress photo"><span class="photo-placeholder"><b>Day ${d}</b><small>${saved?'Tap to view':'Tap to add photo'}</small></span></button><div class="photo-label">Day ${d}</div><div class="photo-actions"><button type="button" class="photo-btn" data-action="photo-add" data-photo="${d}">${saved?'Replace':'Add photo'}</button>${saved?`<button type="button" class="remove-btn" data-action="photo-remove" data-remove-photo="${d}">Remove</button>`:''}</div></div>`}
function progress(){const cd=completedDays(),p=Math.round(cd/30*100);return `<div class="tab progress-tab"><header><div><div class="eyebrow">YOUR PROGRESS</div><h2>Progress</h2><p>Keep your routine consistent.</p></div><span class="chip">${p}%</span></header><section class="progress-card"><div class="big-number"><strong>${cd}</strong><small>/30 days</small></div><div><b>Completed days</b><small>🔥 ${streak()} day streak</small></div><div class="progress-line wide"><i style="width:${p}%"></i></div></section><div class="photo-title"><b>📸 Progress photos</b><small>Day 1 · 10 · 20 · 30</small></div><div class="photos">${PHOTO_DAYS.map(photoCard).join('')}</div><div class="tab-note">Use similar lighting, distance and angle for a fair visual comparison.</div></div>`}
function render(tab){if(tab)currentTab=tab;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===currentTab));const s=document.getElementById('screen');s.innerHTML=currentTab==='today'?today():currentTab==='days'?days():progress();applyTheme();if(currentTab==='days')document.querySelectorAll('.day-card').forEach(el=>el.style.setProperty('--fill',(el.dataset.fill||0)+'%'));if(currentTab==='progress')setTimeout(hydratePhotos,0)}
function applyTheme(){document.documentElement.dataset.theme=state.theme||'light';const b=document.getElementById('themeQuick');if(b){b.textContent=state.theme==='dark'?'☀':'☾';b.title=state.theme==='dark'?'Tap for day mode':'Tap for dark mode'}const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=state.theme==='dark'?'#171713':'#f6f3ec'}
function toggleTheme(){state.theme=state.theme==='dark'?'light':'dark';save();applyTheme()}
function openSettings(){const modal=document.getElementById('modal');document.getElementById('startDate').value=state.startDate;modal.classList.remove('hidden')}
function closeSettings(){document.getElementById('modal').classList.add('hidden')}
function openDB(){return new Promise((resolve,reject)=>{try{const q=indexedDB.open(PHOTO_DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(PHOTO_STORE))q.result.createObjectStore(PHOTO_STORE)};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)}catch(e){reject(e)}})}
async function putPhoto(d,b){const db=await openDB();return new Promise((res,rej)=>{const t=db.transaction(PHOTO_STORE,'readwrite');t.objectStore(PHOTO_STORE).put(b,String(d));t.oncomplete=()=>{db.close();res()};t.onerror=()=>{db.close();rej(t.error)}})}
async function getPhoto(d){const db=await openDB();return new Promise((res,rej)=>{const q=db.transaction(PHOTO_STORE).objectStore(PHOTO_STORE).get(String(d));q.onsuccess=()=>{db.close();res(q.result)};q.onerror=()=>{db.close();rej(q.error)}})}
async function delPhoto(d){const db=await openDB();return new Promise((res,rej)=>{const t=db.transaction(PHOTO_STORE,'readwrite');t.objectStore(PHOTO_STORE).delete(String(d));t.oncomplete=()=>{db.close();res()};t.onerror=()=>{db.close();rej(t.error)}})}
async function hydratePhotos(){for(const d of PHOTO_DAYS){if(!state.photoDays[d])continue;try{const b=await getPhoto(d);const box=document.querySelector(`[data-photo-view="${d}"]`);if(b&&box){const u=URL.createObjectURL(b);box.innerHTML=`<img src="${u}" alt="Day ${d} progress photo">`;box.dataset.objectUrl=u}}catch(e){}}}
async function removePhoto(d){try{await delPhoto(d)}catch(e){}delete state.photoDays[d];save();render('progress')}
function choosePhoto(d){photoTarget=d;const i=document.getElementById('photoInput');i.value='';i.click()}
function compress(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const max=1200,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?res(b):rej(new Error('compress')), 'image/jpeg',.82)};im.onerror=()=>rej(new Error('image'));im.src=r.result};r.onerror=()=>rej(new Error('file'));r.readAsDataURL(f)})}
async function openPhotoViewer(d){try{const b=await getPhoto(d);if(!b)return;const u=URL.createObjectURL(b),overlay=document.createElement('div');overlay.className='photo-viewer';overlay.innerHTML=`<button class="photo-viewer-close" aria-label="Close">×</button><button class="photo-zoom-out" aria-label="Zoom out">−</button><button class="photo-zoom-in" aria-label="Zoom in">+</button><div class="photo-viewer-stage"><img src="${u}" alt="Day ${d} progress photo"></div><div class="photo-viewer-title">Day ${d} · pinch to zoom · drag to view</div>`;document.body.appendChild(overlay);const stage=overlay.querySelector('.photo-viewer-stage'),img=overlay.querySelector('img');let scale=1,x=0,y=0,lastDist=0,lastX=0,lastY=0,panning=false;const apply=()=>{scale=Math.max(1,Math.min(5,scale));if(scale===1){x=0;y=0}img.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`};const zoomAt=(factor,cx=stage.clientWidth/2,cy=stage.clientHeight/2)=>{const old=scale;scale=Math.max(1,Math.min(5,scale*factor));const ratio=scale/old;x=(x-cx)*ratio+cx;y=(y-cy)*ratio+cy;apply()};overlay.querySelector('.photo-zoom-in').onclick=e=>{e.stopPropagation();zoomAt(1.25)};overlay.querySelector('.photo-zoom-out').onclick=e=>{e.stopPropagation();zoomAt(.8)};stage.addEventListener('touchstart',e=>{if(e.touches.length===2){lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)}else if(e.touches.length===1&&scale>1){panning=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY}},{passive:true});stage.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(lastDist){scale+= (dist-lastDist)/260;apply()}lastDist=dist}else if(e.touches.length===1&&panning&&scale>1){e.preventDefault();x+=e.touches[0].clientX-lastX;y+=e.touches[0].clientY-lastY;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;apply()}},{passive:false});stage.addEventListener('touchend',()=>{lastDist=0;panning=false},{passive:true});stage.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.15:.87,e.clientX-stage.getBoundingClientRect().left,e.clientY-stage.getBoundingClientRect().top)},{passive:false});const close=()=>{URL.revokeObjectURL(u);overlay.remove()};overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.photo-viewer-close'))close()});}catch(e){alert('Unable to open this photo.')}}

const screen=document.getElementById('screen');
// Product image: single tap = tick, press-and-hold = popup. Double-tap is intentionally disabled.
let imageHoldTimer=null,imageHoldFired=false,imageHoldTarget=null;
function clearImageGesture(){clearTimeout(imageHoldTimer);imageHoldTimer=null;imageHoldTarget=null}
function imageGestureStart(e){
  const img=e.target.closest('[data-product-key]');
  if(!img)return;
  imageHoldTarget=img; imageHoldFired=false; clearTimeout(imageHoldTimer);
  imageHoldTimer=setTimeout(()=>{if(imageHoldTarget===img){imageHoldFired=true;openProductViewer(img.dataset.productKey)}},380);
}
function imageGestureEnd(e){
  const img=e.target.closest('[data-product-key]');
  if(!img||img!==imageHoldTarget)return;
  clearTimeout(imageHoldTimer);imageHoldTimer=null;
  if(imageHoldFired){imageHoldFired=false;imageHoldTarget=null;return}
  const task=img.closest('.task');
  if(task){toggle(Number(task.dataset.day),task.dataset.id)}
  imageHoldTarget=null;
}
screen.addEventListener('pointerdown',imageGestureStart,{passive:true});
screen.addEventListener('pointerup',imageGestureEnd,{passive:true});
screen.addEventListener('pointercancel',()=>{clearImageGesture();imageHoldFired=false},{passive:true});
screen.addEventListener('pointerleave',()=>{if(imageHoldTimer){clearTimeout(imageHoldTimer);imageHoldTimer=null}},{passive:true});

screen.addEventListener('click',e=>{try{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action==='toggle'){
    const tick=e.target.closest('.tick');if(!tick)return;
    toggle(Number(tick.dataset.day),tick.dataset.id);return;
  }
  if(action==='preview'){previewDay=Number(e.target.closest('[data-action]').dataset.preview);render('today');return}
  if(action==='photo-view'){
    const el=e.target.closest('[data-action]'),d=Number(el.dataset.photoView);
    // Unsaved slots still use a normal tap to choose a photo. Saved photos use double-tap / long-press to open.
    if(!state.photoDays[d])choosePhoto(d);
    return;
  }
  if(action==='photo-add'){choosePhoto(Number(e.target.closest('[data-action]').dataset.photo));return}
  if(action==='photo-remove'){removePhoto(Number(e.target.closest('[data-action]').dataset.removePhoto));return}
}catch(err){console.error(err)}});

// Progress photo: single tap stays quiet; press-and-hold opens the same zoomable popup.
let photoHoldTimer=null,photoHoldFired=false,photoHoldTarget=null;
function progressPhotoStart(e){const box=e.target.closest('[data-photo-view]');if(!box||!state.photoDays[Number(box.dataset.photoView)])return;photoHoldTarget=box;photoHoldFired=false;clearTimeout(photoHoldTimer);photoHoldTimer=setTimeout(()=>{if(photoHoldTarget===box){photoHoldFired=true;openPhotoViewer(Number(box.dataset.photoView))}},380)}
function progressPhotoEnd(e){const box=e.target.closest('[data-photo-view]');if(!box||box!==photoHoldTarget)return;clearTimeout(photoHoldTimer);photoHoldTimer=null;photoHoldTarget=null;photoHoldFired=false}
screen.addEventListener('pointerdown',progressPhotoStart,{passive:true});
screen.addEventListener('pointerup',progressPhotoEnd,{passive:true});
screen.addEventListener('pointercancel',()=>{clearTimeout(photoHoldTimer);photoHoldTimer=null;photoHoldTarget=null;photoHoldFired=false},{passive:true});

screen.addEventListener('touchstart',e=>{if(currentTab!=='today')return;touchX=e.changedTouches[0].clientX},{passive:true});
screen.addEventListener('touchend',e=>{if(currentTab!=='today')return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>70)moveDay(dx<0?1:-1)},{passive:true});
function moveDay(delta){
  let d=previewDay||currentDay(),next=Math.max(1,Math.min(30,d+delta));if(next===d)return;
  const direction=delta>0?'left':'right',home=document.getElementById('home');
  if(!home){previewDay=next===currentDay()?null:next;render('today');return}
  const screenEl=document.getElementById('screen');
  const oldRect=home.getBoundingClientRect();
  // Render the next day underneath, then split the old screen into two lightweight panels and slide them apart.
  previewDay=next===currentDay()?null:next;render('today');
  const fresh=document.getElementById('home');
  if(!fresh)return;
  const freshRect=fresh.getBoundingClientRect();
  const makeHalf=(side)=>{
    const c=home.cloneNode(true);c.removeAttribute('id');c.className='home split-panel split-'+side;
    c.style.position='fixed';c.style.left=oldRect.left+'px';c.style.top=oldRect.top+'px';c.style.width=oldRect.width+'px';c.style.height=oldRect.height+'px';c.style.margin='0';c.style.zIndex='20';c.style.pointerEvents='none';c.style.overflow='hidden';
    c.style.clipPath=side==='left'?'inset(0 50% 0 0)':'inset(0 0 0 50%)';
    c.style.transformOrigin=side==='left'?'left center':'right center';
    screenEl.appendChild(c);return c;
  };
  const left=makeHalf('left'),right=makeHalf('right');
  // New content stays still; the two old halves wipe outward for a crisp split-screen effect.
  requestAnimationFrame(()=>{left.classList.add(direction==='left'?'split-left-out':'split-left-in');right.classList.add(direction==='left'?'split-right-out':'split-right-in')});
  setTimeout(()=>{left.remove();right.remove()},190);
}

function openProductViewer(key){const p=PRODUCTS[key];const overlay=document.createElement('div');overlay.className='product-viewer';overlay.innerHTML=`<button class="product-viewer-close" aria-label="Close">×</button><button class="product-zoom-out" aria-label="Zoom out">−</button><button class="product-zoom-in" aria-label="Zoom in">+</button><div class="product-viewer-card"><div class="product-viewer-stage"><img src="${p.img}" alt="${p.name}"></div><b>${p.name}</b></div><div class="product-viewer-hint">Tap + / − or pinch to zoom · drag when zoomed</div>`;document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('popup-ready'));const stage=overlay.querySelector('.product-viewer-stage'),img=overlay.querySelector('img');let scale=1,x=0,y=0,lastDist=0,lastX=0,lastY=0,panning=false;const apply=()=>{scale=Math.max(1,Math.min(4,scale));if(scale===1){x=0;y=0}img.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`};const zoomAt=(factor,cx=stage.clientWidth/2,cy=stage.clientHeight/2)=>{const old=scale;scale=Math.max(1,Math.min(4,scale*factor));const ratio=scale/old;x=(x-cx)*ratio+cx;y=(y-cy)*ratio+cy;apply()};overlay.querySelector('.product-zoom-in').onclick=e=>{e.stopPropagation();zoomAt(1.25)};overlay.querySelector('.product-zoom-out').onclick=e=>{e.stopPropagation();zoomAt(.8)};stage.addEventListener('touchstart',e=>{if(e.touches.length===2){lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)}else if(e.touches.length===1&&scale>1){panning=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY}},{passive:true});stage.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(lastDist){scale+=(dist-lastDist)/300;apply()}lastDist=dist}else if(e.touches.length===1&&panning&&scale>1){e.preventDefault();x+=e.touches[0].clientX-lastX;y+=e.touches[0].clientY-lastY;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;apply()}},{passive:false});stage.addEventListener('touchend',()=>{lastDist=0;panning=false},{passive:true});stage.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.15:.87,e.clientX-stage.getBoundingClientRect().left,e.clientY-stage.getBoundingClientRect().top)},{passive:false});const close=()=>overlay.remove();overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.product-viewer-close'))close()})}


const input=document.getElementById('photoInput');input.addEventListener('change',async e=>{const f=e.target.files?.[0],d=photoTarget;if(!f||!d)return;try{await putPhoto(d,await compress(f));state.photoDays[d]=true;save();render('progress')}catch(err){alert('Photo save failed. Please try another image.')}finally{photoTarget=null}});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{previewDay=null;render(b.dataset.tab)}));
document.getElementById('settingsBtn').addEventListener('click',openSettings);document.getElementById('closeModal').addEventListener('click',closeSettings);document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeSettings()});document.getElementById('themeQuick').addEventListener('click',toggleTheme);
document.getElementById('startDate').addEventListener('change',e=>{state.startDate=e.target.value||state.startDate;save();previewDay=null;render('today');closeSettings()});
document.getElementById('installBtn').addEventListener('click',async()=>{if(deferredInstall){try{await deferredInstall.prompt();await deferredInstall.userChoice}catch(e){}deferredInstall=null}else alert('Chrome menu → Install app / Add to Home screen ഉപയോഗിക്കുക.')});
document.getElementById('resetBtn').addEventListener('click',async()=>{if(!confirm('Reset routine progress and photos?'))return;for(const d of PHOTO_DAYS){try{await delPhoto(d)}catch(e){}}const keep={startDate:state.startDate,theme:state.theme};state={...def(),...keep};save();closeSettings();render('today')});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});
if('serviceWorker'in navigator)window.addEventListener('load',()=>{navigator.serviceWorker.register('./service-worker.js?v=17',{scope:'./'}).then(r=>r.update()).catch(()=>{})});
applyTheme();render('today');
