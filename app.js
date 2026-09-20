const PRODUCTS = [
  {name:"CeraVe Foaming Cleanser", key:"cleanser", img:"images/cleanser.png", use:"മുഖം gentle ആയി clean ചെയ്യാൻ.", when:"രാവിലും രാത്രിയും"},
  {name:"Garnier Vitamin C Serum", key:"vitc", img:"images/vitamin-c.png", use:"Morning routine-ൽ bright/even-looking skin support ചെയ്യാൻ.", when:"രാവിലെ"},
  {name:"The Ordinary Niacinamide 10% + Zinc 1%", key:"niacinamide", img:"images/niacinamide.png", use:"Uneven tone / oil control support.", when:"സാധാരണ night"},
  {name:"The Ordinary Azelaic Acid 10%", key:"azelaic", img:"images/azelaic.png", use:"Uneven tone appearance support ചെയ്യാൻ.", when:"തിരഞ്ഞെടുത്ത night"},
  {name:"CeraVe Moisturising Lotion", key:"moisturizer", img:"images/moisturizer.png", use:"Skin barrier moisturise ചെയ്യാൻ.", when:"രാവിലും രാത്രിയും"},
  {name:"La Roche-Posay Anthelios SPF50+", key:"spf", img:"images/sunscreen.png", use:"Sun protection. ഈ routine-ലെ ഏറ്റവും പ്രധാനപ്പെട്ട step.", when:"രാവിലെ + outdoor reapply"}
];

const state = JSON.parse(localStorage.getItem("skinRoutineState") || "null") || {
  startDate: new Date().toISOString().slice(0,10),
  completed: {},
  morningTime:"08:00",
  nightTime:"22:00"
};

function save(){localStorage.setItem("skinRoutineState",JSON.stringify(state));}
function dateObj(s){return new Date(s+"T00:00:00");}
function diffDays(a,b){return Math.floor((dateObj(b)-dateObj(a))/86400000);}
function currentDay(){
  const d=diffDays(state.startDate,new Date().toISOString().slice(0,10))+1;
  return Math.max(1,Math.min(30,d));
}
function dayKey(day){return "day-"+day}
function isAzelaic(day){return [3,6,10,13,17,20,24,27,30].includes(day);}
function routineFor(day){
  return {
    morning:[
      ["cleanser","CeraVe Foaming Cleanser","Gentle cleanse"],
      ["vitc","Garnier Vitamin C Serum","Serum"],
      ["moisturizer","CeraVe Moisturising Lotion","Moisturise"],
      ["spf","La Roche-Posay Anthelios SPF50+","Sun protection"]
    ],
    night:[
      ["cleanser","CeraVe Foaming Cleanser","Gentle cleanse"],
      [isAzelaic(day)?"azelaic":"niacinamide",isAzelaic(day)?"The Ordinary Azelaic Acid 10%":"The Ordinary Niacinamide 10% + Zinc 1%",isAzelaic(day)?"Azelaic night":"Normal night"],
      ["moisturizer","CeraVe Moisturising Lotion","Moisturise"]
    ]
  };
}
function doneSet(day){return new Set(state.completed[dayKey(day)]||[])}
function toggle(day,id){
  const key=dayKey(day); const arr=new Set(state.completed[key]||[]);
  arr.has(id)?arr.delete(id):arr.add(id); state.completed[key]=[...arr]; save(); render();
}
function allTasks(day){const r=routineFor(day);return [...r.morning,...r.night]}
function dayPercent(day){
  const tasks=allTasks(day), done=doneSet(day);
  return Math.round(done.size/tasks.length*100);
}
function totalCompletedDays(){
  let n=0; for(let d=1;d<=30;d++) if(dayPercent(d)===100)n++; return n;
}
function streak(){
  let s=0;
  for(let d=30;d>=1;d--){if(dayPercent(d)===100)s++;else if(s)break;}
  return s;
}
function esc(x){return x.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function taskHTML(day,[id,name,sub]){
  const done=doneSet(day).has(id);
  const unique=id+"-"+day;
  return `<button class="task ${done?"done":""}" data-task="${unique}" onclick="toggle(${day},'${id}')">
    <span class="check">${done?"✓":""}</span>
    <span class="task-main"><span class="task-name">${esc(name)}</span><span class="task-sub">${esc(sub)}</span></span>
    <span class="badge">${done?"DONE":"DO"}</span>
  </button>`;
}
function todayScreen(){
  const d=currentDay(), r=routineFor(d), p=dayPercent(d);
  const date=new Date(dateObj(state.startDate)); date.setDate(date.getDate()+d-1);
  const label=date.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  return `<div class="hero">
    <div class="dayline"><div><div class="day-label">YOUR 30-DAY PLAN</div><div class="day-number">DAY ${d}<span style="font-size:18px;color:var(--muted)"> / 30</span></div></div><div class="date-label">${label}<br>${p}% complete</div></div>
    <div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div>
  </div>
  <div class="section-title"><h3>🌅 Morning</h3><span>${r.morning.length} steps</span></div>
  <div class="routine-card">${r.morning.map(x=>taskHTML(d,x)).join("")}</div>
  <div class="section-title"><h3>🌙 Night</h3><span>${isAzelaic(d)?"Azelaic night":"Normal night"}</span></div>
  <div class="routine-card">${r.night.map(x=>taskHTML(d,x)).join("")}</div>
  <div class="tip">☀️ <b>Sun tip:</b> SPF 50+ രാവിലെ അവസാന step ആയി ഉപയോഗിക്കുക. Outdoor/sweating ഉണ്ടെങ്കിൽ sunscreen വീണ്ടും apply ചെയ്യുക.</div>`;
}
function daysScreen(){
  const d=currentDay();
  return `<div class="section-title"><h2>30 Days</h2><span>Start: ${state.startDate}</span></div>
  <div class="card"><div class="days-grid">${Array.from({length:30},(_,i)=>{let n=i+1,p=dayPercent(n);return `<button class="day-cell ${p===100?"complete":""} ${n===d?"current":""}" onclick="jumpDay(${n})"><strong>${n}</strong><small>${p===100?"✓ Done":p+"%"}</small></button>`}).join("")}</div></div>
  <div class="card"><h3>🌙 Night plan</h3><p class="note">Days ${[3,6,10,13,17,20,24,27,30].join(", ")} are planned as Azelaic Acid nights. Other nights use Niacinamide.</p></div>`;
}
function productsScreen(){
  return `<div class="section-title"><h2>Products</h2><span>6 products</span></div>
  <div class="product-grid">${PRODUCTS.map(p=>`<article class="product-card"><img class="product-img" src="${p.img}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p>${esc(p.use)}</p><p><b>When:</b> ${esc(p.when)}</p></article>`).join("")}</div>`;
}
function progressScreen(){
  const done=totalCompletedDays(), percent=Math.round(done/30*100);
  return `<div class="hero"><div class="day-label">ROUTINE CONSISTENCY</div><div class="progress-big">${done} / 30</div><div class="day-label">fully completed days</div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div>
  <div class="stats"><div class="stat"><span class="day-label">Current streak</span><b>${streak()} 🔥</b></div><div class="stat"><span class="day-label">Completion</span><b>${percent}%</b></div></div>
  <div class="section-title"><h3>📸 Before / After</h3></div>
  <div class="card"><div class="photo-box">Day 1 · Day 15 · Day 30<br><br>Same lighting, distance and angle for a more useful comparison.<br><br><span style="font-size:10px">Photo storage can be added as the next upgrade.</span></div></div>
  <div class="section-title"><h3>☀️ Sun protection</h3></div>
  <div class="card"><div class="tip">SPF 50+ is the key daily protection step. Hat/shade can add extra protection when you are outdoors.</div></div>`;
}
function render(tab=window.currentTab||"today"){
  window.currentTab=tab;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  document.getElementById("screen").innerHTML = tab==="today"?todayScreen():tab==="days"?daysScreen():tab==="products"?productsScreen():progressScreen();
}
function jumpDay(n){
  state.previewDay=n; save();
  window.currentTab="today";
  // Temporary preview without changing plan start date:
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab==="today"));
  const r=routineFor(n), p=dayPercent(n);
  document.getElementById("screen").innerHTML=`<div class="hero"><div class="day-label">PREVIEW</div><div class="day-number">DAY ${n}<span style="font-size:18px;color:var(--muted)"> / 30</span></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div></div>
  <div class="section-title"><h3>🌅 Morning</h3></div><div class="routine-card">${r.morning.map(x=>taskHTML(n,x)).join("")}</div>
  <div class="section-title"><h3>🌙 Night</h3></div><div class="routine-card">${r.night.map(x=>taskHTML(n,x)).join("")}</div>
  <button class="secondary-btn" onclick="render('days')">← Back to 30 Days</button>`;
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>render(b.dataset.tab)));
document.getElementById("settingsBtn").onclick=()=>openSettings();
document.getElementById("closeModal").onclick=()=>document.getElementById("modal").classList.add("hidden");
function openSettings(){
  document.getElementById("startDate").value=state.startDate;
  document.getElementById("morningTime").value=state.morningTime;
  document.getElementById("nightTime").value=state.nightTime;
  document.getElementById("modal").classList.remove("hidden");
}
document.getElementById("startDate").onchange=e=>{state.startDate=e.target.value;save();render("today")};
document.getElementById("morningTime").onchange=e=>{state.morningTime=e.target.value;save()};
document.getElementById("nightTime").onchange=e=>{state.nightTime=e.target.value;save()};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all routine progress?")){state.completed={};save();document.getElementById("modal").classList.add("hidden");render("today")}};
document.getElementById("notifyBtn").onclick=async()=>{
  if(!("Notification" in window)){alert("This browser does not support notifications.");return}
  const p=await Notification.requestPermission();
  alert(p==="granted"?"Notifications enabled.":"Notification permission was not granted.");
};
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}))}
render("today");
