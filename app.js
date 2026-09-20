const PRODUCTS = [
  {name:"CeraVe Foaming Cleanser", key:"cleanser", img:"images/cleanser.png", use:"മുഖം gentle ആയി clean ചെയ്യാൻ.", when:"രാവിലും രാത്രിയും"},
  {name:"Garnier Vitamin C Serum", key:"vitc", img:"images/vitamin-c.png", use:"Morning routine-ൽ bright/even-looking skin support ചെയ്യാൻ.", when:"രാവിലെ"},
  {name:"The Ordinary Niacinamide 10% + Zinc 1%", key:"niacinamide", img:"images/niacinamide.png", use:"Uneven tone / oil control support.", when:"സാധാരണ night"},
  {name:"The Ordinary Azelaic Acid 10%", key:"azelaic", img:"images/azelaic.png", use:"Uneven tone appearance support ചെയ്യാൻ.", when:"തിരഞ്ഞെടുത്ത night"},
  {name:"CeraVe Moisturising Lotion", key:"moisturizer", img:"images/moisturizer.png", use:"Skin barrier moisturise ചെയ്യാൻ.", when:"രാവിലും രാത്രിയും"},
  {name:"La Roche-Posay Anthelios SPF50+", key:"spf", img:"images/sunscreen.png", use:"Sun protection. ഈ routine-ലെ ഏറ്റവും പ്രധാനപ്പെട്ട step.", when:"രാവിലെ + outdoor reapply"}
];

const AZELAIC_DAYS=[3,6,10,13,17,20,24,27,30];
const STORAGE_KEY="skinRoutineState"; // Same key as Version 1, so existing progress is preserved.

function defaultState(){return {startDate:new Date().toISOString().slice(0,10),completed:{},morningTime:"08:00",nightTime:"22:00",photos:{},theme:"light"};}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    const s=raw?JSON.parse(raw):defaultState();
    return Object.assign(defaultState(),s,{completed:s.completed||{},photos:s.photos||{}});
  }catch(e){return defaultState();}
}
let state=loadState();
let currentTab="today";
let previewDay=null;
let deferredInstall=null;
let photoTarget=null;

function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){alert("Storage full. Please remove an old progress photo from Progress and try again.");}}
function dateObj(s){return new Date(s+"T00:00:00");}
function diffDays(a,b){return Math.floor((dateObj(b)-dateObj(a))/86400000);}
function currentDay(){return Math.max(1,Math.min(30,diffDays(state.startDate,new Date().toISOString().slice(0,10))+1));}
function isAzelaic(day){return AZELAIC_DAYS.includes(day);}
function routineFor(day){return {morning:[
  ["cleanser","CeraVe Foaming Cleanser","Gentle cleanse"],
  ["vitc","Garnier Vitamin C Serum","Serum"],
  ["moisturizer","CeraVe Moisturising Lotion","Moisturise"],
  ["spf","La Roche-Posay Anthelios SPF50+","Sun protection"]
],night:[
  ["cleanser","CeraVe Foaming Cleanser","Gentle cleanse"],
  [isAzelaic(day)?"azelaic":"niacinamide",isAzelaic(day)?"The Ordinary Azelaic Acid 10%":"The Ordinary Niacinamide 10% + Zinc 1%",isAzelaic(day)?"Azelaic night":"Normal night"],
  ["moisturizer","CeraVe Moisturising Lotion","Moisturise"]
]};}
function doneSet(day){return new Set(state.completed["day-"+day]||[]);}
function toggle(day,id){const key="day-"+day;const s=doneSet(day);s.has(id)?s.delete(id):s.add(id);state.completed[key]=[...s];save();render();}
function allTasks(day){const r=routineFor(day);return [...r.morning,...r.night];}
function dayPercent(day){const tasks=allTasks(day),done=doneSet(day);return Math.round(done.size/tasks.length*100);}
function totalCompletedDays(){let n=0;for(let d=1;d<=30;d++)if(dayPercent(d)===100)n++;return n;}
function streak(){let s=0;const start=Math.min(30,currentDay());for(let d=start;d>=1;d--){if(dayPercent(d)===100)s++;else break;}return s;}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function taskHTML(day,[id,name,sub]){const done=doneSet(day).has(id);return `<button class="task ${done?"done":""}" onclick="toggle(${day},'${id}')"><span class="check">${done?"✓":""}</span><span class="task-main"><span class="task-name">${esc(name)}</span><span class="task-sub">${esc(sub)}</span></span><span class="badge">${done?"DONE":"DO"}</span></button>`;}
function planDate(day){const d=dateObj(state.startDate);d.setDate(d.getDate()+day-1);return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});}

function todayScreen(){
  const d=previewDay||currentDay(),r=routineFor(d),p=dayPercent(d);
  return `<div class="hero"><div class="dayline"><div><div class="day-label">${previewDay?"DAY PREVIEW":"YOUR 30-DAY PLAN"}</div><div class="day-number">DAY ${d}<span style="font-size:18px;color:var(--muted)"> / 30</span></div></div><div class="date-label">${planDate(d)}<br>${p}% complete</div></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div></div>
  <div class="stats"><div class="stat"><span class="day-label">DONE DAYS</span><b>${totalCompletedDays()} / 30</b></div><div class="stat"><span class="day-label">STREAK</span><b>${streak()} 🔥</b></div></div>
  <div class="section-title"><h3>🌅 Morning</h3><span>4 steps</span></div><div class="routine-card">${r.morning.map(x=>taskHTML(d,x)).join("")}</div>
  <div class="section-title"><h3>🌙 Night</h3><span>${isAzelaic(d)?"Azelaic night":"Normal night"}</span></div><div class="routine-card">${r.night.map(x=>taskHTML(d,x)).join("")}</div>
  <div class="tip">☀️ <b>Sun tip:</b> SPF 50+ രാവിലെ അവസാന step ആയി ഉപയോഗിക്കുക. Outdoor/sweating ഉണ്ടെങ്കിൽ sunscreen വീണ്ടും apply ചെയ്യുക.</div>
  ${previewDay?'<button class="secondary-btn" onclick="previewDay=null;render(\'days\')">← Back to 30 Days</button>':''}`;
}
function daysScreen(){const d=currentDay();return `<div class="section-title"><h2>30 Days</h2><span>Start: ${esc(state.startDate)}</span></div><div class="card"><div class="days-grid">${Array.from({length:30},(_,i)=>{const n=i+1,p=dayPercent(n);return `<button class="day-cell ${p===100?"complete":""} ${n===d?"current":""}" onclick="previewDay=${n};currentTab='today';render()"><strong>${n}</strong><small>${p===100?"✓ Done":p+"%"}</small></button>`}).join("")}</div></div><div class="card"><h3>🌙 Night plan</h3><p class="note">Days ${AZELAIC_DAYS.join(", ")} are planned as Azelaic Acid nights. Other nights use Niacinamide.</p></div>`;}
function productsScreen(){return `<div class="section-title"><h2>Products</h2><span>6 products</span></div><div class="product-grid">${PRODUCTS.map(p=>`<article class="product-card"><img class="product-img" src="${p.img}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p>${esc(p.use)}</p><p><b>When:</b> ${esc(p.when)}</p></article>`).join("")}</div>`;}
function photoCard(day){return `<div class="photo-item"><div class="photo-box">${state.photos[day]?`<img src="${state.photos[day]}" alt="Day ${day} progress photo">`:`<span>Day ${day}<br>photo</span>`}</div><button class="secondary-btn photo-btn" onclick="choosePhoto(${day})">${state.photos[day]?"Replace photo":"Add photo"}</button>${state.photos[day]?`<button class="text-btn" onclick="removePhoto(${day})">Remove</button>`:""}</div>`;}
function progressScreen(){const done=totalCompletedDays(),percent=Math.round(done/30*100);return `<div class="hero"><div class="day-label">ROUTINE CONSISTENCY</div><div class="progress-big">${done} / 30</div><div class="day-label">fully completed days</div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div><div class="stats"><div class="stat"><span class="day-label">CURRENT STREAK</span><b>${streak()} 🔥</b></div><div class="stat"><span class="day-label">COMPLETION</span><b>${percent}%</b></div></div><div class="section-title"><h3>📸 Progress photos</h3><span>Day 1 · 15 · 30</span></div><div class="card"><div class="photo-grid">${[1,15,30].map(photoCard).join("")}</div><p class="note">Same lighting, distance and camera angle ഉപയോഗിച്ചാൽ comparison കൂടുതൽ useful ആയിരിക്കും. Photos ഈ phone/browser-ൽ മാത്രം local ആയി save ചെയ്യും.</p></div><div class="section-title"><h3>☀️ Sun protection</h3></div><div class="card"><div class="tip">SPF 50+ daily use ചെയ്യുക. Outdoor/sweating ഉണ്ടെങ്കിൽ വീണ്ടും apply ചെയ്യുക. Hat/shade കൂടി ഉപയോഗിക്കാം.</div></div>`;}
function render(tab=currentTab){currentTab=tab;document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===currentTab));document.getElementById("screen").innerHTML=currentTab==="today"?todayScreen():currentTab==="days"?daysScreen():currentTab==="products"?productsScreen():progressScreen();applyTheme();}

async function choosePhoto(day){photoTarget=day;const input=document.getElementById("photoInput");input.value="";input.click();}
function removePhoto(day){delete state.photos[day];save();render("progress");}
function compressImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onload=()=>{const max=900;const scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext("2d");ctx.drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",0.78));};img.onerror=reject;img.src=reader.result;};reader.readAsDataURL(file);});}
document.getElementById("photoInput").addEventListener("change",async e=>{const f=e.target.files&&e.target.files[0];if(!f||!photoTarget)return;try{state.photos[photoTarget]=await compressImage(f);save();render("progress");}catch(err){alert("Photo save failed. Please try another image.");}});

function openSettings(){document.getElementById("startDate").value=state.startDate;document.getElementById("morningTime").value=state.morningTime;document.getElementById("nightTime").value=state.nightTime;updateThemeButton();document.getElementById("modal").classList.remove("hidden");}
function closeSettings(){document.getElementById("modal").classList.add("hidden");}
function applyTheme(){document.documentElement.dataset.theme=state.theme||"light";}
function updateThemeButton(){document.getElementById("themeBtn").textContent="🌙 Dark mode: "+(state.theme==="dark"?"ON":"OFF");}

document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{previewDay=null;render(b.dataset.tab);}));
document.getElementById("settingsBtn").onclick=openSettings;
document.getElementById("closeModal").onclick=closeSettings;
document.getElementById("startDate").onchange=e=>{state.startDate=e.target.value;save();previewDay=null;render("today");};
document.getElementById("morningTime").onchange=e=>{state.morningTime=e.target.value;save();};
document.getElementById("nightTime").onchange=e=>{state.nightTime=e.target.value;save();};
document.getElementById("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";save();applyTheme();updateThemeButton();};
document.getElementById("notifyBtn").onclick=async()=>{if(!(typeof Notification!=="undefined")){alert("This browser does not support notifications.");return;}const p=await Notification.requestPermission();alert(p==="granted"?"Notification permission enabled. Reminder scheduling depends on browser/Android support.":"Notification permission was not granted.");};
document.getElementById("installBtn").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;}else{alert("Browser menu-ൽ Install app / Add to Home screen തിരഞ്ഞെടുക്കാം.");}};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all routine progress and progress photos?")){const keep={startDate:state.startDate,morningTime:state.morningTime,nightTime:state.nightTime,theme:state.theme,completed:{},photos:{}};state=keep;save();closeSettings();render("today");}};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;});
window.addEventListener("appinstalled",()=>{deferredInstall=null;});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));}
applyTheme();
render("today");
